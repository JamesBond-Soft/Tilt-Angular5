import { ICoursePageContentQuestion } from "./course-page-content-question";

export interface ICoursePageContentQuestionPack {
    coursePageContentQuestionPackId :number,
    coursePageContentQuestions: ICoursePageContentQuestion[],
    coursePageId: number,
    coursePageContentId: number,
    maximumAllowedWrong: number
}
