import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Campaign } from '../../../models/campaign.model';
import { CampaignService } from '../../../services/campaign.service';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly displayedColumns = ['name', 'stage', 'active', 'dates', 'actions'];
  readonly dataSource = new MatTableDataSource<Campaign>([]);
  readonly filterControl = this.fb.control('');
  readonly stages: Campaign['stage'][] = ['Initial Outreach', 'Nurture', 'Reactivation', 'Offer'];
  readonly createForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    stage: ['Initial Outreach', Validators.required],
    active: [true],
    startDate: [new Date().toISOString().substring(0, 10), Validators.required],
    endDate: [new Date().toISOString().substring(0, 10), Validators.required]
  });
  stageFilter: Campaign['stage'] | 'All' = 'All';
  metrics = { total: 0, active: 0, paused: 0 };
  private searchTerm = '';
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private readonly fb: FormBuilder,
    private readonly campaignService: CampaignService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = (campaign, filter) => {
      if (!filter) {
        return true;
      }

      let criteria: { search: string; stage: Campaign['stage'] | null } = { search: '', stage: null };
      try {
        criteria = JSON.parse(filter) as { search: string; stage: Campaign['stage'] | null };
      } catch {
        return true;
      }

      const matchesSearch = !criteria.search ||
        campaign.name.toLowerCase().includes(criteria.search) ||
        campaign.stage.toLowerCase().includes(criteria.search);
      const matchesStage = !criteria.stage || campaign.stage === criteria.stage;
      return matchesSearch && matchesStage;
    };
  }

  ngOnInit(): void {
    this.loadCampaigns();
    this.filterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.applyFilter(value ?? ''));
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

  loadCampaigns(): void {
    this.campaignService.getCampaigns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(campaigns => {
        this.dataSource.data = campaigns;
        this.metrics.total = campaigns.length;
        this.metrics.active = campaigns.filter(c => c.active).length;
        this.metrics.paused = campaigns.filter(c => !c.active).length;
        this.updateFilter();
      });
  }

  toggleActive(campaign: Campaign): void {
    const updated = { ...campaign, active: !campaign.active };
    this.campaignService.updateCampaign(updated)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(`${campaign.name} ${updated.active ? 'activated' : 'paused'}`, 'Dismiss', { duration: 2000 });
        this.loadCampaigns();
      });
  }

  launchCampaign(campaign: Campaign): void {
    this.campaignService.launchCampaign(campaign)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(`${campaign.name} launched`, 'Dismiss', { duration: 2000 });
        this.loadCampaigns();
      });
  }

  viewDetails(campaign: Campaign): void {
    this.router.navigate(['/campaigns', campaign.id]);
  }

  applyFilter(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.updateFilter();
  }

  filterByStage(stage: Campaign['stage'] | 'All'): void {
    this.stageFilter = stage;
    this.updateFilter();
  }

  createCampaign(): void {
    if (this.createForm.invalid) {
      return;
    }

    const payload = this.createForm.value;
    this.campaignService.createCampaign({
      name: payload.name,
      stage: payload.stage,
      active: payload.active,
      startDate: payload.startDate,
      endDate: payload.endDate
    }).pipe(takeUntil(this.destroy$)).subscribe(campaign => {
      this.snackBar.open(`${campaign.name} created`, 'Dismiss', { duration: 2000 });
      const today = new Date().toISOString().substring(0, 10);
      this.createForm.reset({
        name: '',
        stage: 'Initial Outreach',
        active: true,
        startDate: today,
        endDate: today
      });
      this.loadCampaigns();
    });
  }

  goToCreate(): void {
    this.router.navigate(['/campaigns', 'new']);
  }

  private updateFilter(): void {
    const criteria = {
      search: this.searchTerm,
      stage: this.stageFilter === 'All' ? null : this.stageFilter
    };
    this.dataSource.filter = JSON.stringify(criteria);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
