import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, tap, throwError } from 'rxjs';
import { CourseConfig, TemplateConfig, TocPage } from '@core/models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ConfigLoaderService {
  private readonly templateUrl = 'assets/json/template.json';
  private readonly tocUrl = 'assets/json/toc.json';
  private cachedConfig: CourseConfig | null = null;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadConfig(forceRefresh = false): Observable<CourseConfig> {
    if (!forceRefresh && this.cachedConfig) {
      return of(this.cachedConfig);
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return forkJoin({
      template: this.loadTemplate(),
      toc: this.loadToc()
    }).pipe(
      map(({ template, toc }) => {
        this.validateTemplate(template);
        const pages = this.normalizeToc(toc);
        if (!pages.length) {
          throw new Error('No pages found in toc.json');
        }

        return {
          template,
          pages
        } as CourseConfig;
      }),
      tap((config) => {
        this.cachedConfig = config;
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        const message = error instanceof Error ? error.message : 'Failed to load course configuration';
        this.errorSubject.next(message);
        this.loadingSubject.next(false);
        return throwError(() => new Error(message));
      })
    );
  }

  private loadTemplate(): Observable<TemplateConfig> {
    return this.http.get<TemplateConfig>(this.withCacheBust(this.templateUrl));
  }

  private loadToc(): Observable<unknown> {
    return this.http.get<unknown>(this.withCacheBust(this.tocUrl));
  }

  private withCacheBust(url: string): string {
    return `${url}?t=${Date.now()}`;
  }

  private validateTemplate(template: TemplateConfig): void {
    if (!template || typeof template.CourseName !== 'string' || !template.CourseName.trim()) {
      throw new Error('template.json is missing a valid CourseName');
    }
  }

  private normalizeToc(rawToc: unknown): TocPage[] {
    if (!rawToc || typeof rawToc !== 'object') {
      throw new Error('toc.json has an invalid structure');
    }

    const record = rawToc as Record<string, unknown>;
    const moduleKeys = Object.keys(record).sort((a, b) => Number(a) - Number(b));
    const pages: TocPage[] = [];

    for (const moduleKey of moduleKeys) {
      const modulePages = record[moduleKey];
      if (!Array.isArray(modulePages)) {
        continue;
      }

      for (const page of modulePages) {
        if (!page || typeof page !== 'object') {
          continue;
        }
        const candidate = page as Partial<TocPage>;
        if (!candidate.name || !candidate.title || !candidate.settings) {
          continue;
        }

        pages.push({
          name: String(candidate.name),
          title: String(candidate.title),
          header: typeof candidate.header === 'string' ? candidate.header : String(candidate.title),
          transcript: typeof candidate.transcript === 'string' ? candidate.transcript : '',
          settings: {
            module: Number(moduleKey),
            content: Array.isArray(candidate.settings.content) ? candidate.settings.content : []
          }
        });
      }
    }

    return pages;
  }
}