import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly navLinks = [
    { label: 'Dashboard', path: '/', icon: 'insights' },
    { label: 'Job Seekers', path: '/job-seekers', icon: 'people' },
    { label: 'Campaigns', path: '/campaigns', icon: 'campaign' },
    { label: 'Communication', path: '/communication', icon: 'forum' }
  ];
}
