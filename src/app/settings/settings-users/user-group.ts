import { IGroup } from "../../groups/group";

export interface IUserGroup {
    userGroupID: number,
    groupID: number,
    group: IGroup,
    userProfileID: number
}
