import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { JobSeeker } from '../../../models/job-seeker.model';
import { CRM_STATUSES } from '../../../shared/constants';
import { JobSeekerService } from '../../../services/job-seeker.service';

@Component({
  selector: 'app-job-seeker-list',
  templateUrl: './job-seeker-list.component.html',
  styleUrls: ['./job-seeker-list.component.scss']
})
export class JobSeekerListComponent implements OnInit, OnDestroy {
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

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly jobSeekerService: JobSeekerService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadJobSeekers();
    this.filterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.applyFilter(value ?? ''));
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
        this.applyFilter(this.filterControl.value ?? '');
      });
  }

  applyFilter(term: string): void {
    const value = term.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: JobSeeker, filter: string) =>
      data.name.toLowerCase().includes(filter) ||
      data.email.toLowerCase().includes(filter) ||
      data.status.toLowerCase().includes(filter);
    this.dataSource.filter = value;
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
}
