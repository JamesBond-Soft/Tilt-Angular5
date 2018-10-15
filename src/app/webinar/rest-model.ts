import { IWebinarStatus } from './webinar';
export class IUpdateStatusRestModel {
    newStatus: IWebinarStatus;
    webinarId: number;
}

export class IUpdateHLSUrlRestModel {
    HLSUrl: string;
    webinarId: number;
}

export class IUpdateResourceIdRestModel {
    webinarId: number;
    ResourceLibraryAssetId: number;
}