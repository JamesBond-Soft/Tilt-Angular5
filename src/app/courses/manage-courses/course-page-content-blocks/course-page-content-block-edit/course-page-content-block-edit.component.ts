import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef, ViewChildren, AfterViewInit } from '@angular/core';
import { ICoursePageContentBlock, IContentBlockType } from '../course-page-content-block';
import { TinyEditorComponent } from '../../../../shared/tiny-editor/tiny-editor.component';
import { CoursePageContentBlockService } from '../course-page-content-block.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';


import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { GenericValidator } from '../../../../shared/generic-validator';
import { BsModalService } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { VideoSelectionDialogComponent } from '../video-selection-dialog/video-selection-dialog.component';
import { IResourceLibraryAsset } from '../../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { MediaPickerDialogComponent, IMediaPickerMode } from '../../../../shared/tiny-editor/media-picker-dialog/media-picker-dialog.component';

@Component({
  selector: 'course-page-content-block-edit',
  templateUrl: './course-page-content-block-edit.component.html',
  styleUrls: ['./course-page-content-block-edit.component.scss']
})
export class CoursePageContentBlockEditComponent implements OnInit, OnChanges, AfterViewInit {
  pageTitle: string;
  contentBlockForm: FormGroup;
  IContentBlockType = IContentBlockType;

  @Input() coursePageContentBlock: ICoursePageContentBlock;
  @ViewChild('tinyEditor') tinyEditor: TinyEditorComponent;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished
  
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator; 
  subscriptions: Subscription[] = []; //array to hold modal subscriptions

