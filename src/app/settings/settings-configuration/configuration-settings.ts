import { IConfigurationOrganisationSettings } from "./configuration-organisation-settings";

export interface IConfigurationSettings {
    supportTicketEscalationEnabled: boolean,
    supportSysAdminUserId: number,
    supportSysAdminUserDisplayName: string,
    configurationOrganisationSettingsList: IConfigurationOrganisationSettings[]
}
