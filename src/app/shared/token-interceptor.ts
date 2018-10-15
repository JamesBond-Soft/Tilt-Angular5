import { Injectable } from '@angular/core';

import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {
    // singleton class that automatically insertes the bearer authentication token into every http request.
    // TODO add filter to only inject token when calling backend service only    
    constructor() {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if ( !request.url.includes('antcommunity.760dev.com'))
        {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${localStorage.getItem('tsa_token')}`
                }
            });
        }

        return next.handle(request);
    }
}
