# Educational Platform — Angular Migration & ASP.NET Core Integration Blueprint

Based on: `stitch_arabic_edtech_ui_suite` (23 Stitch-exported RTL Arabic screens + `DESIGN.md` design tokens) and the `Educational Platform API v1` Swagger spec (Account, Certificates, CourseFiles, Courses, Enrollments, Fawaterak payments/webhooks, Forum*, Lessons, Progress, Question/QuestionOptions, QuizAttempts, Quizzes, Reviews).

---

## 1. Overview

**What you gave me**
- 23 screens (`_1` … `_23`), each with `screen.png` + `code.html` (Tailwind CDN, RTL `dir="rtl" lang="ar"`, IBM Plex Sans Arabic, Material Symbols icons).
- `minara/DESIGN.md` — full design-token spec (colors, typography, spacing, radii) and a written style guide (Teal/Blue/Amber, RTL-first rules, card/button/progress-bar specs).
- A Swagger/OpenAPI export for `Educational Platform API v1` — 17 controllers, JWT-cookie-style auth (`Account/login`, `Account/register`, `Account/Logout`, `Account/details`), Fawaterak payment gateway integration, forum, quiz, certificate, and progress-tracking domains.

**Screen → domain mapping** (derived from headings inside each `code.html`):

| # | Arabic heading (detected) | Screen purpose | Primary API controller(s) |
|---|---|---|---|
| _1 | شهاداتي | My Certificates (learner) | `Certificates` |
| _2 | تصفية الدورات / دورة تطوير واجهات React | Course catalog with filters | `Courses`, `Reviews` |
| _3 | إدارة الشهادات / إصدار شهادة يدوية | Admin: certificate management, issue/revoke | `Certificates` |
| _4 | إدارة الصلاحيات والأمان | Admin: roles & permissions | `Account` (extend) |
| _5 | إنشاء حساب جديد | Register | `Account/register` |
| _6 | متابعة الحضور والغياب | Admin: attendance dashboard | (attendance not in swagger — flagged below) |
| _7 | مرحباً بعودتك | Login | `Account/login` |
| _8 | بناء اختبار جديد | Admin: quiz builder | `Quizzes`, `Questions`, `QuestionOptions` |
| _9 | اكتشف متعة التعلم / الدورات المميزة | Public landing / home | `Courses` |
| _10 | Learning View / محتوى الدورة | Video/lesson player w/ notes | `Lessons`, `CourseFiles`, `Progress` |
| _11 | تسجيل حضور الطلاب | Admin: mark attendance | (attendance — flagged) |
| _12 | قوانين المنتدى / مناقشات | Forum thread list | `ForumThreads`, `ForumSubscriptions` |
| _13 | Quiz | Quiz-taking screen | `Quizzes`, `Questions`, `QuizAttempts` |
| _14 | إدارة التسجيلات / تسجيل طالب جديد | Admin: enrollment management | `Enrollments` |
| _15 | المعلومات الشخصية / الأمان / التفضيلات | Profile / account settings | `Account/details` |
| _16 | تعديل الدورة / محتوى الدورة | Admin: course editor (CRUD lessons) | `Courses`, `Lessons`, `CourseFiles` |
| _17 | Course Details / محتوى الدورة | Public course detail page | `Courses`, `Lessons`, `Reviews`, `Enrollments` |
| _18 | اتجاهات التسجيل / أحدث النشاطات | Admin: analytics dashboard | `Enrollments`, `Courses`, `Certificates` |
| _19 | مرحباً يا أحمد / النشاط الأخير | Student dashboard (home) | `Enrollments`, `Progress`, `Courses` |
| _20 | Attendance Record / سجل المقررات | Student attendance history | (attendance — flagged) |
| _21 | مقدمة في الذكاء الاصطناعي | Lesson detail (single lesson) | `Lessons`, `Progress`, `CourseFiles` |
| _22 | إتمام الطلب / طريقة الدفع | Checkout / payment method | `Fawaterak*`, `Enrollments` |
| _23 | (admin shell, right sidebar nav) | Admin layout shell / course list | `Courses` |

