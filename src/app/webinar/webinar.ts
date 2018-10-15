export interface IWebinarGroupAssignment {
    webinarGroupAssignmentId: number;
    webinarId: number;
    groupId: number;
}

export interface IWebinar {
    webinarId: number;
    name: string;
    description: string;
    scheduledDate: Date;
    duration: number; 
    recordAsResource: Boolean; // 0: No, 1: Yes
    notificationType: IWebinarNotificationType;
    status: IWebinarStatus;
    hlsUrl: string; // AWS Video URL or live URL if webinar is currently live
    agenda: string;
    webinarGroupAssignments: IWebinarGroupAssignment[];
    createdByUserId: number;
    notificationBatchId: number;
    resourceLibraryAssetId: number;
}
export enum IWebinarStatus {
    SCHEDULED = 0,
    STARTING = 1,
    LIVE = 2,
    COMPLETED = 3
}

export enum IWebinarNotificationType {
    NO = 0,
    PUSH = 1,
    EMAIL = 2
}