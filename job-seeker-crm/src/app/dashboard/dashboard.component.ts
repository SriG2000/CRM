import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';

import { JobSeeker } from '../models/job-seeker.model';
import { Campaign } from '../models/campaign.model';
import { JobSeekerService } from '../services/job-seeker.service';
import { CampaignService } from '../services/campaign.service';
import { CRM_STATUSES } from '../shared/constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  totals = {
    overall: 0,
    byStatus: new Map<string, number>(),
    activeCampaigns: 0,
    scheduledCampaigns: 0
  };
  recentJobSeekers: JobSeeker[] = [];
  campaigns: Campaign[] = [];

  readonly statuses = CRM_STATUSES;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly jobSeekerService: JobSeekerService,
    private readonly campaignService: CampaignService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.jobSeekerService.getJobSeekers(),
      this.campaignService.getCampaigns()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([jobSeekers, campaigns]) => {
        this.recentJobSeekers = jobSeekers
          .slice()
          .sort((a, b) => b.lastContacted.localeCompare(a.lastContacted))
          .slice(0, 5);

        this.totals.overall = jobSeekers.length;
        const counts = new Map<string, number>();
        CRM_STATUSES.forEach(status => counts.set(status, 0));
        for (const seeker of jobSeekers) {
          counts.set(seeker.status, (counts.get(seeker.status) ?? 0) + 1);
        }
        this.totals.byStatus = counts;

        this.campaigns = campaigns;
        this.totals.activeCampaigns = campaigns.filter(c => c.active).length;
        this.totals.scheduledCampaigns = campaigns.filter(c => !c.active).length;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