> ⚠️ **Gap flagged:** screens `_6`, `_11`, `_20` are an **Attendance** module (mark/track/report attendance) with no matching controller in the supplied Swagger (`AttendanceRecords`, `AttendanceSessions`, etc. don't exist yet). Either this is a separate microservice you haven't shared, or it needs to be built on the backend. I've scaffolded the Angular side against a placeholder `AttendanceService` (Section 5.6) — swap in real routes once you confirm.

---

## 2. Project Setup

```bash
# Angular CLI (latest LTS — Angular 18/19 at time of writing; run `ng version` to confirm)
npm install -g @angular/cli

ng new edtech-platform \
  --routing \
  --style=scss \
  --strict \
  --ssr=false

cd edtech-platform

# Core runtime deps
npm install @angular/material @angular/cdk        # optional, see Section 7
npm install -D tailwindcss postcss autoprefixer    # Stitch screens are Tailwind-authored — keep it
npx tailwindcss init

# State & utilities
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
npm install jwt-decode

# Tooling
ng add @angular-eslint/schematics
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D karma-jasmine-html-reporter          # default; swap to Jest if preferred (Section 9)
ng add @cypress/schematic
```

`tailwind.config.js` — port the design tokens **verbatim** from `minara/DESIGN.md` so class names in the exported HTML (`bg-primary`, `text-on-surface`, `font-headline-lg`, `rounded-xl`, etc.) resolve unchanged:

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00685f', 'on-primary': '#ffffff', 'primary-container': '#008378',
        'on-primary-container': '#f4fffc', secondary: '#855300', 'on-secondary': '#ffffff',
        'secondary-container': '#fea619', 'on-secondary-container': '#684000',
        tertiary: '#3e57a8', 'on-tertiary': '#ffffff', tertiary_container: '#5870c3',
        error: '#ba1a1a', 'on-error': '#ffffff', 'error-container': '#ffdad6',
        background: '#f8f9ff', 'on-background': '#0b1c30', surface: '#f8f9ff',
        'on-surface': '#0b1c30', 'on-surface-variant': '#3d4947',
        'surface-container-lowest': '#ffffff', 'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff', 'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe', outline: '#6d7a77', 'outline-variant': '#bcc9c6',
      },
      fontFamily: {
        'display-lg': ['"IBM Plex Sans Arabic"'], 'headline-lg': ['"IBM Plex Sans Arabic"'],
        'headline-md': ['"IBM Plex Sans Arabic"'], 'body-lg': ['"IBM Plex Sans Arabic"'],
        'body-md': ['"IBM Plex Sans Arabic"'], 'label-md': ['"IBM Plex Sans Arabic"'],
        caption: ['"IBM Plex Sans Arabic"'],
      },
      borderRadius: { sm: '0.25rem', DEFAULT: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem', full: '9999px' },
      spacing: { unit: '4px', gutter: '24px', 'margin-mobile': '16px', 'margin-desktop': '32px', 'section-gap': '64px' },
    },
  },
  plugins: [],
};
```

`src/index.html` — set global RTL/lang and pull the same font links every screen already uses:

```html
<html lang="ar" dir="rtl">
<head>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
</head>
```

---

## 3. Angular Architecture (opinionated structure)

```
src/app/
├── core/                          # singletons, app-wide
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   └── loading.interceptor.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── models/                    # DTO interfaces (mirror Swagger schemas 1:1)
│   │   ├── account.models.ts
│   │   ├── course.models.ts
│   │   ├── lesson.models.ts
│   │   ├── quiz.models.ts
│   │   ├── forum.models.ts
│   │   ├── certificate.models.ts
│   │   ├── enrollment.models.ts
│   │   └── payment.models.ts
│   └── services/                  # one service per Swagger controller
│       ├── account.service.ts
│       ├── courses.service.ts
│       ├── lessons.service.ts
│       ├── course-files.service.ts
│       ├── enrollments.service.ts
│       ├── quizzes.service.ts
│       ├── questions.service.ts
│       ├── question-options.service.ts
│       ├── quiz-attempts.service.ts
│       ├── progress.service.ts
│       ├── certificates.service.ts
│       ├── forum-threads.service.ts
│       ├── forum-posts.service.ts
│       ├── forum-voting.service.ts
│       ├── forum-subscriptions.service.ts
│       ├── reviews.service.ts
│       └── fawaterak.service.ts
├── shared/                        # dumb/reusable UI components
│   ui/
│   ├── course-card/
│   ├── progress-bar/
│   ├── rating-stars/
│   ├── badge/
│   ├── button/
│   ├── input-field/
│   ├── modal/
│   ├── rtl-icon/                  # mirrors "back = right arrow" rule
│   └── skeleton-loader/
├── layout/
│   ├── public-shell/              # header/footer for _9, _17, _2
│   ├── student-shell/             # right sidebar nav for _19, _10, _1, _15, _20
│   └── admin-shell/               # right sidebar nav for _23, _18, _14, _16, _3, _4, _8, _6, _11
├── features/
│   ├── auth/                      # _5 register, _7 login
│   │   ├── login/  register/
│   ├── catalog/                   # _9 landing, _2 catalog, _17 course-details
│   ├── checkout/                  # _22
│   ├── learning/                  # _10 learning-view, _21 lesson-detail
│   ├── quizzes/                   # _13 take-quiz, results
│   ├── forum/                     # _12 thread list, thread detail, post composer
│   ├── certificates/              # _1 my-certificates
│   ├── profile/                   # _15
│   ├── student-dashboard/         # _19
│   ├── attendance/                # _6, _11, _20 (placeholder API — see 5.6)
│   └── admin/
│       ├── dashboard/             # _18
│       ├── courses/               # _23 list, _16 editor
│       ├── enrollments/           # _14
│       ├── certificates/          # _3
│       ├── quiz-builder/          # _8
│       └── roles/                 # _4
├── app.config.ts
└── app.routes.ts
```

**Naming conventions:** kebab-case selectors prefixed `app-` (e.g., `app-course-card`), standalone components (Angular 17+ default — no NgModules except for optional Material import groups), one feature = one lazy route.

---

## 4. Component Mapping (representative set — pattern repeats for remaining screens)

### 4.1 `CourseCardComponent` (used in `_2`, `_9`, `_19`, `_23`)

```typescript
// shared/ui/course-card/course-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseSummary } from '../../../core/models/course.models';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-card.component.html',
})
export class CourseCardComponent {
  @Input({ required: true }) course!: CourseSummary;
  @Input() progressPercent?: number;       // shown only on student dashboard cards
  @Output() enroll = new EventEmitter<string>(); // emits courseId
}
```

```html
<!-- course-card.component.html -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
  <img [src]="course.imageUrl" [alt]="course.title" class="w-full h-40 object-cover rounded-t-xl" />
  <div class="p-gutter text-right">
    <h3 class="font-headline-md text-on-surface">{{ course.title }}</h3>
    <p class="font-body-md text-on-surface-variant">{{ course.instructorName }}</p>
    @if (progressPercent !== undefined) {
      <app-progress-bar [percent]="progressPercent" />
    }
    <a [routerLink]="['/courses', course.id]" class="mt-2 inline-block font-label-md text-primary">عرض التفاصيل</a>
  </div>
