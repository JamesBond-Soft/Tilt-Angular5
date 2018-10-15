export class LiveBroadcast {
    name: string;
    type: string;
    streamId: string;
    viewerCount: number;
    status: string;
    ipAddr: string;
    username: string;
    password: string;
    streamUrl: string;
    date: number;
    duration: number;
    description: string;
    quality: string;
    speed: number;
    // endPointList: Endpoint[];
    hlsViewerCount = 0;
    webRTCViewerCount = 0;
    rtmpViewerCount = 0;
}

export class EndPoint {
    id: string;
    rtmpUrl: string;
}

export enum BroadcastingStatus {
    'STARTING' = 0,
    'BROADCASTING' = 1,
    'PAUSED' = 2,
    'COMPLETED' = 3
}

export enum DeviceType {
    'SCREENSHARE' = 1,
    'WEBCAM' = 0
}
