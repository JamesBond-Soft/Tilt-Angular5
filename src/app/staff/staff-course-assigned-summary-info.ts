import { ICourseSession } from '../training/course-session';

export interface StaffAssignedCourseSummaryInfo {
    courseId: number;
    courseAdhocAssignmentId: number;
    courseSession: ICourseSession;
    courseName: string;
    dueDate: Date;
}