</div>
```

**Unit tests:** renders title/instructor from `@Input`; hides progress bar when `progressPercent` undefined; `enroll` emits course id on CTA click; image `alt` set for a11y.

### 4.2 `LoginComponent` (`_7`)

```typescript
// features/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  loading = false;
  errorMessage: string | null = null;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = null;
    this.accountService.login(this.form.getRawValue())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => this.errorMessage = err.status === 401
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'حدث خطأ، حاول مرة أخرى',
      });
  }
}
```

**Unit tests:** form invalid when email/password empty; calls `AccountService.login` with raw form value; on success navigates to `/dashboard`; on 401 sets Arabic error message; `loading` toggles around the call.

### 4.3 `QuizTakingComponent` (`_13`) — RxJS + timer + submission pattern

```typescript
// features/quizzes/take-quiz/take-quiz.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizzesService } from '../../../core/services/quizzes.service';
import { QuestionsService } from '../../../core/services/questions.service';
import { QuizAttemptsService } from '../../../core/services/quiz-attempts.service';
import { Subject, interval, takeUntil, switchMap, forkJoin } from 'rxjs';

@Component({ selector: 'app-take-quiz', standalone: true, templateUrl: './take-quiz.component.html' })
export class TakeQuizComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizzes = inject(QuizzesService);
  private questions = inject(QuestionsService);
  private attempts = inject(QuizAttemptsService);
  private destroy$ = new Subject<void>();

  quizId = this.route.snapshot.paramMap.get('quizId')!;
  answers = new Map<string, string>(); // questionId -> selected optionId
  secondsLeft = 0;
  attemptId?: string;

  ngOnInit(): void {
    forkJoin({
      quiz: this.quizzes.getById(this.quizId),
      questions: this.questions.getByQuiz(this.quizId),
      attempt: this.attempts.start({ userId: this.currentUserId(), quizId: this.quizId }),
    }).subscribe(({ quiz, attempt }) => {
      this.secondsLeft = quiz.durationMinutes * 60;
      this.attemptId = attempt.id;
      this.startTimer();
    });
  }

  private startTimer(): void {
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) this.submit();
    });
  }

  submit(): void {
    if (!this.attemptId) return;
    this.attempts.submit(this.attemptId, {
      answers: Array.from(this.answers, ([questionId, optionId]) => ({ questionId, optionId })),
    }).subscribe(() => this.router.navigate(['/quizzes', this.quizId, 'result', this.attemptId]));
  }

  private currentUserId(): string { /* pulled from AuthState/JWT claims */ return ''; }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
