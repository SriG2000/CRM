import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Job Seekers', path: '/job-seekers' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'Communication', path: '/communication' }
  ];
}
