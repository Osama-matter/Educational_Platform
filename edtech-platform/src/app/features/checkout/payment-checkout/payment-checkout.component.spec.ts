import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentCheckoutComponent } from './payment-checkout.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('PaymentCheckoutComponent', () => {
  let component: PaymentCheckoutComponent;
  let fixture: ComponentFixture<PaymentCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCheckoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create payment checkout component', () => {
    expect(component).toBeTruthy();
  });
});
