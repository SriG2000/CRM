import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { JobSeeker } from '../models/job-seeker.model';
import { Campaign } from '../models/campaign.model';
import { CommunicationEvent } from '../models/communication.model';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const jobSeekers: JobSeeker[] = [
      { id: 1, name: 'Alex Morgan', email: 'alex.morgan@example.com', status: 'Active', lastContacted: '2024-05-10', preference: 'Remote-first', campaigns: [1] },
      { id: 2, name: 'Priya Singh', email: 'priya.singh@example.com', status: 'Pipeline', lastContacted: '2024-05-05', preference: 'Full-time', campaigns: [1, 2] },
      { id: 3, name: 'Diego Ramirez', email: 'diego.ramirez@example.com', status: 'Later', lastContacted: '2024-04-28', preference: 'Hybrid', campaigns: [] },
      { id: 4, name: 'Morgan Lee', email: 'morgan.lee@example.com', status: 'Prefs', lastContacted: '2024-04-20', preference: 'Contract', campaigns: [3] },
      { id: 5, name: 'Jamie Fox', email: 'jamie.fox@example.com', status: 'NoResp', lastContacted: '2024-04-15', preference: 'Remote-first', campaigns: [] }
    ];

    const campaigns: Campaign[] = [
      { id: 1, name: 'Job Invitation', stage: 'Initial Outreach', active: true, startDate: '2024-04-01', endDate: '2024-04-15' },
      { id: 2, name: 'Drip 1A', stage: 'Nurture', active: true, startDate: '2024-04-16', endDate: '2024-04-30' },
      { id: 3, name: 'Re-Engagement', stage: 'Reactivation', active: false, startDate: '2024-03-05', endDate: '2024-03-12' }
    ];

    const communications: CommunicationEvent[] = [
      { type: 'AI Voice', message: 'Initial voicemail sent to Alex Morgan.', timestamp: new Date().toISOString() },
      { type: 'WhatsApp', message: 'Follow-up message scheduled for Priya Singh.', timestamp: new Date().toISOString() }
    ];

    return { 'job-seekers': jobSeekers, campaigns, communications };
  }

  genId(jobSeekers: JobSeeker[]): number {
    return jobSeekers.length > 0 ? Math.max(...jobSeekers.map(seeker => seeker.id)) + 1 : 1;
  }
}
