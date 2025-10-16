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
  readonly channelDescriptions: Record<CommunicationType, string> = {
    'AI Voice': 'Drop an AI-assisted voicemail to spark a high-touch response.',
    'Chatbot': 'Trigger conversational nudges to warm candidates asynchronously.',
    'WhatsApp': 'Send personal outreach where candidates already respond fastest.',
    'Recruiter Call': 'Log recruiter follow-ups to coordinate with the AI sequences.'
  };
  readonly templates: Array<{ label: string; message: string }> = [
    { label: 'Availability check-in', message: 'Hi there! Checking if you have 10 minutes to talk about the new role we discussed.' },
    { label: 'Interview reminder', message: 'Reminder: your interview is coming up tomorrow. Let me know if you need anything beforehand.' },
    { label: 'Offer teaser', message: 'Exciting update! We have new compensation details ready—can we connect today?' }
  ];

  selectedChannel: CommunicationType = 'AI Voice';
  communications: CommunicationEvent[] = [];
  activitySummary: Record<CommunicationType, number> = {
    'AI Voice': 0,
    'Chatbot': 0,
    'WhatsApp': 0,
    'Recruiter Call': 0
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly communicationService: CommunicationService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.communicationService.communications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => {
        this.communications = events;
        this.activitySummary = this.channels.reduce((acc, channel) => {
          acc[channel] = events.filter(event => event.type === channel).length;
          return acc;
        }, {} as Record<CommunicationType, number>);
      });
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

  useTemplate(template: string): void {
    this.messageForm.patchValue({ message: template });
  }

  clearLog(): void {
    this.communicationService.clearLog();
    this.snackBar.open('Engagement log cleared', 'Dismiss', { duration: 2000 });
  }
}
