import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForumThreadListComponent } from './forum-thread-list.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ForumThreadListComponent', () => {
  let component: ForumThreadListComponent;
  let fixture: ComponentFixture<ForumThreadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumThreadListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForumThreadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create forum thread list component', () => {
    expect(component).toBeTruthy();
  });
});
