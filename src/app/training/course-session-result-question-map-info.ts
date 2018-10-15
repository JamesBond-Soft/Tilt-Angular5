export interface ICourseSessionResultQuestionMapInfo {
    courseSessionId: number,
    coursePageId: number,
    courseModuleId: number,
    coursePageContentQuestionId: number,
    question: string,
    responses: ICourseSessionResultQuestionResponseMapInfo[],
    pass: boolean,
    score: number
}

export interface ICourseSessionResultQuestionResponseMapInfo {
    courseSessionUserDataQuestionResponseId: number,
    answer: string,
    score: string
}