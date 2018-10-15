import { ICourseSessionUserDataQuestionResponse } from "./course-session-user-data-question-response";

export interface ICourseSessionUserData {
    courseSessionUserDataId: number,
    courseSessionId: number,
    courseId: number,
    courseModuleId: number,
    coursePageId: number
    courseSessionUserDataQuestionResponses: ICourseSessionUserDataQuestionResponse[]
}
