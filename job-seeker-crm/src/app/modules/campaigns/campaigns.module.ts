import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../shared/material.module';
import { CampaignListComponent } from './components/campaign-list.component';
import { CampaignDetailComponent } from './components/campaign-detail.component';

@NgModule({
  declarations: [
    CampaignListComponent,
    CampaignDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    CampaignListComponent,
    CampaignDetailComponent
  ]
})
export class CampaignsModule { }
