import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of, switchMap, takeUntil } from 'rxjs';

import { Campaign } from '../../../models/campaign.model';
import { CampaignService } from '../../../services/campaign.service';
import { CommunicationService } from '../../../services/communication.service';

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.scss']
})
export class CampaignDetailComponent implements OnInit, OnDestroy {
  campaign?: Campaign;
  isNew = false;
  readonly stageOptions: Campaign['stage'][] = ['Initial Outreach', 'Nurture', 'Reactivation', 'Offer'];
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
    private readonly communicationService: CommunicationService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const idParam = params.get('id');
          if (!idParam || idParam === 'new') {
            this.isNew = true;
            const today = new Date().toISOString().substring(0, 10);
            this.form.reset({
              name: '',
              stage: this.stageOptions[0],
              active: true,
              startDate: today,
              endDate: today
            });
            return of(null);
          }

          const id = Number(idParam);
          if (Number.isNaN(id)) {
            this.router.navigate(['/campaigns']);
            return of(null);
          }

          this.isNew = false;
          return this.campaignService.getCampaign(id);
        })
      )
      .subscribe(campaign => {
        if (!campaign) {
          this.campaign = undefined;
          return;
        }
        this.campaign = campaign;
        this.form.patchValue(campaign);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const payload = this.form.value;
    const request$ = this.isNew
      ? this.campaignService.createCampaign(payload as Omit<Campaign, 'id'>)
      : this.campaignService.updateCampaign({ ...this.campaign!, ...payload } as Campaign);

    const creating = this.isNew;

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe(campaign => {
        this.campaign = campaign;
        this.isNew = false;
        this.snackBar.open(creating ? 'Campaign created' : 'Campaign updated', 'Dismiss', { duration: 2000 });
        if (creating) {
          this.router.navigate(['/campaigns', campaign.id]);
        }
      });
  }

  sendPreview(): void {
    if (!this.form.valid) {
      return;
    }

    const name = this.form.value.name as string;
    const stage = this.form.value.stage as string;
    this.communicationService.simulateChannel('AI Voice', `${name} preview call scheduled for ${stage}.`);
    this.communicationService.simulateChannel('Chatbot', `${name} drip sequence prepped for ${stage}.`);
    this.snackBar.open('Preview messages queued across channels', 'Dismiss', { duration: 2000 });
  }

  back(): void {
    this.router.navigate(['/campaigns']);
  }
}
