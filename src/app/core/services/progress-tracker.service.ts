import { Injectable } from '@angular/core';
import { CourseProgress } from '@core/models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ProgressTrackerService {
  private readonly storagePrefix = 'course_progress_';

  loadProgress(courseName: string): CourseProgress | null {
    const raw = localStorage.getItem(this.getStorageKey(courseName));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CourseProgress;
    } catch {
      return null;
    }
  }

  saveProgress(progress: CourseProgress): void {
    localStorage.setItem(this.getStorageKey(progress.courseName), JSON.stringify(progress));
  }

  clearProgress(courseName: string): void {
    localStorage.removeItem(this.getStorageKey(courseName));
  }

  markPageVisited(progress: CourseProgress, pageId: string): CourseProgress {
    if (progress.visitedPageIds.includes(pageId)) {
      return progress;
    }

    return {
      ...progress,
      visitedPageIds: [...progress.visitedPageIds, pageId]
    };
  }

  markPageCompleted(progress: CourseProgress, pageId: string, totalPages: number): CourseProgress {
    const completedPageIds = progress.completedPageIds.includes(pageId)
      ? progress.completedPageIds
      : [...progress.completedPageIds, pageId];

    return {
      ...progress,
      completedPageIds,
      completionPercentage: this.calculateCompletion(totalPages, completedPageIds.length)
    };
  }

  calculateCompletion(totalPages: number, completedCount: number): number {
    if (!totalPages) {
      return 0;
    }

    return Math.round((completedCount / totalPages) * 100);
  }

  private getStorageKey(courseName: string): string {
    return `${this.storagePrefix}${courseName.trim()}`;
  }
}
