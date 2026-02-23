import { ProgressTrackerService } from './progress-tracker.service';
import { CourseProgress } from '@core/models/course.models';

describe('ProgressTrackerService', () => {
  let service: ProgressTrackerService;

  beforeEach(() => {
    localStorage.clear();
    service = new ProgressTrackerService();
  });

  it('saves and loads progress by course key', () => {
    const progress: CourseProgress = {
      courseName: 'Demo',
      currentPageIndex: 2,
      moduleId: 0,
      visitedPageIds: ['p1', 'p2'],
      completedPageIds: ['p1'],
      completionPercentage: 50,
      updatedAt: new Date().toISOString()
    };

    service.saveProgress(progress);
    const loaded = service.loadProgress('Demo');

    expect(loaded?.currentPageIndex).toBe(2);
    expect(loaded?.visitedPageIds.length).toBe(2);
  });

  it('calculates completion percentage', () => {
    expect(service.calculateCompletion(8, 2)).toBe(25);
  });
});
