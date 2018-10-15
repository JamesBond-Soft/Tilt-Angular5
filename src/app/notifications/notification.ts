export interface INotification {
    notificationId: number,
    notificationType: INotificationType,
    subject: string,
    body: string,
    userId: number,
    organisationId: number,
    userDeviceId: number,
    userDevice: any,
    deviceType: any,
    priority: number, //0-5, 3 - is default
    recipientToken: string,
    sent: boolean,
    sentDate: Date,
    expiryDate: Date,
    read: boolean,
    createdDate: Date,
    createdByUserId: number,
    modifiedDate: Date,
    modifiedByUserId: number
}

export enum INotificationType
{
        Email = 0,
        Push = 1,
        Silent = 2
}