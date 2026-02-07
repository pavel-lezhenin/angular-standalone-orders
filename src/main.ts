import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig, initializeApp } from './app/app.config';
import { App } from './app/app';
import { AuthService } from './app/core';
import { DatabaseService } from './app/core';

bootstrapApplication(App, appConfig)
  .then(async (appRef) => {
    const authService = appRef.injector.get(AuthService);
    const db = appRef.injector.get(DatabaseService);

    // Initialize BFF layer
    await initializeApp(authService, db);
  })
  .catch((err) => console.error(err));

