import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CommunicationEvent, CommunicationType } from '../models/communication.model';

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private readonly log$ = new BehaviorSubject<CommunicationEvent[]>([]);

  get communications$(): Observable<CommunicationEvent[]> {
    return this.log$.asObservable();
  }

  logCommunication(event: CommunicationEvent): void {
    const current = this.log$.value;
    this.log$.next([
      { ...event, timestamp: event.timestamp ?? new Date().toISOString() },
      ...current
    ]);
  }

  simulateChannel(type: CommunicationType, payload: string): void {
    const message = `${type} message queued: ${payload}`;
    this.logCommunication({ type, message, timestamp: new Date().toISOString() });
  }

  clearLog(): void {
    this.log$.next([]);
  }
}
