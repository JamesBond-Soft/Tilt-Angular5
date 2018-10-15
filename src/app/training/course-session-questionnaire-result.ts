import { ICourseSessionResult } from "./course-session-result";
import { ICourseSession } from "./course-session";
import { ICoursePageContentQuestionPack } from "../courses/manage-courses/course-page-content-questions/course-page-content-question-pack";
import { ICoursePageContent } from "../courses/manage-courses/course-pages/course-page-content";

export interface ICourseSessionQuestionnaireResult {
    courseSessionQuestionnaireResultId: number,
    courseSessionResultId: number,
    courseSessionResult: ICourseSessionResult,
    courseSessionId: number,
    courseSession: ICourseSession,
    coursePageContentQuestionPackId: number,
    coursePageContentQuestionPack: ICoursePageContentQuestionPack,
    coursePageContentId: number,
    coursePageContent: ICoursePageContent,
    totalCorrect: number,
    totalQuestions: number,
    pass: boolean
}
