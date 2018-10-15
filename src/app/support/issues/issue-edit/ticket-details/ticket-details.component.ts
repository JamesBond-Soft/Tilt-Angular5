import { Component, OnInit, Input } from '@angular/core';
import { ITicket, ITicketStatusType, ITicketType, ITicketResolutionType } from '../../../ticket';
import { IOrganisation } from '../../../../settings/settings-organisations/organisation';

@Component({
  selector: 'ticket-details',
  templateUrl: './ticket-details.component.html'
})
export class TicketDetailsComponent implements OnInit {
  ITicketStatusType = ITicketStatusType;
  ITicketType = ITicketType;
  ITicketResolutionType = ITicketResolutionType;

  @Input() ticket: ITicket;
  @Input() organisations: IOrganisation[];

  
  constructor() { }

  ngOnInit() {

  }

}
