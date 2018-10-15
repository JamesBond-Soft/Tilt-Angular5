
import { Component, OnInit, ViewChild, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
//import { ICoursePageContentBlock, IContentBlockType } from '../../course-page-content-blocks/course-page-content-block';
//import { CoursePageService } from '../course-page.service';
//import { BsModalService, BsModalRef } from 'ngx-bootstrap';
//import { TinyEditorComponent } from '../../../../shared/tiny-editor/tiny-editor.component';
//import { CoursePageContentBlockService } from '../../course-page-content-blocks/course-page-content-block.service';
import { ICoursePage } from '../course-page';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { CoursePageContentBlockService } from '../../course-page-content-blocks/course-page-content-block.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { CoursePagePreviewDialogComponent } from '../course-page-preview-dialog/course-page-preview-dialog.component';
import { CoursePageContentQuestionListComponent } from '../../course-page-content-questions/course-page-content-question-list.component';
import { ContentCreatorComponent } from '../../../../contentcreator/contentcreator.component';
import { CoursePageContentQuestionService } from '../../course-page-content-questions/course-page-content-question.service';

@Component({
  selector: 'course-page-edit',
  templateUrl: './course-page-edit.component.html',
  styleUrls: ['./course-page-edit.component.scss']
})
export class CoursePageEditComponent implements OnInit {
  editPageModalRef: any;
  subscriptions: Subscription[] = []; //array to hold modal subscriptions
  @ViewChild('contentCreatorComponent') contentCreatorComponent: ContentCreatorComponent;
  

  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    this._page = page;
    this.onStartEdit();
  }
  get page(): ICoursePage { return this._page };

  private _showEditCard = true; //variable that shows / hides the whole component
  @Input()
  set showEditCard(showEditCard: boolean) {

    if (showEditCard) {
      //value was set to true - meaning we are now showing the edit card. Lets trigger the onEdit method to populate the fields
      this.onStartEdit();
    }

    this._showEditCard = showEditCard;
  }
  get showEditCard(): boolean { return this._showEditCard; }

  @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished


  constructor(private modalService: BsModalService,
              private changeDetection: ChangeDetectorRef,
              private coursePageContentBlockService: CoursePageContentBlockService,
              private coursePageContentQuestionService: CoursePageContentQuestionService ) {

    
  }

  ngOnInit() {

  }

  onStartEdit(): void {
    
  }

  cmdHidePageDetails(): void {
    this.onFinishEditEvent.emit(false);
  }

  

  // populateEditContentBlockForm(): void {
  //   this.tinyEditor.editor.setContent(this.editContentBlock.content, {format: 'raw'});
  // }

  

  // cmdSavePageContentBlock(): void {
  //   let contentBlockHtml: string = this.tinyEditor.editor.getContent({ format: 'raw' });
  //   this.editContentBlock.content = contentBlockHtml;

  //   this.coursePageContentBlockService.saveCoursePage(this.editContentBlock).subscribe(() => {
  //     this.onFinishEditEvent.emit(true);
  //   }, error => alert(`Error: ${error} (ref cmdSavePageContentBlock)`));
    
    
  // }

  // keyupHandler(content: any): void {
  //   //console.log(content);
  // }

  cmdOpenTemplate(event: Event): void {
    event.stopPropagation();
    alert('this is supposed to open a template which is yet to be defined');
  }

  cmdPreview(event: Event): void {
    event.stopPropagation();
    this.openPagePreviewDialog(this.page);
  }

  openPagePreviewDialog(page: ICoursePage): void {
    //opens the course-page-preview-dialog component in a modal, and subscribes to the hide event

    //load the page contentBlocks or questions depending on content type
    this.loadPageDataForPreview(page).subscribe(() => {
     
      //set the initial state objects - page has all necessary data now loaded for rendering
        let initialState: any = { page: page };

        let coursePagePreviewDialogModalRef: BsModalRef = this.modalService.show(CoursePagePreviewDialogComponent, { initialState: initialState, class: 'modal-lg' });

        const _combine = Observable.combineLatest(
          this.modalService.onHide,
          this.modalService.onHidden
        ).subscribe(() => this.changeDetection.markForCheck());

        this.subscriptions.push(
          this.modalService.onHidden.subscribe((reason: string) => {
            this.unsubscribe();
          })
        );

        this.subscriptions.push(_combine);
    });
  }

  private loadPageDataForPreview(page: ICoursePage): Observable<any> {
    let observer = Observable.create((obs) => {
      if(page.coursePageContent.templateType === 1){
        //traditional questionnaire - load the questions
        this.coursePageContentQuestionService.getCoursePageContentQuestionsByPageId(page.coursePageId).subscribe(coursePageContentQuestions => {
          page.coursePageContent.coursePageContentQuestions = coursePageContentQuestions;
          obs.next();
        })
      } else {
        //load the contentBlocks
        this.coursePageContentBlockService.getCoursePageContentBlocksByPageId(page.coursePageId).subscribe(contentBlocks => {
          page.coursePageContent.coursePageContentBlocks = contentBlocks;
          obs.next();
        });
      }
    })
    return observer;
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  contentCreatorOnFinishEditEventHandler(shouldRefresh: boolean): void {
    this.onFinishEditEvent.emit(false);
  }
}
