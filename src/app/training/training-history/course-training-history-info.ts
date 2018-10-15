export interface ICourseTrainingHistoryInfo {
    courseId: number,
    course: string,
    courseStatus: number, //0 pending, 1 active, 2 inactive
    userId: number
    completionDate: Date,
    startDate: Date,
    prerequisiteCourses: string[],
    courseSessionId: number
}
