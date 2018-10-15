import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs/Subscription';
import { SettingsUsersService } from '../../settings-users/settings-users.service';
import { IUser } from '../../settings-users/user';

@Component({
  selector: 'support-user-selection-dialog',
  templateUrl: './support-user-selection-dialog.component.html'
})
export class SupportUserSelectionDialogComponent implements OnInit {
  pageTitle: string;
  eligibleSupportUsers: IUser[];
  selectedUser: IUser;
  subscriptions: Subscription[] = [];
  @Output() dialogHidden = new EventEmitter();
  organisationId: number;

  @ViewChild('supportUserSelectionDialogTemplate') supportUserSelectionDialogTemplate: TemplateRef<any>;
  modalRef: BsModalRef;
  constructor(private bsModalRef: BsModalRef, 
              private modalService: BsModalService,
              private settingsUsersService: SettingsUsersService) { }

  ngOnInit() {
    this.pageTitle = "Select Support User";
    
  }

  private loadEligibleSupportUsers(): void {
    this.settingsUsersService.getEligibleSupportUsers(this.organisationId).subscribe(eligibleSupportUsers => this.eligibleSupportUsers = eligibleSupportUsers, 
                                                                  error => console.log(`Unxpected error - ${error} (ref loadEligibleSupportUsers)`));
  }

  openModal(organisationId: number, currentSelectedUserId: number = 0) {
    this.organisationId = organisationId;
    this.loadEligibleSupportUsers();

    this.settingsUsersService.getEligibleSupportUsers(this.organisationId).subscribe(eligibleSupportUsers => {
        this.eligibleSupportUsers = eligibleSupportUsers;

        //find the current selected user in the collection and set the property
        this.selectedUser = this.eligibleSupportUsers.find(u => u.userId === currentSelectedUserId);

        this.modalRef = this.modalService.show(this.supportUserSelectionDialogTemplate, {class: 'modal-lg'});

        this.subscriptions.push(
          this.modalService.onHide.subscribe((reason: string) => {
            const _reason = reason ? `, dismissed by ${reason}` : '';
          })
        );
        this.subscriptions.push(
          this.modalService.onHidden.subscribe((reason: string) => {
            const _reason = reason ? `, dismissed by ${reason}` : '';
            this.dialogHidden.emit();
            this.unsubscribe();
          })
        );
      }, 
      error => console.log(`Unxpected error - ${error} (ref loadEligibleSupportUsers)`)
    );


   
  }

  cmdClose() {
    this.modalRef.hide();
  }

  cmdSelectUser(selectedUser: IUser): void {
    this.selectedUser = selectedUser;
    this.modalRef.hide();
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

}
