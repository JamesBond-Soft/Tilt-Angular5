import { ICoursePageContentQuestion } from "../course-page-content-questions/course-page-content-question";
import { ICoursePageContentBlock } from "../course-page-content-blocks/course-page-content-block";

export interface ICoursePageContent {
    coursePageContentId: number,
    coursePageId: number,
    coursePageTemplateId: number,
    templateType: number,
    coursePageContentQuestions: ICoursePageContentQuestion[],
    coursePageContentBlocks: ICoursePageContentBlock[]
}
