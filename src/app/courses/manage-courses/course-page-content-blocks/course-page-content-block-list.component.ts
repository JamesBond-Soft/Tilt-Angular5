import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ICoursePageContentBlock } from './course-page-content-block';
import { ICoursePage } from '../course-pages/course-page';
import { CoursePageContentBlockService } from './course-page-content-block.service';
import { ReorderCollectionService } from '../../../shared/helper-services/reorder-collection.service';
import { CoursePageContentBlockEditComponent } from './course-page-content-block-edit/course-page-content-block-edit.component';

@Component({
  selector: 'course-page-content-block-list',
  templateUrl: './course-page-content-block-list.component.html',
  styleUrls: ['./course-page-content-block-list.component.scss']
})
export class CoursePageContentBlockListComponent implements OnInit {
  @ViewChild('coursePageContentBlockEditComponent') coursePageContentBlockEditComponent: CoursePageContentBlockEditComponent;

  coursePageContentBlocks: ICoursePageContentBlock[];
  editContentBlock: ICoursePageContentBlock;
  editContentBlockOrder: boolean;
  showContentBlockEditComponent: boolean;

  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    this._page = page;
    this.onStartEdit();
  }
  get page(): ICoursePage { return this._page };
  
  constructor(private coursePageContentBlockService: CoursePageContentBlockService,
              private reorderCollectionService: ReorderCollectionService) { }

  ngOnInit() {

  }

  cmdAddContentBlock(): void {
    //initialise a new content block object, set it to the edited contentBlock and show the edit component
    let newContentBlock = this.coursePageContentBlockService.initialiseCoursePageContentBlock();
    newContentBlock.coursePageId = this.page.coursePageId; //set the corresponding id fields based on current page
    newContentBlock.coursePageContentId = this.page.coursePageContent.coursePageContentId;
    newContentBlock.order = this.coursePageContentBlocks? this.coursePageContentBlocks.length : 0; //set order to always be last in the list or if empty - 0
    this.setDefaultNameForContentBlock(newContentBlock); //auto generate a name for the new content block

    //assign the editContentBlock property with the newly initialised contentBlock
    this.editContentBlock = newContentBlock;

    //show the edit component
    this.showContentBlockEditComponent = true;
  }

  private setDefaultNameForContentBlock(contentBlock: ICoursePageContentBlock): void {
    //pre-set the name to make people lives easier because 99% it's not that useful of a field
    let namePostfix: number = this.coursePageContentBlocks.length + 1;
    do {
      //form a name based on a number (which usually is the length of the collection, unless there is block with the same name!)
      let proposedContentBlockName = `Content Block #${namePostfix}`;

      //do a quick look to see if the name isnt already taken
      var existingBlockWithSameName = this.coursePageContentBlocks.find(b => b.name === proposedContentBlockName);
      if (!existingBlockWithSameName) {
        contentBlock.name = proposedContentBlockName;
      }

      namePostfix++;
    } while (!contentBlock.name.length);
  }

  cmdSelectContentBlock(contentBlock: ICoursePageContentBlock): void {
    if(this.editContentBlockOrder || this.editContentBlock){
      //ignore the click because the user is trying to re-order the items or they are already editing an item
      return;
    }
    this.editContentBlock = contentBlock;
    
    //show the contentBlockEditComponent
    this.showContentBlockEditComponent = true;
  
  }

  onStartEdit(): any {
    this.loadContentBlockListForPage();
  }

  onFinishEditContentBlockHandler(shouldReload: boolean): void {
    this.editContentBlock = null;
    this.showContentBlockEditComponent = false;
    if(shouldReload){
      this.loadContentBlockListForPage();
    }
  }

  cmdCancelEditPageContentBlock(): void {
    // this.onFinishEditEvent.emit(false);
   }

  loadContentBlockListForPage(): void {
    //populates the contentBlockList

    //simply validation to return if the page is not populated
    if(!this.page){
      this.coursePageContentBlocks = null; //clear the array
      return;
    }

     //loads the contentBlocks for the selected page
     this.coursePageContentBlockService.getCoursePageContentBlocksByPageId(this.page.coursePageId).subscribe(contentBlocks => {
      this.coursePageContentBlocks = contentBlocks;
      //this.cmdAddContentBlock(); //testing
    }, error => console.log(`Unexpected error: ${error} (ref loadCoursePageContentBlocks)`))
  }

  cmdStartEditContentBlockOrder(): void {
    // flag which enables re-ordering behaviour
    this.editContentBlockOrder = true;
  }

  cmdFinishEditContentBlockOrder(): void {
    // save the reordered changes

    //deep copy contentBlock list and clear the content and name as we don't want to unnecessarily send the bulk of data in request. - Minimise bandwidth
    let sparseContentBlockList: ICoursePageContentBlock[] = this.coursePageContentBlocks.map(x => Object.assign({}, x));
    for(let contentBlock of sparseContentBlockList){
      contentBlock.content = null;
      contentBlock.name = null;
    }

    this.coursePageContentBlockService.updateCoursePageContentBlockOrder(sparseContentBlockList).subscribe(() => {
      //mark the ordering behaviour as finished
      this.editContentBlockOrder = false;
    }, 
    error => {
      console.log(`Unexpected error: ${error} (ref cmdFinishContentBlockOrder)`)
      this.editContentBlockOrder = false;
    });
  }

  cmdMoveOrderUp(item: any, event: Event): void {
    //button click to move item backwards in collection
    event.stopPropagation();
    this.reorderCollectionService.moveOrderUp(item, this.coursePageContentBlocks);
  }

  cmdMoveOrderDown(item: any, event: Event): void {
    //button click to move item forwards in collection
    event.stopPropagation();
    this.reorderCollectionService.moveOrderDown(item, this.coursePageContentBlocks);
  }

  

  
}
