import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCertificatesComponent } from './admin-certificates.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AdminCertificatesComponent', () => {
  let component: AdminCertificatesComponent;
  let fixture: ComponentFixture<AdminCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCertificatesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create admin certificates component', () => {
    expect(component).toBeTruthy();
  });
});
