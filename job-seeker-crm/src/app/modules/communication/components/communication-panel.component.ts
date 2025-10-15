import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { CommunicationService } from '../../../services/communication.service';
import { CommunicationEvent, CommunicationType } from '../../../models/communication.model';

@Component({
  selector: 'app-communication-panel',
  templateUrl: './communication-panel.component.html',
  styleUrls: ['./communication-panel.component.scss']
})
export class CommunicationPanelComponent implements OnInit, OnDestroy {
  readonly channels: CommunicationType[] = ['AI Voice', 'Chatbot', 'WhatsApp', 'Recruiter Call'];
  readonly messageForm: FormGroup = this.fb.group({
    message: ['', Validators.required]
  });

  selectedChannel: CommunicationType = 'AI Voice';
  communications: CommunicationEvent[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly communicationService: CommunicationService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.communicationService.communications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => (this.communications = events));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectChannel(channel: CommunicationType): void {
    this.selectedChannel = channel;
  }

  send(): void {
    if (this.messageForm.invalid) {
      return;
    }

    const message = this.messageForm.value.message as string;
    this.communicationService.simulateChannel(this.selectedChannel, message);
    this.messageForm.reset();
    this.snackBar.open(`${this.selectedChannel} message queued`, 'Dismiss', { duration: 2000 });
  }
}
