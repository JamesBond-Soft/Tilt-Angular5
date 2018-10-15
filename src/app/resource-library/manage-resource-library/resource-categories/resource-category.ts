export interface IResourceCategory {
    resourceCategoryId: number,
    name: string,
    description: string,
    extCategoryRefNum: string,
    parentResourceCategoryId: number,
    subResourceCategories: IResourceCategory[]
    organisationId: number
}
