import { ICoursePageContent } from "./course-page-content";
import { ICoursePageContentQuestion } from "../course-page-content-questions/course-page-content-question";

export interface ICoursePage {
    coursePageId: number,
    name: string,
    order: number,
    coursePageContentId: number,
    coursePageContent: ICoursePageContent,
    courseModuleId: number
}
