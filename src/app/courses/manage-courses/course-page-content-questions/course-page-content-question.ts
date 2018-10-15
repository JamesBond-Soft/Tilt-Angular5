import { ICoursePageContentQuestionResponse } from "./course-page-content-question-response";

export interface ICoursePageContentQuestion {
    coursePageContentQuestionId: number,
    coursePageId: number,
    coursePageContentId: number,
    question: string,
    order: number,
    coursePageContentQuestionType: ICoursePageContentQuestionType,
    coursePageContentQuestionResponses: ICoursePageContentQuestionResponse[]
    extRefNum: string
}

export enum ICoursePageContentQuestionType {
        SingleChoice = 0,
        MultiChoice = 1,
        WrittenAnswer = 2
}
    