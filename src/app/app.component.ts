import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CourseStateService } from '@core/services/course-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  constructor(private courseStateService: CourseStateService) {}

  ngOnDestroy(): void {
    this.courseStateService.terminate();
  }
}