import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IOrganisation } from '../../../settings/settings-organisations/organisation';
import { ITicket, ITicketStatusType, ITicketType } from '../../ticket';
import { SupportService } from '../../support.service';

@Component({
  selector: 'issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {
  pageTitle: string = "Issues";
  tickets: ITicket[];
  orgs: IOrganisation[];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private supportService: SupportService) { }

  ngOnInit() {
    this.loadOrganisations();
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      //load the loadTickets now
      this.loadTickets();
    });
  }

  private loadTickets(): void {
    this.supportService.getTickets().subscribe(tickets => {
      this.tickets = tickets.reverse();
    }, error => console.log(`Unexpected error: ${error} (ref loadTickets)`));
  }

  public cmdAddTicket(): void {
    this.router.navigate(['support/issues', 0, "Add"]);
  }

  public cmdEditTicket(event: Event, ticket: ITicket): void {
    event.stopPropagation();
    this.router.navigate(['support/issues', ticket.ticketId, ticket.title]);
  }

  public getTicketStatusCSS(ticket: ITicket) {
    let cssClasses = {
      'label-primary': ticket.status === ITicketStatusType.Open,
      'label-secondary': ticket.status === ITicketStatusType.Assigned,
      'label-info' : ticket.status === ITicketStatusType.Underway,
      'label-default' : ticket.status === ITicketStatusType.Closed
    }
    return cssClasses;
  }

  getTicketTypeCSS(ticket: ITicket){
    let cssClasses = {
      'label-primary': ticket.ticketType === ITicketType.Feedback,
      'label-danger': ticket.ticketType === ITicketType.Issue,
      'label-info' : ticket.ticketType === ITicketType.Other
    }
    return cssClasses;
  }


}
