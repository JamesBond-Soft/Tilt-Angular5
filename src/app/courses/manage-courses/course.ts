export interface ICourse {
    courseId: number,
    name: string,
    description: string,
    extRefCourseNum: string,
    courseCategoryId: number,
    organisationId: number,
    status: number //0 pending, 1 active, 2 inactive
}
