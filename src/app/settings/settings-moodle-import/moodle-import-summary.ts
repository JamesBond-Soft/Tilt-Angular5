import { ICourse } from "../../courses/manage-courses/course";
import { ICourseModule } from "../../courses/manage-courses/course-modules/course-module";

export interface IMoodleImportSummary {
    moodleImportSummaryId: number,
    backupName: string,
    backupId: number,
    backupFormat: number,
    backupDate: Date,
    moodleVersion: string,
    moodleRelease: string,
    referenceNum: string,
    originalSourceSite: string,
    originalSiteIdentifier: string,
    originalCourseId: string,
    originalCourseFullName: string,
    originalCourseShortName: string,
    originalCourseSummary: string,
    originalCourseRefId: string,
    originalCourseStartDate: Date,
    originalCourseEndDate: Date,
    originalCourseSectionsCount: number,
    originalCourseActivitiesCount: number
    originalCourseSectionNames: string[]
    originalCourseActivityNames: string[],
    course: ICourse,
    moodleMappedCourseModules: IMoodleMappedCourseModule[]
}

export interface IMoodleMappedCourseModule {
    moodleSectionId: number,
    moodleSectionName: string,
    moodleActivityCount: number,
    moodleQuizCount: number,
    moodleResourceCount: number,
    courseModule: ICourseModule
}