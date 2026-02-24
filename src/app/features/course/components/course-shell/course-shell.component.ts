import { AsyncPipe } from '@angular/common';
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
      visitedPageIds: state.progress?.visitedPageIds ?? [],
      currentPageTitle: state.page?.header || state.page?.title || state.currentSectionName,
      currentTranscript: state.page?.transcript ?? '',
      courseName: String(state.config?.template?.CourseName || ''),
      transcriptTitle: String(state.config?.template?.TranscriptName || 'Transcript'),
      menuTitle: String(state.config?.template?.Menutitle || state.config?.template?.MenuName || 'Menu'),
      nextLabel: String(state.config?.template?.NextTitle || ' Next'),
      prevLabel: String(state.config?.template?.Prevtitle || 'Prev'),
      transcriptLabel: `📄 ${String(state.config?.template?.TranscriptName || 'Transcript')}`,
      resumeTitle: String(state.config?.template?.ResumeTitle || 'Resume'),
      resumeMessage: String(state.config?.template?.ResumeHeader || ''),
      resumeYesLabel: String(state.config?.template?.ResumeYES || 'Yes'),
      resumeNoLabel: String(state.config?.template?.ResumeNO || 'No')
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

  closeMenu(): void {
    this.courseStateService.setMenuOpen(false);
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