import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { TocPage } from '@core/models/course.models';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarMenuComponent {
  @Input({ required: true }) pages: TocPage[] = [];
  @Input({ required: true }) currentPageIndex = 0;
  @Input({ required: true }) visitedPageIds: string[] = [];

  @Output() pageSelected = new EventEmitter<number>();
  @Output() closeMenu = new EventEmitter<void>();

  get sectionedPages(): Array<{ title: string; items: Array<{ page: TocPage; index: number }> }> {
    const groups = new Map<number, Array<{ page: TocPage; index: number }>>();

    this.pages.forEach((page, index) => {
      const moduleId = page.settings.module ?? 0;
      const existing = groups.get(moduleId) ?? [];
      existing.push({ page, index });
      groups.set(moduleId, existing);
    });

    const sectionNames = ['INTRODUCTION', 'FOUNDATIONS', 'ADVANCED', 'PRACTICE', 'ASSESSMENT'];

    return [...groups.entries()]
      .sort(([left], [right]) => left - right)
      .map(([moduleId, items]) => ({
        title: sectionNames[moduleId] ?? `MODULE ${moduleId + 1}`,
        items
      }));
  }

  isVisited(pageName: string): boolean {
    return this.visitedPageIds.includes(pageName);
  }
}