```

**Unit tests:** `forkJoin` populates `secondsLeft` from quiz duration; timer decrements and auto-submits at 0; `submit()` maps `answers` map to the `SubmitAnswersRequest` shape and navigates to results; `ngOnDestroy` unsubscribes (spy on `takeUntil`).

---

## 5. Services & API Integration

### 5.1 Environment config

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7189/api',   // <-- REPLACE with your dev ASP.NET port
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: '/api',   // same-origin once Angular is served from ASP.NET (Section 8)
};
```

### 5.2 Typed DTOs (mirror Swagger schemas exactly — 1:1 field names)

```typescript
// core/models/account.models.ts
export interface RegisterDto { username: string; email: string; password: string; firstName: string; lastName: string; }
export interface LoginDto { email: string; password: string; }
export interface UserDto { email: string; token: string; }
export interface UserDetailsDto { username: string; email: string; firstName: string; lastName: string; }

// core/models/course.models.ts
export interface CourseSummary {
  id: string; title: string; description: string; instructorId: string;
  estimatedDurationHours: number; isActive: boolean; price: number;
  numberOfSections: number; imageUrl?: string; instructorName?: string;
}

// core/models/quiz.models.ts
export interface CreateQuizAttemptDto { userId: string; quizId: string; }
export interface SubmitAnswersRequest { answers: { questionId: string; optionId: string }[]; }
```

### 5.3 Service pattern (`HttpClient`, typed, `withCredentials` for the auth cookie)

```typescript
// core/services/account.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginDto, RegisterDto, UserDto, UserDetailsDto } from '../models/account.models';
import { AuthStore } from './auth.store'; // simple signal-based session store, see 6.3

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private base = `${environment.apiBaseUrl}/Account`;

  register(dto: RegisterDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.base}/register`, dto)
      .pipe(tap((res) => this.authStore.setSession(res)));
  }

  login(dto: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.base}/login`, dto)
      .pipe(tap((res) => this.authStore.setSession(res)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/Logout`, {})
      .pipe(tap(() => this.authStore.clearSession()));
  }

  getDetails(): Observable<UserDetailsDto> {
    return this.http.get<UserDetailsDto>(`${this.base}/details`);
  }
}
```

```typescript
// core/services/courses.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseSummary } from '../models/course.models';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Courses`;

  getAll(filters?: { search?: string; page?: number }): Observable<CourseSummary[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page);
    return this.http.get<CourseSummary[]>(this.base, { params });
  }

  getById(courseId: string): Observable<CourseSummary> {
    return this.http.get<CourseSummary>(`${this.base}/${courseId}`);
  }

  create(formData: FormData): Observable<CourseSummary> {   // multipart/form-data per Swagger
    return this.http.post<CourseSummary>(this.base, formData);
  }

  update(courseId: string, formData: FormData): Observable<CourseSummary> {
    return this.http.put<CourseSummary>(`${this.base}/${courseId}`, formData);
  }

  delete(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${courseId}`);
  }

  getLessons(courseId: string) {
    return this.http.get(`${this.base}/${courseId}/lessons`);
  }
}
```

> The `Courses`, `CourseFiles` POST/PUT endpoints take `multipart/form-data` (they include `imageFile`/`File` binaries) — build the payload with `FormData`, **not** JSON, and don't manually set the `Content-Type` header (let the browser set the multipart boundary).

### 5.4 Interceptors (auth token attach + centralized error handling)

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../services/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` }, withCredentials: true })
    : req.clone({ withCredentials: true });
  return next(cloned);
};
```

```typescript
// core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) router.navigate(['/login']);
      else if (err.status === 403) router.navigate(['/forbidden']);
      else if (err.status >= 500) notify.error('حدث خطأ في الخادم، حاول مرة أخرى لاحقاً');
      else if (err.error?.detail) notify.error(err.error.detail); // ProblemDetails shape (Fawaterak 400s)
      return throwError(() => err);
    })
  );
};
```

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ],
};
```

### 5.5 Wiring into a component — loading/error/cancellation pattern

```typescript
// features/catalog/course-catalog.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CoursesService } from '../../core/services/courses.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of, finalize } from 'rxjs';
import { CourseSummary } from '../../core/models/course.models';

@Component({ selector: 'app-course-catalog', standalone: true, templateUrl: './course-catalog.component.html' })
export class CourseCatalogComponent implements OnInit {
  private coursesService = inject(CoursesService);

