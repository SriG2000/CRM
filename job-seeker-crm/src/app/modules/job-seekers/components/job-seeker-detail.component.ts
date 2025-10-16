import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { JobSeeker } from '../../../models/job-seeker.model';
import { Campaign } from '../../../models/campaign.model';
import { CRM_STATUSES } from '../../../shared/constants';
import { JobSeekerService } from '../../../services/job-seeker.service';
import { CampaignService } from '../../../services/campaign.service';

@Component({
  selector: 'app-job-seeker-detail',
  templateUrl: './job-seeker-detail.component.html',
  styleUrls: ['./job-seeker-detail.component.scss']
})
export class JobSeekerDetailComponent implements OnInit, OnDestroy {
  jobSeeker?: JobSeeker;
  campaigns: Campaign[] = [];
  readonly statuses = CRM_STATUSES;
  readonly detailForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    status: ['', Validators.required],
    preference: [''],
    lastContacted: [''],
    campaigns: [[] as number[]]
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly jobSeekerService: JobSeekerService,
    private readonly campaignService: CampaignService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.campaignService.getCampaigns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(campaigns => this.campaigns = campaigns);

    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = Number(params.get('id'));
          return this.jobSeekerService.getJobSeeker(id);
        })
      )
      .subscribe(jobSeeker => {
        this.jobSeeker = jobSeeker;
        this.detailForm.patchValue({
          name: jobSeeker.name,
          email: jobSeeker.email,
          status: jobSeeker.status,
          preference: jobSeeker.preference,
          lastContacted: jobSeeker.lastContacted,
          campaigns: jobSeeker.campaigns ?? []
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveChanges(): void {
    if (!this.jobSeeker || this.detailForm.invalid) {
      return;
    }

    const formValue = this.detailForm.value;
    const updated: JobSeeker = {
      ...this.jobSeeker,
      name: formValue.name,
      email: formValue.email,
      status: formValue.status,
      preference: formValue.preference,
      lastContacted: formValue.lastContacted,
      campaigns: formValue.campaigns
    } as JobSeeker;

    this.jobSeekerService.updateJobSeeker(updated)
      .pipe(takeUntil(this.destroy$))
      .subscribe(jobSeeker => {
        this.jobSeeker = jobSeeker;
        this.snackBar.open('Job seeker updated', 'Dismiss', { duration: 2000 });
      });
  }

  markContactedToday(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.detailForm.patchValue({ lastContacted: today });
    this.saveChanges();
  }

  setStatus(status: JobSeeker['status']): void {
    this.detailForm.patchValue({ status });
  }

  toggleCampaign(campaignId: number): void {
    if (!this.jobSeeker) {
      return;
    }
    const selected = this.detailForm.get('campaigns')?.value as number[];
    const isAssigned = selected.includes(campaignId);
    const handler = isAssigned
      ? this.jobSeekerService.removeFromCampaign(this.jobSeeker, campaignId)
      : this.jobSeekerService.assignToCampaign(this.jobSeeker, campaignId);

    handler.pipe(takeUntil(this.destroy$)).subscribe(jobSeeker => {
      this.jobSeeker = jobSeeker;
      this.detailForm.patchValue({ campaigns: jobSeeker.campaigns ?? [] }, { emitEvent: false });
      const message = isAssigned ? 'Removed from campaign' : 'Assigned to campaign';
      this.snackBar.open(message, 'Dismiss', { duration: 2000 });
    });
  }

  backToList(): void {
    this.router.navigate(['/job-seekers']);
  }
}
