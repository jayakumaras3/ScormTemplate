import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-resume-dialog',
  standalone: true,
  templateUrl: './resume-dialog.component.html',
  styleUrls: ['./resume-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResumeDialogComponent {
  @Input({ required: true }) visible = false;
  @Input() resumeTitle = 'Resume Course';
  @Input() resumeMessage = 'You have saved progress. Continue where you left off?';
  @Input() resumeButtonLabel = 'Resume';
  @Input() restartButtonLabel = 'Restart';
  
  @Output() resume = new EventEmitter<void>();
  @Output() restart = new EventEmitter<void>();

  resumeCourse(): void {
    this.resume.emit();
  }

  restartCourse(): void {
    this.restart.emit();
  }
}