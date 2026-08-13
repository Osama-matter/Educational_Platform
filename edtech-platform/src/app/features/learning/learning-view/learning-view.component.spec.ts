import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LearningViewComponent } from './learning-view.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('LearningViewComponent', () => {
  let component: LearningViewComponent;
  let fixture: ComponentFixture<LearningViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LearningViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create learning view component', () => {
    expect(component).toBeTruthy();
  });
});
