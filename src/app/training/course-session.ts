export interface ICourseSession {
    courseSessionId: number,
    courseId: number,
    userId: number,
    currentCourseModuleId: number,
    currentCoursePageId: number,
    courseProgress: number,
    dateCompleted: Date
    status: ICourseSessionStatusType
}

export enum ICourseSessionStatusType
    {
        NotStarted = 0, //default
        Underway = 1, //user clicked on the course to start
        Completed = 2, //user completed the course!
        Cancelled = 3 //CourseSession was cancelled by admin eg course modified, and users must start new course, or user moved to different group and should no longer perform this course
    }


    export interface IUpdateCourseAssignmentScheduleParam{
        id: number,
        source: string,
        courseSessionId:number
    }