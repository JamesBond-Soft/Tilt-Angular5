import { ISelfAssessmentReportDetails } from './self-assessment-report-details';
import { IUserProfile } from '../users/user-profile';
import { IGroup } from '../groups/group';

export interface ISelfAssessmentReport {
    // selfAssessmentReportId: number,
    // userId: number,
    // firstName: string,
    // lastName: string,
    // dob: Date,
    // hrStaffReferenceID: string,
    // groupId: number,
    // status: number,
    // groupIdOveride: number,
    // overrideByManagerId: number,
    // createdDate: Date,
    // details: ISelfAssessmentReportDetails[]
    selfAssessmentReportID: number,
    userId: number,
    userProfileId: number,
    userProfile: IUserProfile,
    groupID: number,
    group: IGroup,
    details: ISelfAssessmentReportDetails[],
    status: number, //values: 0 - pending, 1 - accepted, 2- decline
    groupIdOverride: number,
    groupOvveride: IGroup,
    overrideByManagerId: number,
    createdDate: Date
}

//TODO - change to match .net class implementation
