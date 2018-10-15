import { ITicketNote } from "./ticket-note";

export interface ITicket {
  ticketId: number,
  title: string,
  description: string,
  ticketNotes: ITicketNote[],
  status: ITicketStatusType,
  ticketType: ITicketType,
  ticketResolution: ITicketResolutionType,
  organisationId: number,
  reportedByUserId: number,
  reportedByUserDisplayName: string,
  assignedUserId: number,
  assignedUserDisplayName: string,
  createdDate: Date, //this only gets set by service directly but property is provided for sorting
  modifiedDate: Date //this only gets set by service directly but property is provided for sorting
}

export enum ITicketType {
  Issue = 0,
  Feedback = 1,
  Other = 2
}

export enum ITicketStatusType {
  Open = 0,
  Assigned = 1,
  Underway = 2,
  Closed = 3
}

export enum ITicketResolutionType {
  NotFixed = 0,
  Fixed = 1,
  WontFix = 2
}
