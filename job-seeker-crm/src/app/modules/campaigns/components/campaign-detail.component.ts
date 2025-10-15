import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { Campaign } from '../../../models/campaign.model';
import { CampaignService } from '../../../services/campaign.service';

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.scss']
})
export class CampaignDetailComponent implements OnInit, OnDestroy {
  campaign?: Campaign;
  readonly form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    stage: ['', Validators.required],
    active: [false],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly campaignService: CampaignService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = Number(params.get('id'));
          return this.campaignService.getCampaign(id);
        })
      )
      .subscribe(campaign => {
        this.campaign = campaign;
        this.form.patchValue(campaign);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (!this.campaign || this.form.invalid) {
      return;
    }

    const updated: Campaign = {
      ...this.campaign,
      ...this.form.value
    } as Campaign;

    this.campaignService.updateCampaign(updated)
      .pipe(takeUntil(this.destroy$))
      .subscribe(campaign => {
        this.campaign = campaign;
        this.snackBar.open('Campaign updated', 'Dismiss', { duration: 2000 });
      });
  }

  sendPreview(): void {
    if (!this.campaign) {
      return;
    }

    this.campaignService.launchCampaign(this.campaign)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open('Preview sent via AI voice & chatbot', 'Dismiss', { duration: 2000 });
      });
  }

  back(): void {
    this.router.navigate(['/campaigns']);
  }
}
