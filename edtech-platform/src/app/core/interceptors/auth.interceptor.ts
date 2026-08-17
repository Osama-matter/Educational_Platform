import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ensure credentials (cookies) are ONLY sent to the application's trusted backend API
  const isApiRequest =
    req.url.startsWith(environment.apiBaseUrl) ||
    req.url.startsWith('/api') ||
    req.url.startsWith('http://localhost:5062') ||
    req.url.startsWith('https://localhost:5062') ||
    req.url.startsWith('https://matterhub.runasp.net');

  if (isApiRequest) {
    req = req.clone({
      withCredentials: true,
    });
  }

  return next(req);
};
