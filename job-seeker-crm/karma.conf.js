import { defineConfig } from 'karma';

export default defineConfig({
  basePath: '',
  frameworks: ['jasmine', '@angular-devkit/build-angular'],
  plugins: [
    require('karma-jasmine'),
    require('karma-chrome-launcher'),
    require('karma-jasmine-html-reporter'),
    require('karma-coverage'),
    require('@angular-devkit/build-angular/plugins/karma')
  ],
  client: {
    jasmine: {},
    clearContext: false
  },
  coverageReporter: {
    dir: require('path').join(__dirname, './coverage/job-seeker-crm'),
    subdir: '.',
    reporters: [
      { type: 'html' },
      { type: 'text-summary' }
    ]
  },
  reporters: ['progress', 'kjhtml'],
  port: 9876,
  colors: true,
  logLevel: 'INFO',
  autoWatch: true,
  browsers: ['Chrome'],
  singleRun: false,
  restartOnFileChange: true
});