  courses: CourseSummary[] = [];
  loading = false;
  error = false;
  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((search) => {           // switchMap cancels the in-flight request on new keystrokes
        this.loading = true; this.error = false;
        return this.coursesService.getAll({ search }).pipe(
          catchError(() => { this.error = true; return of([] as CourseSummary[]); }),
          finalize(() => (this.loading = false)),
        );
      }),
    ).subscribe((courses) => (this.courses = courses));

    this.search$.next('');
  }

  onSearch(term: string): void { this.search$.next(term); }
}
```

### 5.6 ASP.NET Core routing/controller reference (matches the Swagger you provided)

```csharp
// Controllers/CoursesController.cs — illustrates the actual shape the Angular services above target
[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    public CoursesController(ICourseService courseService) => _courseService = courseService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseSummaryDto>>> GetAll([FromQuery] string? search, [FromQuery] int? page)
        => Ok(await _courseService.GetAllAsync(search, page));

    [HttpGet("{courseId:guid}")]
    public async Task<ActionResult<CourseDto>> GetById(Guid courseId)
        => Ok(await _courseService.GetByIdAsync(courseId));

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CourseDto>> Create([FromForm] CreateCourseRequest request)
        => Ok(await _courseService.CreateAsync(request));

    [HttpPut("{courseId:guid}")]
    [Authorize(Roles = "Admin,Instructor")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CourseDto>> Update(Guid courseId, [FromForm] UpdateCourseRequest request)
        => Ok(await _courseService.UpdateAsync(courseId, request));

    [HttpDelete("{courseId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid courseId) { await _courseService.DeleteAsync(courseId); return Ok(); }

    [HttpGet("{courseId:guid}/lessons")]
    public async Task<ActionResult<IEnumerable<LessonDto>>> GetLessons(Guid courseId)
        => Ok(await _courseService.GetLessonsAsync(courseId));
}
```

```csharp
// Program.cs — CORS + JWT auth + API versioning wiring
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
        policy.WithOrigins(
                "http://localhost:4200",              // ng serve
                "https://your-production-domain.com")  // <-- REPLACE
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        };
    });

builder.Services.AddApiVersioning(o => { o.DefaultApiVersion = new ApiVersion(1, 0); o.AssumeDefaultVersionWhenUnspecified = true; });

var app = builder.Build();
app.UseCors("AngularClient");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

> **Attendance module gap:** add `AttendanceRecordsController` (`GET/POST /api/AttendanceRecords`, `GET /api/AttendanceRecords/course/{courseId}/session/{sessionDate}`, `GET /api/AttendanceRecords/student/{studentId}`) if you want screens `_6`/`_11`/`_20` to be real instead of stubbed — happy to draft this once you confirm it's in scope.

---

## 6. Routing, Auth Guards & State

