import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { map } from 'rxjs/operators/map';
import { retry } from 'rxjs/operators/retry';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Subject, Subscriber } from 'rxjs';
import { catchError } from 'rxjs/operators/catchError';

import { environment } from '../../environments/environment';
import { ITicket, ITicketStatusType, ITicketType, ITicketResolutionType } from './ticket';
import { ITicketNote } from './ticket-note';

@Injectable()
export class SupportService {
  private baseUrl: string = `${environment.apiURL}/api/support`;

  constructor(private http: HttpClient) { }

  public getTickets(): Observable<ITicket[]> {
    return this.http.get<ITicket[]>(`${this.baseUrl}`)
    .pipe(
      map(tickets => {
        tickets.map(ticket => ticket.ticketNotes = this.sortTicketNotes(ticket.ticketNotes))
        return this.sortTickets(tickets)
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError)
    );
}

public getTicket(ticketId: number): Observable<ITicket> {
  return this.http.get<ITicket>(`${this.baseUrl}/${ticketId}`)
    .pipe(
      map(ticket => { ticket.ticketNotes = this.sortTicketNotes(ticket.ticketNotes); return ticket }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError)
    );
}

public saveTicket(ticket: ITicket): Observable<ITicket> {
  if (ticket.ticketId === 0) {
    //create new item
    return this.createTicket(ticket);
  } else {
    //update existing item
    return this.updateTicket(ticket);
  }
}

public deleteTicket(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`)
    .catch(this.handleError);
}

private createTicket(ticket: ITicket): Observable<ITicket> {
  return this.http.post(this.baseUrl, ticket)
    .map(this.extractData)
    .catch(this.handleError);
}

private updateTicket(ticket: ITicket): Observable<ITicket> {
  return this.http.put(`${this.baseUrl}/${ticket.ticketId}`, ticket)
    .map(this.extractData)
    .catch(this.handleError);
}

  public initTicket(): ITicket {
    return {
      ticketId: 0,
      title: '',
      description: '',
      organisationId: 0,
      status: ITicketStatusType.Open,
      ticketType: ITicketType.Issue,
      ticketResolution: null,
      ticketNotes: [],
      assignedUserId: null,
      assignedUserDisplayName: '',
      reportedByUserId: null,
      reportedByUserDisplayName: '',
      createdDate: new Date(), //this only gets set by service directly but property is provided for sorting
      modifiedDate: new Date() //this only gets set by service directly but property is provided for sorting
    }
  }

  public initTicketNode(): ITicketNote {
    return {
      ticketNoteId: 0,
      ticketId: 0,
      comment: '',
      createdDate: new Date(), //this only gets set by service directly but property is provided for sorting
      createdByUserDisplayName: ''
    }
  }

  sortTickets(ticketList: ITicket[]): ITicket[] {
    return ticketList.sort((a: ITicket, b: ITicket) => {
      return a.modifiedDate.valueOf() - b.modifiedDate.valueOf();
    });
  }

  sortTicketNotes(ticketNotesList: ITicketNote[]): ITicketNote[] {
    return ticketNotesList.sort((a: ITicketNote, b: ITicketNote) => {
      return a.createdDate.valueOf() - b.createdDate.valueOf();
    });
  }

  private extractData(response: Response) {
    let body = response;
    return body || {};
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable(
      'Something bad happened; please try again later.');
  };
}
