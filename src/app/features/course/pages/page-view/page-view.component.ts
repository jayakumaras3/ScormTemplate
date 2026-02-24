import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TocPage } from '@core/models/course.models';

@Component({
  selector: 'app-page-view',
  standalone: true,
  imports: [NgIf],
  templateUrl: './page-view.component.html',
  styleUrl: './page-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageViewComponent {
  @Input({ required: true }) page: TocPage | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  get contentType(): string {
    return this.page?.settings.content?.[0]?.type ?? 'html';
  }

  get contentPath(): string {
    return this.page?.settings.content?.[0]?.path ?? '';
  }

  get resolvedContentPath(): string {
    const path = this.contentPath.trim();

    if (!path) {
      return '';
    }

    if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('/')) {
      return path;
    }

    return `/${path}`;
  }

  get safeResourceUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.resolvedContentPath);
  }
}
