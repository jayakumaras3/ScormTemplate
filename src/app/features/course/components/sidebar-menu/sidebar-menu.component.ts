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
  @Input() menuTitle = 'Menu';

  @Output() pageSelected = new EventEmitter<number>();
  @Output() closeMenu = new EventEmitter<void>();

  isVisited(pageName: string): boolean {
    return this.visitedPageIds.includes(pageName);
  }
}
