import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { JobSeekerListComponent } from './modules/job-seekers/components/job-seeker-list.component';
import { JobSeekerDetailComponent } from './modules/job-seekers/components/job-seeker-detail.component';
import { CampaignListComponent } from './modules/campaigns/components/campaign-list.component';
import { CampaignDetailComponent } from './modules/campaigns/components/campaign-detail.component';
import { CommunicationPanelComponent } from './modules/communication/components/communication-panel.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'job-seekers', component: JobSeekerListComponent },
  { path: 'job-seekers/:id', component: JobSeekerDetailComponent },
  { path: 'campaigns', component: CampaignListComponent },
  { path: 'campaigns/:id', component: CampaignDetailComponent },
  { path: 'communication', component: CommunicationPanelComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
