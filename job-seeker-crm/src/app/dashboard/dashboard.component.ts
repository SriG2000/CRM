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
  statusBreakdown: Array<{ status: string; count: number; percentage: number }> = [];
  pipelineMomentum = 0;
  averageTouchpointCadence = 0;
  nextCampaign?: Campaign;

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

        this.statusBreakdown = CRM_STATUSES.map(status => {
          const count = counts.get(status) ?? 0;
          const percentage = this.totals.overall ? Math.round((count / this.totals.overall) * 100) : 0;
          return { status, count, percentage };
        });

        const activeOrPipeline = (counts.get('Active') ?? 0) + (counts.get('Pipeline') ?? 0);
        this.pipelineMomentum = this.totals.overall ? Math.round((activeOrPipeline / this.totals.overall) * 100) : 0;

        const today = new Date();
        const cadences = jobSeekers
          .map(seeker => Math.max(0, Math.round((today.getTime() - new Date(seeker.lastContacted).getTime()) / (1000 * 60 * 60 * 24))))
          .filter(days => !Number.isNaN(days));
        this.averageTouchpointCadence = cadences.length ? Math.round(cadences.reduce((sum, days) => sum + days, 0) / cadences.length) : 0;

        this.campaigns = campaigns;
        this.totals.activeCampaigns = campaigns.filter(c => c.active).length;
        this.totals.scheduledCampaigns = campaigns.filter(c => !c.active).length;
        this.nextCampaign = campaigns
          .slice()
          .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
