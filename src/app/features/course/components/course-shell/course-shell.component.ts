import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { CourseStateService } from '@core/services/course-state.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';
import { TranscriptPanelComponent } from '../transcript-panel/transcript-panel.component';
import { ResumeDialogComponent } from '../resume-dialog/resume-dialog.component';
import { PageViewComponent } from '../../pages/page-view/page-view.component';

@Component({
  selector: 'app-course-shell',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    LoadingSpinnerComponent,
    SidebarMenuComponent,
    NavigationBarComponent,
    TranscriptPanelComponent,
    ResumeDialogComponent,
    PageViewComponent
  ],
  templateUrl: './course-shell.component.html',
  styleUrls: ['./course-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseShellComponent {
  private readonly courseStateService = inject(CourseStateService);

  readonly vm$ = combineLatest({
    config: this.courseStateService.config$,
    page: this.courseStateService.currentPage$,
    pages: this.courseStateService.pages$,
    currentPageIndex: this.courseStateService.currentPageIndex$,
    currentSectionName: this.courseStateService.currentSectionName$,
    loading: this.courseStateService.loading$,
    error: this.courseStateService.error$,
    progress: this.courseStateService.progress$,
    canAdvance: this.courseStateService.canAdvance$,
    completion: this.courseStateService.completionPercentage$,
    transcriptOpen: this.courseStateService.transcriptOpen$,
    transcriptEntries: this.courseStateService.transcriptEntries$,
    menuOpen: this.courseStateService.menuOpen$,
    showResumeDialog: this.courseStateService.showResumeDialog$
  }).pipe(
    map((state) => ({
      ...state,
      canGoBack: state.currentPageIndex > 0,
      visitedPageIds: state.progress?.visitedPageIds ?? []
    }))
  );

  goNext(): void {
    this.courseStateService.goNext();
  }

  goBack(): void {
    this.courseStateService.goBack();
  }

  goToPage(index: number): void {
    this.courseStateService.goToPage(index);
  }

  selectMenuPage(index: number): void {
    this.courseStateService.goToPage(index);
    this.courseStateService.setMenuOpen(false);
  }

  toggleTranscript(): void {
    this.courseStateService.toggleTranscript();
  }

  toggleMenu(): void {
    this.courseStateService.toggleMenu();
  }

  toggleAudio(): void {
    this.courseStateService.toggleAudioEnabled();
  }

  resumeCourse(): void {
    this.courseStateService.resumeCourse();
  }

  restartCourse(): void {
    this.courseStateService.restartCourse();
  }
}