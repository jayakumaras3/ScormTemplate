import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-transcript-panel',
  standalone: true,
  templateUrl: './transcript-panel.component.html',
  styleUrl: './transcript-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranscriptPanelComponent {
  @Input({ required: true }) visible = false;
  @Input({ required: true }) transcriptTitle = 'Audio Transcript';
  @Input({ required: true }) transcriptContent = '';

  @Output() close = new EventEmitter<void>();
}
