export interface ICourseMapInfo {
    courseId: number
    courseModuleList: ICourseModuleInfo[]
}

export interface ICourseModuleInfo {
    courseModuleId: number,
    coursePageIdList: number[]
}