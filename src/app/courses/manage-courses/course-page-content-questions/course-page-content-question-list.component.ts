import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ICoursePage } from '../course-pages/course-page';
import { ICoursePageContent } from '../course-pages/course-page-content';
import { ICoursePageContentQuestion, ICoursePageContentQuestionType } from './course-page-content-question';
import { ICoursePageContentQuestionResponse } from './course-page-content-question-response';
import { CoursePageContentQuestionService } from './course-page-content-question.service';
import { ReorderCollectionService } from '../../../shared/helper-services/reorder-collection.service';
import { CoursePageContentQuestionEditComponent } from './course-page-content-question-edit/course-page-content-question-edit.component';


@Component({
  selector: 'course-page-content-question-list',
  templateUrl: './course-page-content-question-list.component.html',
  styleUrls: ['./course-page-content-question-list.component.scss']
})
export class CoursePageContentQuestionListComponent implements OnInit {
  @ViewChild('coursePageContentQuestionEditComponent') coursePageContentQuestionEditComponent: CoursePageContentQuestionEditComponent;
  
  coursePageContentQuestions: ICoursePageContentQuestion[];
  editContentQuestion: ICoursePageContentQuestion;
  editContentQuestionOrder: boolean;
  showContentQuestionEditComponent: boolean;

  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    this._page = page;
    this.onStartEdit();
  }
  get page(): ICoursePage { return this._page };

  constructor(private coursePageContentQuestionService: CoursePageContentQuestionService,
              private reorderCollectionService: ReorderCollectionService) { }

  ngOnInit() {
  }

  onStartEdit(): any {
    this.loadContentQuestionListForPage();
  }

  onFinishEditContentQuestionHandler(shouldReload: boolean): void {
    this.editContentQuestion = null;
    this.showContentQuestionEditComponent = false;
    if(shouldReload){
      this.loadContentQuestionListForPage();
    }
  }

  loadContentQuestionListForPage(): void {
    //populates the contentQuestionList

    //simply validation to return if the page is not populated
    if(!this.page){
      this.coursePageContentQuestions = null; //clear the array
      return;
    }

     //loads the contentQuestions for the selected page
     this.coursePageContentQuestionService.getCoursePageContentQuestionsByPageId(this.page.coursePageId).subscribe(contentQuestions => {
      this.coursePageContentQuestions = contentQuestions;
    }, error => console.log(`Unexpected error: ${error} (ref loadContentQuestionList)`))
  }

  cmdAddContentQuestion(): void {
    //initialise a new content block object, set it to the edited contentBlock and show the edit component
    let newContentQuestion = this.coursePageContentQuestionService.initialiseCoursePageContentQuestion();
    newContentQuestion.coursePageId = this.page.coursePageId; //set the corresponding id fields based on current page
    newContentQuestion.coursePageContentId = this.page.coursePageContent.coursePageContentId;
    newContentQuestion.order = this.coursePageContentQuestions? this.coursePageContentQuestions.length : 0; //set order to always be last in the list or if empty - 0

    //assign the editContentBlock property with the newly initialised contentBlock
    this.editContentQuestion = newContentQuestion;

    //show the edit component
    this.showContentQuestionEditComponent = true;
  }

  cmdSelectContentQuestion(contentQuestion: ICoursePageContentQuestion): void {
    if(this.editContentQuestionOrder || this.editContentQuestion){
      //ignore the click because the user is trying to re-order the items or they are already editing an item
      return;
    }
    this.editContentQuestion = contentQuestion;
    
    //show the contentBlockEditComponent
    this.showContentQuestionEditComponent = true;
  }

  cmdStartEditContentQuestionOrder(): void {
    // flag which enables re-ordering behaviour
    this.editContentQuestionOrder = true;
  }

  cmdFinishEditContentQuestionOrder(): void {
    // save the reordered changes

    //deep copy contentQuestion list and clear the content and name as we don't want to unnecessarily send the bulk of data in request. - Minimise bandwidth
    let sparseContentQuestionList: ICoursePageContentQuestion[] = this.coursePageContentQuestions.map(x => Object.assign({}, x));
    for(let contentQuestion of sparseContentQuestionList){
      contentQuestion.coursePageContentQuestionResponses = null;
      contentQuestion.question = null;
      contentQuestion.extRefNum = null;
    }

    this.coursePageContentQuestionService.updateCoursePageContentQuestionOrder(sparseContentQuestionList).subscribe(() => {
      //mark the ordering behaviour as finished
      this.editContentQuestionOrder = false;
    }, 
    error => {
      console.log(`Unexpected error: ${error} (ref cmdFinishContentBlockOrder)`)
      this.editContentQuestionOrder = false;
    });
  }

  cmdMoveOrderUp(item: any, event: Event): void {
    //button click to move item backwards in collection
    event.stopPropagation();
    this.reorderCollectionService.moveOrderUp(item, this.coursePageContentQuestions);
  }

  cmdMoveOrderDown(item: any, event: Event): void {
    //button click to move item forwards in collection
    event.stopPropagation();
    this.reorderCollectionService.moveOrderDown(item, this.coursePageContentQuestions);
  }
}
