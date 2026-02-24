import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { CourseConfig, CourseProgress, TocPage, TranscriptEntry } from '@core/models/course.models';
import { ProgressTrackerService } from '@core/services/progress-tracker.service';
import { ScormService } from '@core/services/scorm.service';

@Injectable({
  providedIn: 'root'
})
export class CourseStateService {
  private readonly configSubject = new BehaviorSubject<CourseConfig | null>(null);
  private readonly currentPageIndexSubject = new BehaviorSubject<number>(0);
  private readonly moduleIdSubject = new BehaviorSubject<number>(0);
  private readonly audioEnabledSubject = new BehaviorSubject<boolean>(true);
  private readonly menuOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly transcriptOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly showResumeDialogSubject = new BehaviorSubject<boolean>(false);
  private readonly progressSubject = new BehaviorSubject<CourseProgress | null>(null);

  readonly config$ = this.configSubject.asObservable();
  readonly currentPageIndex$ = this.currentPageIndexSubject.asObservable();
  readonly moduleId$ = this.moduleIdSubject.asObservable();
  readonly audioEnabled$ = this.audioEnabledSubject.asObservable();
  readonly menuOpen$ = this.menuOpenSubject.asObservable();
  readonly transcriptOpen$ = this.transcriptOpenSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly showResumeDialog$ = this.showResumeDialogSubject.asObservable();
  readonly progress$ = this.progressSubject.asObservable();

  readonly pages$ = this.config$.pipe(map((config) => config?.pages ?? []));
  readonly currentPage$ = combineLatest([this.pages$, this.currentPageIndex$]).pipe(
    map(([pages, index]) => pages[index] ?? null)
  );
  readonly currentSectionName$ = combineLatest([this.moduleId$, this.pages$]).pipe(
    map(([moduleId, pages]) => {
      // Try to get section name from pages with matching module
      const pagesInModule = pages.filter((p: TocPage) => (p.settings.module ?? 0) === moduleId);
      if (pagesInModule.length > 0) {
        // Get unique section names from pages in this module by their group
        const firstPage = pagesInModule[0];
        // If we have multiple pages, derive from title pattern or use page header
        return firstPage.header || `Module ${moduleId + 1}`;
      }
      return `Module ${moduleId + 1}`;
    })
  );
  readonly completionPercentage$ = this.progress$.pipe(
    map((progress) => progress?.completionPercentage ?? 0)
  );
  readonly canAdvance$ = combineLatest([this.pages$, this.currentPageIndex$]).pipe(
    map(([pages, index]) => index < pages.length - 1)
  );
  readonly transcriptEntries$ = combineLatest([this.pages$, this.progress$]).pipe(
    map(([pages, progress]) => this.buildTranscriptEntries(pages, progress))
  );

  constructor(
    private progressTrackerService: ProgressTrackerService,
    private scormService: ScormService
  ) {}

  initialize(config: CourseConfig): void {
    this.configSubject.next(config);
    this.audioEnabledSubject.next(Boolean(config.template.AudioVersionEnable));
    this.menuOpenSubject.next(false);
    this.showResumeDialogSubject.next(false);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
    this.scormService.initialize();

    const savedProgress = this.progressTrackerService.loadProgress(config.template.CourseName);
    if (savedProgress) {
      this.progressSubject.next(savedProgress);
      this.currentPageIndexSubject.next(savedProgress.currentPageIndex);
      this.moduleIdSubject.next(savedProgress.moduleId);
    } else {
      const initialProgress = this.createInitialProgress(config.template.CourseName);
      this.progressSubject.next(initialProgress);
      this.markVisited(config.pages[0]);
      this.persistProgress();
    }
  }

  resumeCourse(): void {
    this.showResumeDialogSubject.next(false);
  }

