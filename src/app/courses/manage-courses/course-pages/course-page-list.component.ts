import { Component, OnInit, Input, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';

import { ICoursePage } from './course-page';
import { ICourseModule } from '../course-modules/course-module';
import { CoursePageService } from './course-page.service';
import { CoursePageEditComponent } from './course-page-edit/course-page-edit.component';
import { CoursePageEditDialogComponent } from './course-page-edit-dialog/course-page-edit-dialog.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/combineLatest';
import { CoursePagePreviewDialogComponent } from './course-page-preview-dialog/course-page-preview-dialog.component';
import { CoursePageContentBlockService } from '../course-page-content-blocks/course-page-content-block.service';
import { CoursePageContentQuestionService } from '../course-page-content-questions/course-page-content-question.service';

@Component({
  selector: 'course-page-list',
  templateUrl: './course-page-list.component.html',
  styleUrls: ['./course-page-list.component.scss']
})
export class CoursePageListComponent implements OnInit {
  @ViewChild('coursePageEditComponent') coursePageEditComponent : CoursePageEditComponent;
  
  //private manageCoursePageEditComponent;

  editPageOrder: boolean = false;
  pages: ICoursePage[];
  private _courseModule: ICourseModule;

  @Input() 
  set courseModule(courseModule: ICourseModule){
    this._courseModule = courseModule;
    this.loadCoursePages();
  }
  get courseModule(): ICourseModule { return this._courseModule};

  selectedPage: ICoursePage; //variable used to hold a new/existing page being edited
  showEditCard: boolean = false; //property used to show/hide the edit course
  subscriptions: Subscription[] = []; //array to hold modal subscriptions

  constructor(private manageCoursePageService: CoursePageService,
              private modalService: BsModalService,
              private changeDetection: ChangeDetectorRef,
              private coursePageContentBlockService: CoursePageContentBlockService,
              private coursePageContentQuestionService: CoursePageContentQuestionService) { }


  ngOnInit() {
   
  }

  loadCoursePages(): void {
    //load the pages for the courseModule

    if(!this.courseModule || !this.courseModule.courseModuleId){
      //if there is no courseModule - should not happen under normal usage, or when it's a new courseModule - there are no pages yet
      return;
    }

    this.manageCoursePageService.getCoursePages(this.courseModule.courseModuleId).subscribe(pages => {
      this.pages = this.manageCoursePageService.sortCoursePageList(pages);

      
      //this.cmdEditPageContent(new Event('asd'), this.pages[0]); //testing - select the first page
    },
    error => alert(`Unexpected error: ${error}`)
    );
  }

  cmdAddCoursePage(): void {
    this.selectedPage = this.manageCoursePageService.initialiseCoursePage();
    this.selectedPage.courseModuleId = this.courseModule.courseModuleId;
    this.selectedPage.order = this.pages.length;
    this.selectedPage.coursePageContent.templateType = 3;
    //this.manageCoursePageEditComponent.page = this.selectedPage;
    
    //open the course-page-edit-dialog modal
    this.openEditPageDialog(this.selectedPage);
  }

  cmdEditCoursePage(event: Event, page: ICoursePage): void {
    event.stopPropagation();

    if(this.editPageOrder){
      return; //don't process click when the ordering is enabled
    }
    this.selectedPage = page
    // this.manageCoursePageEditComponent.page = this.selectedPage;

    //open the course-page-edit-dialog modal
    this.openEditPageDialog(this.selectedPage);
  }

  openEditPageDialog(page: ICoursePage): void {
    //opens the course-edit-page-dialog component in a modal, and subscribes to the hide event

    let coursePageEditDialogModalRef: BsModalRef = this.modalService.show(CoursePageEditDialogComponent, {initialState: {page: page}});
    
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
          let cpedComp: CoursePageEditDialogComponent  = coursePageEditDialogModalRef.content;
          if(cpedComp && cpedComp.parentShouldReload){
            this.loadCoursePages();
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

  onFinishEditEvent(shouldReload: boolean): void {
    this.showEditCard = false;
    this.selectedPage = null;
    
     if(shouldReload){
        this.loadCoursePages();
     }
  }

  cmdPreviewCoursePage(event: Event, page: ICoursePage): void {
    event.stopPropagation();

    this.openPagePreviewDialog(page);
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

  cmdEditPageOrder(): void {
    this.editPageOrder = true;
  }

  cmdDoneEditPageOrder(): void {
    this.manageCoursePageService.updateCoursePageOrder(this.pages).subscribe(() => {
      this.editPageOrder = false;
    },
    error => alert("There has been an unexpected error. Please try again. (ref cmdDoneEditPageOrder)"));
    
  }

  cmdMoveOrderDown(page: ICoursePage, event: Event): void {
    event.stopPropagation();
    this.adjustQuestionOrder(page, 1);
  }

  cmdMoveOrderUp(page: ICoursePage, event: Event): void {
    event.stopPropagation();
    this.adjustQuestionOrder(page, -1);
  }

  private adjustQuestionOrder(page: ICoursePage, increment: number) {
    //find this objects current index
    let currentCoursePageIndex = this.pages.findIndex(q => q == page);

    if(currentCoursePageIndex === 0 && increment < 0){
      return; //don't move backward because the item is already at the top
    }

    //move question in array
    this.array_move(this.pages, currentCoursePageIndex, (currentCoursePageIndex + increment));

    //modify all question orders according to array index
    this.pages.forEach((coursePageItem, index) => {
      coursePageItem.order = index;
    });

    //we are done!
  }

  private array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  };

  cmdEditPageContent(event: Event, page: ICoursePage) {
    event.stopPropagation();
    this.selectedPage = page;
    this.showEditCard = true;
  }
}
