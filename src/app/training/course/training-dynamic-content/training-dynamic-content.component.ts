import { Component, OnInit, ViewChild, ViewContainerRef, Input, AfterViewInit, Injector, ComponentFactoryResolver, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ResourceLibraryAssetService } from '../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { TrainingDynamicContentVideoComponent } from './training-dynamic-content-video.component';
import { ICoursePage } from '../../../courses/manage-courses/course-pages/course-page';
import { CoursePageContentQuestionPackService } from '../../../courses/manage-courses/course-page-content-questions/course-page-content-question-pack.service';
import { TrainingQuestionInteractiveComponent } from '../training-question-interactive/training-question-interactive.component';
import { Observable } from 'rxjs';
import { OnTrainingPageChange } from '../training-component-hooks';
import { TrainingEngineService } from '../../training-engine.service';

@Component({
  selector: 'training-dynamic-content',
  template: `<div #placeholder></div>`
  
})
export class TrainingDynamicContentComponent implements OnInit, AfterViewInit, OnTrainingPageChange {
  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    this._page = page;
    this.onStartLoad();
  }
  get page(): ICoursePage { return this._page };
  

  @Input() htmlContent: string;
  @ViewChild('placeholder', { read: ViewContainerRef }) placeholder: ViewContainerRef;
  clarityList: TrainingDynamicContentVideoComponent[] = [];
  questionInteractiveList: TrainingQuestionInteractiveComponent[] = [];
  
  constructor(private _injector: Injector,
              private resolver: ComponentFactoryResolver,
              private app: ApplicationRef,
              private resourceLibraryAssetService: ResourceLibraryAssetService,
              private questionPackService: CoursePageContentQuestionPackService,
              private trainingEngineService: TrainingEngineService)
   { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {

  }

  private onStartLoad(): void {
    //get the coursepagecontentblock for the page
    if(this.page && this.page.coursePageContent && this.page.coursePageContent.coursePageContentBlocks && this.page.coursePageContent.coursePageContentBlocks.length){
      let coursePageContentBlock = this.page.coursePageContent.coursePageContentBlocks[0];

      //clear the placeholder of any existing content
      this.placeholder.clear();

      //set the innerHTML to match the content
      this.htmlContent = coursePageContentBlock.content;

      this.placeholder.element.nativeElement.innerHTML = this.htmlContent;

      //process the content for any special components
      this.processDOMContent();
    }
    
  }

  processDOMContent(): void {
    //process the html content for various special types that are to be replaced with relavent angular component (and data) by dynamically creating the component(s)
    
    this.prepareVideos(); //scan for tilt-suite videos and generate dynamic video component in appropriate place in dom
    this.prepareInteractiveQuestions(); //scan for questionPacks and generate dynamic question interactive component and place in correct spot in DOM
  }

  prepareVideos(): void {
    //https://regexr.com/3vcc4
    //regex to find tilt-suite video components to be embeded
    let videoRegex = new RegExp('<div.id="(rla-\\d+)+"><!--.RESOURCELIBARYASSET:(\\d+)+.--><\/div>','g'); //note g - global flag to keep searching in regex until no more matches found
    //run regex on content, and for any matches, extract the dom element id's and resourceLibraryAssetId, then pass onto another method to load resource and create the vgplayer component
    let  match;    
    //iterate until there are no more regex matches
    while ((match =videoRegex.exec(this.htmlContent)) !=null ) {
      if(match.length>=2)
      {
        let elementId = match[1];
        let rlaId = match[2];
        this.processResourceLibraryAssetVideo(elementId, +rlaId);
      }
    }
  }

  private processResourceLibraryAssetVideo(domElementId: string, resourceLibraryAssetId: number): void {
    //load the resourceLibraryAsset and create a new component which has the vgPlayer inside it

    //resolve ONE factory for the component - no need to keep re-creating as we only need to resolve once.
    let factory = this.resolver.resolveComponentFactory(TrainingDynamicContentVideoComponent);

    this.resourceLibraryAssetService.getResourceLibraryAsset(resourceLibraryAssetId).subscribe(resourceLibraryAsset => {
      //get all notes that have the sameid (as there might be duplicates)
      let rlaNodes = document.querySelectorAll(`#${domElementId}`);
      if(rlaNodes && rlaNodes.length){
        //iterate through each matching dom element and create a new component which has the video component within it
        for(let i:number =0; i< rlaNodes.length; i++){
          let rlaNode = rlaNodes[i];
          if (rlaNode) {
            //create the component as set the relavent fields for the asset url, content type and etc
            const ref = factory.create(this._injector, [], rlaNode);
            //ref.instance.data = `RLAID:${resourceLibraryAssetId}`;
            ref.instance.url = resourceLibraryAsset.fileProperties.url; 
            ref.instance.contentType = resourceLibraryAsset.fileProperties.contentType;
            this.clarityList.push(ref.instance);
            this.app.attachView(ref.hostView);
          }
        }
      }
    });
  }

  prepareInteractiveQuestions(): void {
    //regex to find tilt-suite video components to be embeded
    let questionPackRegex = new RegExp('<div.id="(cpcqp-\\d+)+"><!--.COURSEPAGECONTENTQUESTIONPACK:(\\d+)+.--><\/div>','g'); //note g - global flag to keep searching in regex until no more matches found
    //run regex on content, and for any matches, extract the dom element id's and coursePageContentQuestionPackId, then pass onto another method to load questionPack and create the question interactive component
    let  match;    
    //iterate until there are no more regex matches
    while ((match =questionPackRegex.exec(this.htmlContent)) !=null ) {
      if(match.length>=2)
      {
        let elementId = match[1];
        let rlaId = match[2];
        this.processQuestionPack(elementId, +rlaId);
      }
    }
  }

  private processQuestionPack(domElementId: string, coursePageContentQuestionPackId: number): void {
    //load the resourceLibraryAsset and create a new component which has the vgPlayer inside it

    //resolve ONE factory for the component - no need to keep re-creating as we only need to resolve once.
    let factory = this.resolver.resolveComponentFactory(TrainingQuestionInteractiveComponent);

    this.questionPackService.getCoursePageContentQuestionPackById(coursePageContentQuestionPackId).subscribe(questionPack => {
      //get all notes that have the sameid (as there might be duplicates)
      let rlaNodes = document.querySelectorAll(`#${domElementId}`);
      if(rlaNodes && rlaNodes.length){
        //iterate through each matching dom element and create a new component which has the video component within it
        for(let i:number =0; i< rlaNodes.length; i++){
          let rlaNode = rlaNodes[i];
          if (rlaNode) {
            //create the component as set the relavent fields for the asset url, content type and etc
            const ref = factory.create(this._injector, [], rlaNode);
            //ref.instance.data = `RLAID:${resourceLibraryAssetId}`;
            ref.instance.page = this.page;
            ref.instance.questionPack = questionPack;

            if(!this.questionInteractiveList) this.questionInteractiveList = [];
            this.questionInteractiveList.push(ref.instance);
            this.app.attachView(ref.hostView);
          }
        }
      }
    });
  }

  saveComponentUserData(): Observable<void>{
    let observer = Observable.create((obs) => {

      //check if there are interactive questionaires present, if so, trigger the save event and wait for them to complete before triggering the observable.
      if(this.questionInteractiveList && this.questionInteractiveList.length){
        //there are one or more interactive questionaires, trigger saving changes before triggering main observer;
        let obsColl = Observable.zip(...this.questionInteractiveList.map(qic => qic.saveComponentUserData()));
        obsColl.subscribe(() => {
          //trigger the observable once ALL the questionInteractiveComponents have responsed to their observables too          
          obs.next();
        })
        
      } else {
        //no questions present, so trigger observer
        obs.next();
      }
      
    });

    return observer;
  }

  canMoveForward(): boolean {
    if(this.trainingEngineService.courseSessionReadOnly){
      return true;
    } else {
      if(this.questionInteractiveList && this.questionInteractiveList.length) {
        //check each questionaire to see if they have been completed
        let allQuestionairesAnswered = this.questionInteractiveList.map(qic => qic.canMoveForward());
        if(allQuestionairesAnswered.indexOf(false) === -1){
          return true;
        } else {
          return false; //there is atleast once questionaire that has not been completed
        }
      } else {
        return true;
      }
    }
  }

}
