import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { Campaign } from '../../../models/campaign.model';
import { CampaignService } from '../../../services/campaign.service';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit, OnDestroy {
  readonly displayedColumns = ['name', 'stage', 'active', 'dates', 'actions'];
  readonly dataSource = new MatTableDataSource<Campaign>([]);
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly campaignService: CampaignService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCampaigns(): void {
    this.campaignService.getCampaigns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(campaigns => this.dataSource.data = campaigns);
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
}
