import { Component, OnInit, TemplateRef, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'training-next-module-dialog',
  templateUrl: './training-next-module-dialog.component.html',
  styleUrls: ['./training-next-module-dialog.component.scss']
})
export class TrainingNextModuleDialogComponent implements OnInit {
  @ViewChild('nextModuleDialogTemplate') nextModuleDialogTemplate: TemplateRef<any>;
  
  modalRef: BsModalRef;

  @Input() currentModuleName: string;
  @Input() nextModuleName: string;
  
  @Output() onConfirm = new EventEmitter<boolean>();
  

  constructor(private bsModalRef: BsModalRef, 
              private modalService: BsModalService) { }

  ngOnInit() {
  }

  cmdClose() {
    this.bsModalRef.hide();
  }

//  openModal(template: TemplateRef<any>) {
  openModal(currentModuleName: string, nextModuleName: string) {
    this.currentModuleName = currentModuleName;
    this.nextModuleName = nextModuleName;
    
    this.modalRef = this.modalService.show(this.nextModuleDialogTemplate, {class: 'modal-sm'});
  }
 
  confirm(): void {
    this.onConfirm.emit(true);
    this.modalRef.hide();
  }
 
  decline(): void {
    this.onConfirm.emit(false);
    this.modalRef.hide();
  }

}
