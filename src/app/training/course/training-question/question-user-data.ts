import { ICoursePageContentQuestionResponse } from "../../../courses/manage-courses/course-page-content-questions/course-page-content-question-response";
import { ICoursePageContentQuestion } from "../../../courses/manage-courses/course-page-content-questions/course-page-content-question";
import { ICourseSessionUserDataQuestionResponse } from "../../course-session-user-data-question-response";

export interface IQuestionUserDataQuestionMap {
    questionItem: ICoursePageContentQuestion,
    responseItems: IQuestionUserDataResponseMap[]
}

export interface IQuestionUserDataResponseMap  {
    responseItem: ICoursePageContentQuestionResponse,
    selected: boolean,
    textValue: string,
    courseSessionUserDataQuestionResponse: ICourseSessionUserDataQuestionResponse
}


