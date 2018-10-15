import { IUserProfile } from '../../users/user-profile';

// Defines the user entity
export interface IUser {
    userId: number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    pin: string,
    password: string,
    roleId: number,
    organisationId: number,
    userProfile: IUserProfile
}