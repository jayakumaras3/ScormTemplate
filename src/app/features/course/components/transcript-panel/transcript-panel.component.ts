import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranscriptEntry } from '@core/models/course.models';

@Component({
  selector: 'app-transcript-panel',
  standalone: true,
  templateUrl: './transcript-panel.component.html',
  styleUrl: './transcript-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranscriptPanelComponent {
  @Input({ required: true }) entries: TranscriptEntry[] = [];
  @Input({ required: true }) visible = false;

  @Output() close = new EventEmitter<void>();
}
