import { AbstractControl, ValidatorFn } from '@angular/forms';

export class ConfirmPasswordValidator {
    static match(passwordCtrlName: string): ValidatorFn {
        return (c:AbstractControl): { [key: string]: boolean } | null => {
            if(!c.parent){
                return null;
            }
            
            var passwordCtrl: AbstractControl = c.parent.get(passwordCtrlName);

            if(!passwordCtrl){
                return null;
            }

            if(c.pristine && passwordCtrl.pristine){
                return null;
            }

            if(c.value === passwordCtrl.value){
                return null;
            }

            return { 'match': true };

            // if(c.value && c.parent.get(passwordCtrlName) && c.parent.get(passwordCtrlName).value && c.value === c.parent.get(passwordCtrlName).value){
            //     return {'match': true};
            // } else {
            //     return {'match': false};
            // }

            // if(c.pristine && confirmControl.pristine){
            //     return null;
            // }
          
            // if(emailControl.value === confirmControl.value) {
            //     return null;
            // }
          
            
           // return null;
        }
    }
}