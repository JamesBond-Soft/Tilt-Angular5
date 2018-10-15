export interface ICourseCategory {
    courseCategoryId: number,
    name: string,
    description: string,
    extCategoryRefNum: string,
    parentCourseCategoryId: number,
    subCourseCategories: ICourseCategory[]
    organisationId: number
}
