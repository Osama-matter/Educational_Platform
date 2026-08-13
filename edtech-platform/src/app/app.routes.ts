import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Shell Routes (Landing, Catalog, Details, Auth, Checkout, Forum)
  {
    path: '',
    loadComponent: () => import('./layout/public-shell/public-shell.component').then(m => m.PublicShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/catalog/landing/landing.component').then(m => m.LandingComponent),
      },
      {
        path: 'catalog',
        loadComponent: () => import('./features/catalog/catalog/catalog.component').then(m => m.CatalogComponent),
      },
      {
        path: 'catalog/course/:id',
        loadComponent: () => import('./features/catalog/course-details/course-details.component').then(m => m.CourseDetailsComponent),
      },
      {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'auth/register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'learning/:courseId',
        canActivate: [authGuard],
        loadComponent: () => import('./features/learning/learning-view/learning-view.component').then(m => m.LearningViewComponent),
      },
      {
        path: 'checkout/:courseId',
        loadComponent: () => import('./features/checkout/payment-checkout/payment-checkout.component').then(m => m.PaymentCheckoutComponent),
      },
      {
        path: 'forum',
        loadComponent: () => import('./features/forum/forum-thread-list/forum-thread-list.component').then(m => m.ForumThreadListComponent),
      },
    ]
  },

  // Student Shell Routes (Dashboard, Learning, Certificates, Attendance, Profile)
  {
    path: 'student',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/student-shell/student-shell.component').then(m => m.StudentShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
      },
      {
        path: 'certificates',
        loadComponent: () => import('./features/certificates/my-certificates/my-certificates.component').then(m => m.MyCertificatesComponent),
      },

    ]
  },

  // Quiz Taking Screen
  {
    path: 'quizzes/take/:quizId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/quizzes/take-quiz/take-quiz.component').then(m => m.TakeQuizComponent),
  },

  // Admin Shell Routes (Dashboard, Courses, Enrollments, Certificates, Quiz Builder, Roles, Attendance)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () => import('./layout/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/admin/course-editor/course-editor.component').then(m => m.CourseEditorComponent),
      },
      {
        path: 'enrollments',
        loadComponent: () => import('./features/admin/enrollments-management/enrollments-management.component').then(m => m.EnrollmentsManagementComponent),
      },
      {
        path: 'certificates',
        loadComponent: () => import('./features/certificates/admin-certificates/admin-certificates.component').then(m => m.AdminCertificatesComponent),
      },
      {
        path: 'quiz-builder',
        loadComponent: () => import('./features/quizzes/quiz-builder/quiz-builder.component').then(m => m.QuizBuilderComponent),
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/admin/roles-permissions/roles-permissions.component').then(m => m.RolesPermissionsComponent),
      },
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: ''
  }
];