### 6.1 Route config — lazy-loaded features, guards, resolvers

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { courseResolver } from './core/resolvers/course.resolver';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/catalog/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'courses', loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES) },
  {
    path: 'courses/:courseId',
    resolve: { course: courseResolver },
    loadComponent: () => import('./features/catalog/course-details/course-details.component').then(m => m.CourseDetailsComponent),
  },
  {
    path: 'learn/:courseId',
    canActivate: [authGuard],
    loadChildren: () => import('./features/learning/learning.routes').then(m => m.LEARNING_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Admin', 'Instructor'])],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  { path: 'forbidden', loadComponent: () => import('./shared/ui/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
  { path: '**', redirectTo: '' },
];
```

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../services/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  if (authStore.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};
```

```typescript
// core/guards/role.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../services/auth.store';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  if (authStore.hasAnyRole(allowedRoles)) return true;
  router.navigate(['/forbidden']);
  return false;
};
```

```typescript
// core/resolvers/course.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CoursesService } from '../services/courses.service';

export const courseResolver: ResolveFn<CourseSummary> = (route) =>
  inject(CoursesService).getById(route.paramMap.get('courseId')!);
```

The Swagger `Account` endpoints don't expose a `/roles` field explicitly in `UserDetailsDto` — if roles aren't yet embedded in the JWT claims or `UserDetailsDto`, add a `roles: string[]` field to that DTO server-side; `roleGuard` decodes it from the JWT (`jwt-decode`) or from `AccountService.getDetails()`, whichever you standardize on.

### 6.2 State management recommendation

**Given project scale (single-team, ~17 domains, mostly CRUD + one live quiz/timer flow), recommend NgRx only for cross-cutting, frequently-shared state — not for everything:**

- **NgRx (`@ngrx/store` + `@ngrx/effects`)** for: `auth` session state, `cart/checkout` (Fawaterak flow spans multiple screens/steps), and `enrollment/progress` (needed simultaneously in the dashboard, learning view, and sidebar nav badge).
- **Local component state + services with `BehaviorSubject`/Angular `signal()`** for everything else (course catalog filters, forum thread list, quiz builder form) — avoids NgRx boilerplate tax on screens that are read-once-per-navigation.

```typescript
// core/state/auth/auth.actions.ts
import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { UserDto } from '../../models/account.models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ user: UserDto }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
  },
});
```

```typescript
// core/state/auth/auth.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { Router } from '@angular/router';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private accountService = inject(AccountService);
  private router = inject(Router);

  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    switchMap(({ email, password }) => this.accountService.login({ email, password }).pipe(
      map((user) => AuthActions.loginSuccess({ user })),
      catchError((err) => of(AuthActions.loginFailure({ error: err.message }))),
    )),
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(() => this.router.navigate(['/dashboard'])),
  ), { dispatch: false });
}
```

```typescript
// core/state/auth/auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { UserDto } from '../../models/account.models';

export interface AuthState { user: UserDto | null; error: string | null; loading: boolean; }
const initialState: AuthState = { user: null, error: null, loading: false };

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, user, loading: false })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(AuthActions.logout, () => initialState),
);
```

### 6.3 Lightweight alternative (signals-based `AuthStore`, used in Section 5.3 above)

```typescript
// core/services/auth.store.ts
import { Injectable, signal, computed } from '@angular/core';
import { UserDto } from '../models/account.models';
import { jwtDecode } from 'jwt-decode';

interface JwtClaims { sub: string; role: string | string[]; exp: number; }

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private session = signal<UserDto | null>(this.readFromStorage());

  token = computed(() => this.session()?.token ?? null);
  isAuthenticated = computed(() => !!this.session());

  hasAnyRole(roles: string[]): boolean {
    const t = this.token();
    if (!t) return false;
    const claims = jwtDecode<JwtClaims>(t);
    const userRoles = Array.isArray(claims.role) ? claims.role : [claims.role];
    return roles.some((r) => userRoles.includes(r));
  }

  setSession(user: UserDto): void { this.session.set(user); sessionStorage.setItem('session', JSON.stringify(user)); }
  clearSession(): void { this.session.set(null); sessionStorage.removeItem('session'); }
  private readFromStorage(): UserDto | null {
    const raw = sessionStorage.getItem('session');
    return raw ? JSON.parse(raw) : null;
  }
}
```

---

## 7. Styling & Assets

- **Strategy:** keep Tailwind (the Stitch export is Tailwind-native — reimplementing in plain SCSS/BEM means re-deriving every spacing/color decision already encoded in `DESIGN.md`). Use Angular component `:host` styles only for one-off layout glue; everything else stays utility classes straight out of the `code.html` files.
- **Import path for exported HTML → Angular templates:** copy the `<body>` inner markup from each `_N/code.html` into the matching component template, then:
  1. Replace hardcoded strings with interpolations (`{{ course.title }}`).
  2. Replace `<a href="...">` with `routerLink`.
  3. Replace repeated card/list blocks with `@for` loops bound to service data.
  4. Extract repeated fragments (card, badge, avatar) into `shared/ui/*` components per Section 3.
- **RTL rules from `DESIGN.md` to preserve exactly:** sidebar/drawer anchored right, back-arrows point right / forward-arrows point left, progress bar fills right-to-left, form labels right-aligned above inputs — bake these into the shared `progress-bar` and `input-field` components once, rather than re-implementing per screen.
- **Assets:** move `logo/screen.png` and any icons into `src/assets/`; run course/hero imagery through `ngx-squoosh`/`@angular/build` image optimization or serve via a CDN — don't ship the raw Stitch export images unresized.
- **Icons:** the screens use Google's `Material Symbols Outlined` webfont via CDN link (kept in `index.html`); wrap usage in a small `IconComponent` (`<span class="material-symbols-outlined">check</span>`) so the icon set can be swapped later without touching every template.
- **Component library:** given the design is a fully custom Material-3-token system (not stock Material), **skip Angular Material's theming** and build the `shared/ui` kit directly against the Tailwind config in Section 2 — pulling in Angular Material would fight the existing token system. Use `@angular/cdk` alone (a11y, overlay, focus-trap) without the Material component styles.

---

## 8. Build & Deployment

### 8.1 Production build, served from the ASP.NET project

```bash
ng build --configuration production --base-href /
```

```csharp
// Program.cs (serve the compiled Angular app as static files + SPA fallback)
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();       // serves wwwroot (copy Angular's dist/ output here)

app.UseCors("AngularClient");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapFallbackToFile("index.html"); // Angular router deep-link fallback
app.Run();
```

```bash
# Copy build into ASP.NET's wwwroot as part of a publish script
ng build --configuration production
rm -rf ../EducationalPlatform.Api/wwwroot/*
cp -r dist/edtech-platform/browser/* ../EducationalPlatform.Api/wwwroot/
```

With this approach, `environment.prod.ts`'s `apiBaseUrl: '/api'` is same-origin, so no CORS config is even needed in production (CORS policy above stays for local `ng serve` dev only).

### 8.2 CI/CD — GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy
on: { push: { branches: [main] } }

jobs:
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: edtech-platform/package-lock.json }
      - run: npm ci
        working-directory: edtech-platform
      - run: npm run lint
        working-directory: edtech-platform
      - run: npm run test -- --watch=false --browsers=ChromeHeadless
        working-directory: edtech-platform
      - run: npx ng build --configuration production
        working-directory: edtech-platform
      - uses: actions/upload-artifact@v4
        with: { name: angular-dist, path: edtech-platform/dist/edtech-platform/browser }

  build-backend:
    runs-on: ubuntu-latest
    needs: build-frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with: { name: angular-dist, path: EducationalPlatform.Api/wwwroot }
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '8.0.x' }
      - run: dotnet publish -c Release -o ./publish
        working-directory: EducationalPlatform.Api
      - uses: actions/upload-artifact@v4
        with: { name: api-publish, path: EducationalPlatform.Api/publish }
      # add your deploy step here (Azure Web App / IIS / Docker push)
