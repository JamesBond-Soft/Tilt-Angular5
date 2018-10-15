export interface ITicketNote {
    ticketNoteId: number,
    comment: string,
    ticketId: number,
    createdDate: Date, //this only gets set by service directly but property is provided for sorting
    createdByUserDisplayName: string
}
