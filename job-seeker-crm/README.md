# Job Seeker CRM

This Angular 18 application provides a lightweight CRM for managing job seekers, running outreach campaigns and coordinating multi-channel communication.

## Getting started

```bash
npm install
npm start
```

Angular CLI (v18+) and the Angular Material component library are declared as project dependencies. The install step downloads
the CLI locally so that commands such as `ng test` and `ng build` work without requiring a global installation.

The app uses Angular's in-memory web API to mock data for job seekers, campaigns and communication events.

## Testing

Run unit tests with Karma once dependencies are installed:

```bash
npm test
```

> **Note:** Running the install or test commands requires network access to the npm registry so they may fail in offline or
firewalled environments.

## Project structure

```
src/app/
  modules/
    job-seekers/
    campaigns/
    communication/
  services/
  models/
  dashboard/
```

Each feature module encapsulates its components and leverages shared Angular Material UI components.
