export interface IGroup {
    groupId: number,
    name: string,
    description: string,
    extGroupRefNum: string,
    parentGroupId: number
    subGroups: IGroup[],
    organisationId: number,
    assigned : boolean
}
