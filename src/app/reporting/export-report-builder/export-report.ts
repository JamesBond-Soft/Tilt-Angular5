import { IExportReportColumn } from "./export-report-column";

export interface IExportReport {
    exportReportId: number;
    name: string;
    description: string;
    extRefReportNum: string;
    status: IExportReportStatusType;
    exportReportOrganisations: IExportReportOrganisation[];
    exportReportColumns: IExportReportColumn[];
}

export enum IExportReportStatusType {
    Pending = 0,
    Active = 1,
    Archived = 2
}

export interface IExportReportOrganisation {
    exportReportId: number;
    organisationId: number;
}
