import { Observable } from "rxjs";

export interface OnTrainingPageChange {
    //hook for saving any user data in a training-component when going to the next or preview page in training
    saveComponentUserData(): Observable<void>
    canMoveForward(): boolean
}