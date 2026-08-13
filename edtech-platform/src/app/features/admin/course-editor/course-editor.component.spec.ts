import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseEditorComponent } from './course-editor.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('CourseEditorComponent', () => {
  let component: CourseEditorComponent;
  let fixture: ComponentFixture<CourseEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseEditorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create course editor component', () => {
    expect(component).toBeTruthy();
  });
});
