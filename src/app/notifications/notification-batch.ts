import { INotificationType } from "./notification";

export interface INotificationBatch {
    notificationBatchId: number,
    notificationType: INotificationType,
    subject: string,
    body: string,
    organisationId: number,
    priority: number, //0-5, 3 is default
    scheduledDate: Date,
    expiryDate: Date,
    notificationBatchGroupAssignments: INotificationBatchGroupAssignment[],
    notificationBatchUserAssignments: INotificationBatchUserAssignment[],
    createdDate: Date,
    createdByUserId: number,
    notificationsCreated: boolean,
    passedTime: string
}

export interface INotificationBatchGroupAssignment {
    notificationBatchGroupAssignmentId: number,
    notificationBatchId: number,
    groupId: number
}

export interface INotificationBatchUserAssignment {
    notificationBatchUserAssignmentId: number,
    notificationBatchId: number,
    userId: number
}

