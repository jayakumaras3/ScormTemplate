import { Routes } from '@angular/router';
import { courseConfigGuard } from './features/course/guards/course-config.guard';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'course'
  },
  {
    path: 'course',
    canActivate: [courseConfigGuard],
    loadComponent: () =>
      import('./features/course/components/course-shell/course-shell.component').then(
        (m) => m.CourseShellComponent
      )
  },
  {
    path: '**',
    redirectTo: 'course'
  }
];
