import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { JobSeeker } from '../models/job-seeker.model';

@Injectable({ providedIn: 'root' })
export class JobSeekerService {
  private readonly apiUrl = 'api/job-seekers';

  constructor(private readonly http: HttpClient) {}

  getJobSeekers(): Observable<JobSeeker[]> {
    return this.http.get<JobSeeker[]>(this.apiUrl);
  }

  getJobSeeker(id: number): Observable<JobSeeker> {
    return this.http.get<JobSeeker>(`${this.apiUrl}/${id}`);
  }

  searchJobSeekers(term: string): Observable<JobSeeker[]> {
    const params = term ? new HttpParams().set('name', term) : undefined;
    return this.http.get<JobSeeker[]>(this.apiUrl, { params }).pipe(
      map(jobSeekers => jobSeekers.filter(seeker =>
        seeker.name.toLowerCase().includes(term.toLowerCase()) ||
        seeker.email.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }

  addJobSeeker(jobSeeker: Omit<JobSeeker, 'id'>): Observable<JobSeeker> {
    return this.http.post<JobSeeker>(this.apiUrl, jobSeeker);
  }

  updateJobSeeker(jobSeeker: JobSeeker): Observable<JobSeeker> {
    return this.http.put<JobSeeker>(`${this.apiUrl}/${jobSeeker.id}`, jobSeeker);
  }

  deleteJobSeeker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignToCampaign(jobSeeker: JobSeeker, campaignId: number): Observable<JobSeeker> {
    const updated: JobSeeker = {
      ...jobSeeker,
      campaigns: Array.from(new Set([...(jobSeeker.campaigns ?? []), campaignId]))
    };
    return this.updateJobSeeker(updated);
  }

  removeFromCampaign(jobSeeker: JobSeeker, campaignId: number): Observable<JobSeeker> {
    const updated: JobSeeker = {
      ...jobSeeker,
      campaigns: (jobSeeker.campaigns ?? []).filter(id => id !== campaignId)
    };
    return this.updateJobSeeker(updated);
  }
}
