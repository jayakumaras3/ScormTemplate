import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ConfigLoaderService } from '@core/services/config-loader.service';
import { CourseStateService } from '@core/services/course-state.service';

export const courseConfigGuard: CanActivateFn = () => {
  const configLoaderService = inject(ConfigLoaderService);
  const courseStateService = inject(CourseStateService);

  return configLoaderService.loadConfig().pipe(
    map((config) => {
      courseStateService.initialize(config);
      return true;
    }),
    catchError((error) => {
      const message = error instanceof Error ? error.message : 'Unable to load course config';
      courseStateService.setError(message);
      return of(true);
    })
  );
};
