import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../services/auth.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.clearSession();

        // Avoid redirecting on initial session check or when browsing public routes
        const isMeCheck = req.url.includes('/Account/me');
        const currentUrl = router.url;
        const isPublicRoute =
          currentUrl === '/' ||
          currentUrl.startsWith('/catalog') ||
          currentUrl.startsWith('/auth');

        if (!isMeCheck && !isPublicRoute) {
          router.navigate(['/auth/login'], { queryParams: { returnUrl: currentUrl } });
        }
      } else if (error.status === 403) {
        console.warn('[Access Denied 403] Insufficient permissions for this resource.');
      }
      return throwError(() => error);
    })
  );
};
