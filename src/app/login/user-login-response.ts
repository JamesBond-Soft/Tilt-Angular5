export interface IUserLoginResponse {
    userId: number,
    authToken: string,
    expiresInSeconds: number,
    displayName: string,
    roles: string[],
    userProfileId: number,
    organisationId: number
}
