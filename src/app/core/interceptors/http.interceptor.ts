import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error instanceof ErrorEvent
          ? error.error.message
          : error.error?.title ?? error.message ?? 'Unexpected server error';
      console.error(`[HTTP ${error.status}] ${req.method} ${req.url}: ${message}`);
      return throwError(() => new Error(message));
    })
  );
};
