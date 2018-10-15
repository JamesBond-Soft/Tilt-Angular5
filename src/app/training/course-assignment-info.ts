import { ICourse } from "../courses/manage-courses/course";
import { ICourseSession } from "./course-session";

export interface ICourseAssignmentInfo {
    id: number,
    courseId: number,
    course: ICourse,
    userId: number,
    startDate: Date,
    endDate: Date,
    dueDate: Date,
    repeatInterval: number,
    repeatUnit: string,
    courseSession: ICourseSession,
    source: string,
    assignmentScheduleId:number
}
