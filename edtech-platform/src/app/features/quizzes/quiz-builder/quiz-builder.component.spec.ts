import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizBuilderComponent } from './quiz-builder.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('QuizBuilderComponent', () => {
  let component: QuizBuilderComponent;
  let fixture: ComponentFixture<QuizBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizBuilderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuizBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create quiz builder component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate empty form fields', () => {
    expect(component.form.valid).toBeFalsy();
  });
});
