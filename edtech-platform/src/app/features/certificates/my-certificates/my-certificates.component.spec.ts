import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCertificatesComponent } from './my-certificates.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('MyCertificatesComponent', () => {
  let component: MyCertificatesComponent;
  let fixture: ComponentFixture<MyCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCertificatesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create my certificates component', () => {
    expect(component).toBeTruthy();
  });
});
