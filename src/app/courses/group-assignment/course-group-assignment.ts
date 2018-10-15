export interface ICourseGroupAssignment {
    courseGroupAssignmentId: number,
    courseId: number,
    groupId: number,
    subGroupsCanInherit: boolean,
    repeatInterval: number,
    repeatUnit: string,
    startDate: Date,
    endDate: Date,
    dueDate: Date
}
