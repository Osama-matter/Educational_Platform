import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrollmentsManagementComponent } from './enrollments-management.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('EnrollmentsManagementComponent', () => {
  let component: EnrollmentsManagementComponent;
  let fixture: ComponentFixture<EnrollmentsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentsManagementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create enrollments management component', () => {
    expect(component).toBeTruthy();
  });
});
