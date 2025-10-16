import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { Campaign } from '../models/campaign.model';
import { CommunicationService } from './communication.service';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly apiUrl = 'api/campaigns';

  constructor(
    private readonly http: HttpClient,
    private readonly communicationService: CommunicationService
  ) {}

  getCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  getCampaign(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`);
  }

  createCampaign(campaign: Omit<Campaign, 'id'>): Observable<Campaign> {
    return this.http.post<Campaign>(this.apiUrl, campaign);
  }

  updateCampaign(campaign: Campaign): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/${campaign.id}`, campaign);
  }

  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  launchCampaign(campaign: Campaign): Observable<Campaign> {
    return this.updateCampaign({ ...campaign, active: true }).pipe(
      tap(() => this.communicationService.logCommunication({
        type: 'AI Voice',
        message: `${campaign.name} launched for ${campaign.stage}.`,
        timestamp: new Date().toISOString()
      }))
    );
  }
}