  restartCourse(): void {
    const config = this.configSubject.getValue();
    if (!config) {
      return;
    }

    this.currentPageIndexSubject.next(0);
    this.moduleIdSubject.next(0);
    const resetProgress = this.createInitialProgress(config.template.CourseName);
    this.progressSubject.next(resetProgress);
    this.showResumeDialogSubject.next(false);
    this.markVisited(config.pages[0]);
    this.persistProgress();
  }

  goNext(): void {
    const pages = this.configSubject.getValue()?.pages ?? [];
    const currentIndex = this.currentPageIndexSubject.getValue();
    if (currentIndex >= pages.length - 1) {
      return;
    }

    this.markCompleted(pages[currentIndex]);
    this.goToPage(currentIndex + 1);
  }

  goBack(): void {
    const currentIndex = this.currentPageIndexSubject.getValue();
    if (currentIndex <= 0) {
      return;
    }

    this.goToPage(currentIndex - 1);
  }

  goToPage(index: number): void {
    const pages = this.configSubject.getValue()?.pages ?? [];
    if (index < 0 || index >= pages.length) {
      return;
    }

    const nextPage = pages[index];
    this.currentPageIndexSubject.next(index);
    this.moduleIdSubject.next(nextPage.settings.module ?? 0);
    this.markVisited(nextPage);
    this.persistProgress();
  }

  toggleAudioEnabled(): void {
    this.audioEnabledSubject.next(!this.audioEnabledSubject.getValue());
  }

  toggleMenu(): void {
    this.menuOpenSubject.next(!this.menuOpenSubject.getValue());
  }

  setMenuOpen(isOpen: boolean): void {
    this.menuOpenSubject.next(isOpen);
  }

  toggleTranscript(): void {
    this.transcriptOpenSubject.next(!this.transcriptOpenSubject.getValue());
  }

  setError(message: string | null): void {
    this.errorSubject.next(message);
    this.loadingSubject.next(false);
  }

  terminate(): void {
    this.persistProgress();
    this.scormService.terminate();
  }

  private markVisited(page: TocPage | undefined): void {
    if (!page) {
      return;
    }

    const progress = this.progressSubject.getValue();
    if (!progress) {
      return;
    }

    const updated = this.progressTrackerService.markPageVisited(progress, page.name);
    this.progressSubject.next(updated);
    this.scormService.reportPageVisit(page.name);
  }

  private markCompleted(page: TocPage | undefined): void {
    if (!page) {
      return;
    }

    const progress = this.progressSubject.getValue();
    const totalPages = this.configSubject.getValue()?.pages.length ?? 0;
    if (!progress || !totalPages) {
      return;
    }

    const updated = this.progressTrackerService.markPageCompleted(progress, page.name, totalPages);
    this.progressSubject.next(updated);
    this.scormService.reportCompletion(updated.completionPercentage >= 100);
    this.scormService.reportScore(updated.completionPercentage);
  }

  private persistProgress(): void {
    const config = this.configSubject.getValue();
    const progress = this.progressSubject.getValue();
    if (!config || !progress) {
      return;
    }

    const snapshot: CourseProgress = {
      ...progress,
      currentPageIndex: this.currentPageIndexSubject.getValue(),
      moduleId: this.moduleIdSubject.getValue(),
      updatedAt: new Date().toISOString()
    };

    this.progressSubject.next(snapshot);
    this.progressTrackerService.saveProgress(snapshot);
    this.scormService.commit();
  }

  private createInitialProgress(courseName: string): CourseProgress {
    return {
      courseName,
      currentPageIndex: 0,
      moduleId: 0,
      visitedPageIds: [],
      completedPageIds: [],
      completionPercentage: 0,
      updatedAt: new Date().toISOString()
    };
  }

  private buildTranscriptEntries(pages: TocPage[], progress: CourseProgress | null): TranscriptEntry[] {
    if (!progress) {
      return [];
    }

    return pages
      .filter((page) => progress.visitedPageIds.includes(page.name))
      .map((page) => ({
        pageId: page.name,
        title: page.title,
        completed: progress.completedPageIds.includes(page.name),
        transcript: page.transcript ?? ''
      }));
  }
}