export interface ICourseAdhocAssignmentSummaryInfo {
    courseAdhocAssignmentId: number,
    courseId: number,
    userId: number,
    staffName: string,
    progress: number,
    status: number,
    dueDate: Date,
    completedDate: Date
}
