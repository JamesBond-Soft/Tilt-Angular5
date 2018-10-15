import { ISelfAssessmentQuestionResponse } from "./self-assessment-question-response";

export interface ISelfAssessmentQuestion {
    selfAssessmentQuestionId: number,
    organisationId: number,
    question: string,
    responses: ISelfAssessmentQuestionResponse[],
    order: number
}
