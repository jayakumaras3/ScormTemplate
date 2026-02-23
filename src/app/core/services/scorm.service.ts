import { Injectable } from '@angular/core';

type ScormApi = {
  LMSInitialize?: (param: string) => string;
  LMSFinish?: (param: string) => string;
  LMSSetValue?: (key: string, value: string) => string;
  LMSGetValue?: (key: string) => string;
  LMSCommit?: (param: string) => string;
  Initialize?: (param: string) => string;
  Terminate?: (param: string) => string;
  SetValue?: (key: string, value: string) => string;
  GetValue?: (key: string) => string;
  Commit?: (param: string) => string;
};

@Injectable({
  providedIn: 'root'
})
export class ScormService {
  private initialized = false;
  private api: ScormApi | null = null;

  initialize(): void {
    this.api = this.resolveApi();
    if (!this.api || this.initialized) {
      return;
    }

    const result = this.api.LMSInitialize?.('') ?? this.api.Initialize?.('');
    this.initialized = result === 'true' || result === undefined;
  }

  terminate(): void {
    if (!this.initialized || !this.api) {
      return;
    }

    this.api.LMSFinish?.('');
    this.api.Terminate?.('');
    this.initialized = false;
  }

  reportPageVisit(pageId: string): void {
    this.setValue('cmi.core.lesson_location', pageId);
  }

  reportScore(score: number): void {
    this.setValue('cmi.core.score.raw', `${score}`);
  }

  reportCompletion(isComplete: boolean): void {
    const status = isComplete ? 'completed' : 'incomplete';
    this.setValue('cmi.core.lesson_status', status);
    this.setValue('cmi.completion_status', status);
    this.commit();
  }

  setValue(key: string, value: string): void {
    if (!this.api) {
      return;
    }

    this.api.LMSSetValue?.(key, value);
    this.api.SetValue?.(key, value);
  }

  getValue(key: string): string | null {
    if (!this.api) {
      return null;
    }

    return this.api.LMSGetValue?.(key) ?? this.api.GetValue?.(key) ?? null;
  }

  commit(): void {
    if (!this.api) {
      return;
    }

    this.api.LMSCommit?.('');
    this.api.Commit?.('');
  }

  private resolveApi(): ScormApi | null {
    const maybeWindow = window as Window & { API?: ScormApi; API_1484_11?: ScormApi };
    return maybeWindow.API_1484_11 ?? maybeWindow.API ?? null;
  }
}