  constructor(private coursePageContentBlockService: CoursePageContentBlockService,
              private fb: FormBuilder,
              private modalService: BsModalService,
              private changeDetection: ChangeDetectorRef,) {

    this.validationMessages = {
      contentBlockName: {
        required: 'Name is required.',
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    //create the reactive form
    this.initReactiveForm();
    this.populateForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['coursePageContentBlock'] && this.coursePageContentBlock){
      //the coursePageContentBlock value changed
      if(this.coursePageContentBlock){
       this.populateForm();
      } else {
        this.contentBlockForm.reset();
      }
    }
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.contentBlockForm.valueChanges, controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.contentBlockForm);
    });
  }

  initReactiveForm(): void {
    this.contentBlockForm = this.fb.group({
      contentBlockName: ['', Validators.required],
      content: [''],
      blockType: [''],
      resourceLibraryAssetId: [''],
      resourceLibraryAssetName: ['']
    });
  }

  populateForm(): void {
    if(!this.contentBlockForm){
      this.initReactiveForm();
    }

    if(this.coursePageContentBlock.coursePageContentBlockId){
      //this is an edit
      this.pageTitle = 'Edit Content Block';
    } else {
      this.pageTitle = 'Add Content Block';
    }

    if(this.contentBlockForm){
      this.contentBlockForm.reset();
    }

    this.contentBlockForm.patchValue({
      contentBlockName: this.coursePageContentBlock.name,
      content: this.coursePageContentBlock.content,
      blockType: this.coursePageContentBlock.blockType,
      resourceLibraryAssetId: this.coursePageContentBlock.resourceLibraryAssetId,
      resourceLibraryAssetName: 'TODO'
    });

    if(this.coursePageContentBlock.blockType === IContentBlockType.HTML){
      this.tinyEditor.setContent(this.coursePageContentBlock.content);
    }
    
  }
  cmdSavePageContentBlock(): void {
    //save changes to web service

    //validation
    if(this.contentBlockForm.invalid){
      //prevent the user from saving as the form is invalid. This is a failsafe
      console.warn('cmdSavePageContentBlock was called but the reactive form is invalid. Aborting save. (ref cmdSavePageContentBlock)');
      return; 
    }
    
    //skip to go
    if(this.coursePageContentBlock.coursePageContentBlockId && this.contentBlockForm.pristine){
      //skip the saving as nothing was changed during this edit
      this.onFinishEditEvent.emit(false);
      return;
    }

    //make a copy of the edited object
    let modifiedCoursePageContentBlock = Object.assign({}, this.coursePageContentBlock);

    //merge the reactive form values to the contentBlock item
    modifiedCoursePageContentBlock.name = this.contentBlockForm.get('contentBlockName').value; //name
    modifiedCoursePageContentBlock.blockType = this.contentBlockForm.get('blockType').value;

    //merge the fields based on contentBlockType (ie html, video or etc)
    if(modifiedCoursePageContentBlock.blockType === IContentBlockType.HTML){
      //get the html content
      let contentBlockHtml: string = this.tinyEditor.editor.getContent();//{ format: 'raw' }); //content - in raw html
      modifiedCoursePageContentBlock.content = contentBlockHtml;
      modifiedCoursePageContentBlock.resourceLibraryAssetId = null; //set the resourseLibraryAssetId to null as you cannot have content with video
    } else if(modifiedCoursePageContentBlock.blockType === IContentBlockType.Video) {
      //get the video content
      modifiedCoursePageContentBlock.resourceLibraryAssetId = this.contentBlockForm.get('resourceLibraryAssetId').value;
      modifiedCoursePageContentBlock.content = null;      //set the content as null as we are not including anything in there
    }

    //save the changes
     this.coursePageContentBlockService.saveCoursePage(modifiedCoursePageContentBlock).subscribe(() => {
       this.onFinishEditEvent.emit(true);
     }, error => alert(`Error: ${error} (ref cmdSavePageContentBlock)`));
  }

  cmdCancelEditPageContentBlock(): void {
    //user pressed the cancel button
    this.onFinishEditEvent.emit(false);
  }

  cmdDeletePageContentBlock(): void {
    //deletes the selected content block

    //ask for confirmation
    if(confirm('Are you sure you want to Delete this Content Block?')){
      //call webservice
      this.coursePageContentBlockService.deleteCoursePageContentBlock(this.coursePageContentBlock.coursePageContentBlockId).subscribe(() => {
        //call finishEdit and ensure shouldResult is true
        this.onFinishEditEvent.emit(true);
      }, error => alert(`Unexpected error: ${error}.\r\nPlease refresh the page and try again. (ref cmdDeletePageContentBlock)`));
    }
  }

  onVideoSelectedHandler(videoModeSelected: boolean): void {
    //check if there is any existing content - if so, warn that it will be lost
    let contentBlockHtml: string = this.tinyEditor.editor.getContent();
    if(contentBlockHtml && contentBlockHtml.length){
      if(!confirm('Warning: The existing content in this block will be lost if you insert a video.\r\nDo you wish to continue?')){
        return;
      }
    }
    //alert('video mode enabled');
   //this.openVideoSelectionDialog();
   this.openMediaSelectionDialog(IMediaPickerMode.Video);
    //show dialog with a list of videos to select from

    //handler the selection event by hiding the editor

    //cancelling the selection will show the editor again
  }

  openVideoSelectionDialog(): void {
    //opens the video-selection-dialog component in a modal, and subscribes to the hide event

    //set the initial state objects
    //let initialState: any = {page: page};
    let initialState: any = {};
    let videoSelectionDialogModalRef: BsModalRef = this.modalService.show(VideoSelectionDialogComponent, {initialState: {initialState}, class: 'modal-lg'});
    
    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)
          
          //get any data from the component if needed
          let vsdComp: VideoSelectionDialogComponent  = videoSelectionDialogModalRef.content;
          if(vsdComp && vsdComp.selectedAsset){
           //the user selected a video
           //alert(`video selected: ${vsdComp.selectedVideo}`)
           //this.selectedResourceLibraryAsset = vsdComp.selectedAsset;
           //this.coursePageContentBlock.resourceLibraryAssetId = vsdComp.selectedAsset.resourceLibraryAssetId;
          // this.coursePageContentBlock.blockType = IContentBlockType.Video;
          this.contentBlockForm.patchValue({
            blockType: IContentBlockType.Video,
            resourceLibraryAssetName: vsdComp.selectedAsset.name,
            resourceLibraryAssetId: vsdComp.selectedAsset.resourceLibraryAssetId
          });
          this.contentBlockForm.markAsDirty();
          } else {
            //the user didnt select anything

          }
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  openMediaSelectionDialog(mediaPickerMode: IMediaPickerMode): void {
    //opens the video-selection-dialog component in a modal, and subscribes to the hide event

    //set the initial state objects
    //let initialState: any = {page: page};
    let initialState: any = {mediaPickerMode: mediaPickerMode};
    let mediaPickerDialogComponentModalRef: BsModalRef = this.modalService.show(MediaPickerDialogComponent, {initialState: initialState, class: 'modal-lg'});
    
    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)
          
          //get any data from the component if needed
          let vsdComp: MediaPickerDialogComponent  = mediaPickerDialogComponentModalRef.content;
          if(vsdComp && vsdComp.selectedAsset){
          
            if(mediaPickerMode === IMediaPickerMode.Video){
              this.contentBlockForm.patchValue({
                blockType: IContentBlockType.Video,
                resourceLibraryAssetName: vsdComp.selectedAsset.name,
                resourceLibraryAssetId: vsdComp.selectedAsset.resourceLibraryAssetId
              });
            }
          
          this.contentBlockForm.markAsDirty();
          } else {
            //the user didnt select anything

          }
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  cmdClearVideo(): void {
    this.contentBlockForm.patchValue({
      blockType: IContentBlockType.HTML,
      resourceLibraryAssetName: null,
      resourceLibraryAssetId: null
    });
  }

}


