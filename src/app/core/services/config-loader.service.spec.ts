import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigLoaderService } from './config-loader.service';

describe('ConfigLoaderService', () => {
  let service: ConfigLoaderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ConfigLoaderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads and normalizes template and toc config', () => {
    service.loadConfig().subscribe((result) => {
      expect(result.template.CourseName).toBe('Demo Course');
      expect(result.pages.length).toBe(1);
      expect(result.pages[0].title).toBe('Welcome');
    });

    const templateReq = httpMock.match((r) => r.url.includes('assets/json/template.json'))[0];
    templateReq.flush({ CourseName: 'Demo Course' });

    const tocReq = httpMock.match((r) => r.url.includes('assets/json/toc.json'))[0];
    tocReq.flush({
      0: [
        {
          name: '1',
          title: 'Welcome',
          settings: { module: 0, content: [] }
        }
      ]
    });
  });
});
