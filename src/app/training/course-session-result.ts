import { ICourseSession } from "./course-session";
import { ICourseSessionQuestionnaireResult } from "./course-session-questionnaire-result";

export interface ICourseSessionResult {
    courseSessionResultId: number,
    courseSessionId: number,
    courseSession: ICourseSession,
    totalCorrect: number,
    totalQuestions: number,
    pass: boolean,
    courseSessionQuestionnaireResults: ICourseSessionQuestionnaireResult[]
}
