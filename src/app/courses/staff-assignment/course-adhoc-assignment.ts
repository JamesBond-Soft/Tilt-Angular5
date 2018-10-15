export interface ICourseAdhocAssignment {
    courseAdhocAssignmentId: number,
    courseId: number,
    userId: number,
    repeatInterval: number,
    repeatUnit: string,
    startDate: Date,
    endDate: Date,
    dueDate: Date
}
