# SCORM Angular 20 Template

This project is a SCORM-compliant Angular application designed for delivering interactive e-learning courses. It integrates SCORM functionalities to track user progress and manage course content effectively.

## Project Structure

The project is organized as follows:

```
scorm-angular20-template
├── src
│   ├── app
│   │   ├── core
│   │   │   ├── models
│   │   │   │   └── course.models.ts
│   │   │   └── services
│   │   │       ├── course-state.service.ts
│   │   │       ├── config-loader.service.ts
│   │   │       ├── progress.service.ts
│   │   │       └── scorm.service.ts
│   │   ├── features
│   │   │   └── course
│   │   │       ├── components
│   │   │       │   ├── course-shell
│   │   │       │   │   ├── course-shell.component.ts
│   │   │       │   │   ├── course-shell.component.html
│   │   │       │   │   └── course-shell.component.scss
│   │   │       │   ├── navigation
│   │   │       │   │   ├── navigation.component.ts
│   │   │       │   │   ├── navigation.component.html
│   │   │       │   │   └── navigation.component.scss
│   │   │       │   ├── transcript
│   │   │       │   │   ├── transcript.component.ts
│   │   │       │   │   ├── transcript.component.html
│   │   │       │   │   └── transcript.component.scss
│   │   │       │   └── resume-dialog
│   │   │       │       ├── resume-dialog.component.ts
│   │   │       │       ├── resume-dialog.component.html
│   │   │       │       └── resume-dialog.component.scss
│   │   │       └── pages
│   │   │           └── page-host
│   │   │               ├── page-host.component.ts
│   │   │               ├── page-host.component.html
│   │   │               └── page-host.component.scss
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets
│   │   └── json
│   │       ├── template.json
│   │       └── toc.json
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd scorm-angular20-template
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Running the Application

To start the development server, run:
```
ng serve
```
Then open your browser and navigate to `http://localhost:4200`.

## Configuration Files

- **template.json**: Contains the template configuration for the course.
- **toc.json**: Contains the table of contents for the course.

## Services

- **CourseStateService**: Manages the state of the course, including the current page index and progress tracking.
- **ConfigLoaderService**: Responsible for loading configuration files and providing necessary data.
- **ProgressService**: Handles saving and loading user progress in the course using local storage.
- **ScormService**: Integrates SCORM functionalities, initializing and terminating the SCORM API.

## Components

- **CourseShellComponent**: Main shell for the course layout.
- **NavigationComponent**: Handles navigation between pages.
- **TranscriptComponent**: Displays the transcript of the course content.
- **ResumeDialogComponent**: Presents a dialog for resuming the course.
- **PageHostComponent**: Acts as a host for displaying individual course pages.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.