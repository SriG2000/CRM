import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { JobSeeker } from '../../../models/job-seeker.model';
import { CRM_STATUSES } from '../../../shared/constants';
import { JobSeekerService } from '../../../services/job-seeker.service';
import { CampaignService } from '../../../services/campaign.service';

@Component({
  selector: 'app-job-seeker-list',
  templateUrl: './job-seeker-list.component.html',
  styleUrls: ['./job-seeker-list.component.scss']
})
export class JobSeekerListComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly displayedColumns = ['name', 'email', 'status', 'preference', 'lastContacted', 'campaigns', 'actions'];
  readonly statuses = CRM_STATUSES;
  readonly dataSource = new MatTableDataSource<JobSeeker>([]);
  readonly filterControl = this.fb.control('');
  readonly createForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    status: ['Pipeline', Validators.required],
    preference: [''],
    lastContacted: [new Date().toISOString().substring(0, 10)]
  });

  statusSummary: Array<{ label: JobSeeker['status'] | 'All'; count: number; accent: 'primary' | 'accent' | 'warn' | undefined }> = [];
  selectedStatus: JobSeeker['status'] | 'All' = 'All';
  campaignLookup = new Map<number, string>();

  private searchTerm = '';
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private readonly jobSeekerService: JobSeekerService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly campaignService: CampaignService
  ) {
    this.dataSource.filterPredicate = (data, filter) => {
      if (!filter) {
        return true;
      }

      let criteria: { search: string; status: JobSeeker['status'] | null } = { search: '', status: null };
      try {
        criteria = JSON.parse(filter) as { search: string; status: JobSeeker['status'] | null };
      } catch {
        return true;
      }

      const matchesSearch = !criteria.search ||
        data.name.toLowerCase().includes(criteria.search) ||
        data.email.toLowerCase().includes(criteria.search) ||
        data.status.toLowerCase().includes(criteria.search);
      const matchesStatus = !criteria.status || data.status === criteria.status;
      return matchesSearch && matchesStatus;
    };
  }

  ngOnInit(): void {
    this.loadJobSeekers();
    this.filterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.applyFilter(value ?? ''));

    this.campaignService.getCampaigns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(campaigns => {
        this.campaignLookup = new Map(campaigns.map(campaign => [campaign.id, campaign.name]));
      });
    this.updateTableFilter();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadJobSeekers(): void {
    this.jobSeekerService.getJobSeekers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(jobSeekers => {
        this.dataSource.data = jobSeekers;
        this.refreshStatusSummary(jobSeekers);
        this.updateTableFilter();
      });
  }

  applyFilter(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.updateTableFilter();
  }

  filterByStatus(status: JobSeeker['status'] | 'All'): void {
    this.selectedStatus = status;
    this.updateTableFilter();
  }

  createJobSeeker(): void {
    if (this.createForm.invalid) {
      return;
    }
    const payload = this.createForm.value;
    this.jobSeekerService.addJobSeeker({
      name: payload.name,
      email: payload.email,
      status: payload.status,
      preference: payload.preference,
      lastContacted: payload.lastContacted,
      campaigns: []
    }).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackBar.open('Job seeker added', 'Dismiss', { duration: 2000 });
      this.createForm.reset({
        name: '',
        email: '',
        status: 'Pipeline',
        preference: '',
        lastContacted: new Date().toISOString().substring(0, 10)
      });
      this.loadJobSeekers();
    });
  }

  updateStatus(jobSeeker: JobSeeker, status: string): void {
    this.jobSeekerService.updateJobSeeker({ ...jobSeeker, status: status as JobSeeker['status'] })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(`${jobSeeker.name} moved to ${status}`, 'Dismiss', { duration: 2000 });
        this.loadJobSeekers();
      });
  }

  deleteJobSeeker(jobSeeker: JobSeeker): void {
    this.jobSeekerService.deleteJobSeeker(jobSeeker.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open('Job seeker removed', 'Dismiss', { duration: 2000 });
        this.loadJobSeekers();
      });
  }

  viewDetails(jobSeeker: JobSeeker): void {
    this.router.navigate(['/job-seekers', jobSeeker.id]);
  }

  campaignName(id: number): string {
    return this.campaignLookup.get(id) ?? `#${id}`;
  }

  private updateTableFilter(): void {
    const filterCriteria = {
      search: this.searchTerm,
      status: this.selectedStatus === 'All' ? null : this.selectedStatus
    };
    this.dataSource.filter = JSON.stringify(filterCriteria);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private refreshStatusSummary(jobSeekers: JobSeeker[]): void {
    const counts = new Map<JobSeeker['status'], number>();
    this.statuses.forEach(status => counts.set(status, 0));
    for (const seeker of jobSeekers) {
      counts.set(seeker.status, (counts.get(seeker.status) ?? 0) + 1);
    }

    this.statusSummary = [
      { label: 'All', count: jobSeekers.length, accent: 'primary' }
    ];

    this.statuses.forEach(status => {
      const accent = status === 'Active' ? 'primary' : status === 'Pipeline' ? 'accent' : undefined;
      this.statusSummary.push({ label: status, count: counts.get(status) ?? 0, accent });
    });
  }
}