```

---

## 9. Testing

**Unit/integration (Karma/Jasmine default, or swap to Jest via `jest-preset-angular` for faster CI):**
- Services: mock `HttpClient` with `HttpTestingController`, assert request method/URL/body and response mapping (esp. the `FormData` multipart calls for `Courses`/`CourseFiles`).
- Guards: mock `AuthStore` signals, assert navigation calls on denial.
- Components: `TestBed` + `ComponentFixture`, assert template bindings and output emissions (patterns shown per-component in Section 4).

**E2E (Cypress, given `@cypress/schematic` already scaffolded):**

```typescript
// cypress/e2e/login.cy.ts
describe('Login', () => {
  it('logs in and redirects to dashboard', () => {
    cy.intercept('POST', '/api/Account/login', { statusCode: 200, body: { email: 'a@b.com', token: 'fake-jwt' } }).as('login');
    cy.visit('/login');
    cy.get('input[type=email]').type('a@b.com');
    cy.get('input[type=password]').type('Password1!');
    cy.get('button[type=submit]').click();
    cy.wait('@login');
    cy.url().should('include', '/dashboard');
  });
});
```

```typescript
// cypress/e2e/enrollment.cy.ts
describe('Course enrollment', () => {
  it('enrolls the logged-in student in a course', () => {
    cy.login();  // custom command that seeds sessionStorage with a fake session
    cy.intercept('GET', '/api/Courses/*', { fixture: 'course-details.json' }).as('getCourse');
    cy.intercept('POST', '/api/Enrollments/*/*', { statusCode: 200, body: { id: 'e1', isActive: true } }).as('enroll');
    cy.visit('/courses/course-1');
    cy.wait('@getCourse');
    cy.contains('التسجيل في الدورة').click();
    cy.wait('@enroll');
    cy.contains('تم التسجيل بنجاح');
  });
});
```

```typescript
// cypress/e2e/content-viewing.cy.ts
describe('Lesson viewing & progress', () => {
  it('marks a lesson complete and updates progress', () => {
    cy.login();
    cy.intercept('GET', '/api/Lessons/*', { fixture: 'lesson.json' });
    cy.intercept('POST', '/api/Progress', { statusCode: 200 }).as('markComplete');
    cy.visit('/learn/course-1/lesson/lesson-1');
    cy.contains('إكمال الدرس').click();
    cy.wait('@markComplete');
  });
});
```

---

## 10. Performance & Accessibility

- Lazy-load every feature module (already default in the route config above) — verify with `ng build --stats-json` + `webpack-bundle-analyzer`.
- Angular's default AOT + tree-shaking in `ng build --configuration production`; keep `strict` templates on (`--strict` at `ng new`) to catch dead bindings.
- Image optimization: `NgOptimizedImage` directive (`ngSrc`) for all `course.imageUrl`/hero images; serve `webp` where possible.
- Virtual scrolling (`@angular/cdk/scrolling`) for long forum thread lists and admin tables (`_14` enrollment management, `_18` analytics activity feed).
- Debounce + `switchMap` cancellation on every search/filter input (Section 5.5 pattern) to avoid request pile-up.
- Accessibility: the design already sets `dir="rtl" lang="ar"` globally — preserve it at the `<html>` root, not per-component; ensure every icon-only button has `aria-label` (Material Symbols spans have no inherent text); form inputs need explicit `<label for>` pairing (screens show visual labels but verify the exported markup actually links them); focus-trap modals (`_3` revoke-certificate confirm, `_16` course editor dialogs) via `@angular/cdk/a11y` `FocusTrap`; maintain 44px minimum touch targets per `DESIGN.md`'s own button spec.

---

## 11. Migration Checklist (prioritized, with estimates — single developer, adjust for team size)

| # | Task | Est. |
|---|---|---|
| 1 | Workspace scaffolding, Tailwind token port, ESLint/Prettier, folder structure | 0.5–1 day |
| 2 | Core services + DTOs for all 17 controllers (Section 5) | 2–3 days |
| 3 | Auth flow: login/register, `AuthStore`/NgRx auth slice, interceptors, guards | 1–2 days |
| 4 | Shared UI kit: course-card, progress-bar, badge, button, input-field, modal | 2 days |
| 5 | Public screens: landing (`_9`), catalog (`_2`), course details (`_17`) | 2 days |
| 6 | Checkout/Fawaterak flow (`_22`) incl. webhook-driven status polling | 1.5 days |
| 7 | Student area: dashboard (`_19`), learning view (`_10`, `_21`), progress tracking | 2.5 days |
| 8 | Quiz module: builder (`_8`, admin), taking (`_13`), attempts/results | 2.5 days |
| 9 | Forum module: threads/posts/voting/subscriptions (`_12`) | 2 days |
| 10 | Certificates: my-certificates (`_1`), admin issue/revoke (`_3`) | 1 day |
| 11 | Admin: enrollments (`_14`), course editor (`_16`), roles (`_4`), dashboard (`_18`), shell (`_23`) | 3–4 days |
| 12 | Attendance module (`_6`, `_11`, `_20`) — **pending backend confirmation** | 1.5–2 days once API exists |
| 13 | Profile/settings (`_15`) | 0.5 day |
| 14 | Unit tests across services/guards/critical components | 2–3 days (parallel with above) |
| 15 | Cypress E2E: login, enrollment, quiz attempt, checkout | 1.5 days |
| 16 | Build integration into ASP.NET `wwwroot`, CI/CD pipeline | 1 day |
| 17 | A11y/perf pass, RTL QA across all 23 screens vs. `screen.png` references | 1–1.5 days |

**Total: ~25–32 developer-days** for full scope excluding the attendance backend build.

---

## 12. Deliverables

Once you confirm the open questions below, I will generate:
- Full Angular workspace scaffold (all folders in Section 3, populated) as a downloadable archive.
- All 17+ service files fully implemented against your Swagger paths, with typed DTOs.
- Component templates converted from each `_N/code.html` into Angular templates (data-bound, routerLink-wired).
- Auth + role guard implementation wired to your actual JWT claim shape.
- Sample unit test suite (Jasmine or Jest — your call) and the 3 Cypress specs above expanded to cover all critical flows.
- A `README.md` with exact steps to plug in your real `apiBaseUrl`, CORS origin, and JWT signing config.

**What I need from you to proceed:**
1. **Auth mechanism confirmation** — is `UserDto.token` a JWT bearer token (attached via `Authorization` header) or is the actual session cookie-based (the Logout/Account endpoints suggest possible cookie auth)? This changes the interceptor in Section 5.4.
2. **Role/claims shape** — where do `Admin` / `Instructor` / `Student` / `Receptionist` roles live — JWT claim, `UserDetailsDto` field, or separate `/api/Account/roles` endpoint (not currently in the Swagger export)?
3. **Attendance API** — confirm whether `AttendanceRecords`/`AttendanceSessions` endpoints exist elsewhere or need to be scoped/built (screens `_6`, `_11`, `_20` currently have no backing controller).
4. **CORS origins** — your actual dev + staging + production Angular origins.
5. **Fawaterak flow specifics** — do success/failure redirects (`/api/fawaterak/payment-success`, `-failure`) return query params the Angular checkout result page needs to read (invoice id, status), or does the Angular app poll `Enrollments`/an invoice-status endpoint instead?
6. **i18n** — is Arabic (RTL) the only locale, or is an English/LTR toggle planned (affects whether to bring in `@angular/localize` now vs. later)?
7. **Expected load / concurrent users** — informs whether NgRx entity caching + `Progress`/`Enrollments` polling intervals need throttling.

**Suggested milestones/checkpoints:**
- **Checkpoint 1** (after Task 3 above): auth flow demo against your real backend, confirms token/CORS assumptions before the rest of the app is built on them.
- **Checkpoint 2** (after Task 7): student-facing flow (browse → enroll → learn → progress) fully working end-to-end for review.
- **Checkpoint 3** (after Task 11): admin suite complete, full RTL/design QA pass against the 23 reference screenshots.
- **Checkpoint 4** (after Task 16): staging deployment from the CI pipeline, sign-off before production cutover.