import { IGroup } from "../../groups/group";

export interface ISelfAssessmentQuestionResponse {
    selfAssessmentQuestionResponseId: number,
    response: string,
    relatedGroup: IGroup,
    relatedGroupId: number,
    selfAssessmentQuestionId: number
}
