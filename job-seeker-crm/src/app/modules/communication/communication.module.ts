import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../shared/material.module';
import { CommunicationPanelComponent } from './components/communication-panel.component';

@NgModule({
  declarations: [CommunicationPanelComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  exports: [CommunicationPanelComponent]
})
export class CommunicationModule { }
