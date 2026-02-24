import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarComponent {
  @Input({ required: true }) canGoBack = false;
  @Input({ required: true }) canGoNext = false;
  @Input({ required: true }) completionPercentage = 0;
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Input() nextLabel = 'Next ›';
  @Input() prevLabel = '‹ Back';
  @Input() transcriptLabel = '📄 Transcript';

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() openMenu = new EventEmitter<void>();
  @Output() openTranscript = new EventEmitter<void>();
  @Output() toggleAudio = new EventEmitter<void>();
}
