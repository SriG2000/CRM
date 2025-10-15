import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../shared/material.module';
import { JobSeekerListComponent } from './components/job-seeker-list.component';
import { JobSeekerDetailComponent } from './components/job-seeker-detail.component';

@NgModule({
  declarations: [
    JobSeekerListComponent,
    JobSeekerDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    JobSeekerListComponent,
    JobSeekerDetailComponent
  ]
})
export class JobSeekersModule { }
