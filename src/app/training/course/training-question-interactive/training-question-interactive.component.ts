import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { CoursePageContentQuestionPackService } from '../../../courses/manage-courses/course-page-content-questions/course-page-content-question-pack.service';
import { ICoursePageContentQuestionPack } from '../../../courses/manage-courses/course-page-content-questions/course-page-content-question-pack';
import { ICoursePageContentQuestion, ICoursePageContentQuestionType } from '../../../courses/manage-courses/course-page-content-questions/course-page-content-question';
import { ICoursePageContentQuestionResponse } from '../../../courses/manage-courses/course-page-content-questions/course-page-content-question-response';
import { DragulaService } from 'ng2-dragula';
import { TrainingEngineService } from '../../training-engine.service';
import { ICourseSessionUserData } from '../../course-session-user-data';
import { ICoursePage } from '../../../courses/manage-courses/course-pages/course-page';
import { Observable } from 'rxjs';
import { OnTrainingPageChange } from '../training-component-hooks';


@Component({
  selector: 'app-training-question-interactive',
  templateUrl: './training-question-interactive.component.html',
  styleUrls: ['./training-question-interactive.component.scss']
})
export class TrainingQuestionInteractiveComponent implements OnInit, OnTrainingPageChange, OnDestroy {
  
  answers: ICoursePageContentQuestionResponse[];
  ICoursePageContentQuestionType = ICoursePageContentQuestionType;
  @ViewChild('answersContainer') answersContainerRef: ElementRef;
  courseSessionUserData: ICourseSessionUserData;
  courseSessionReadOnly: boolean;
 
  dragulaContainerName: string;
  dragularOptions: any = {
    moves: (el, source, handle, sibling) => !el.classList.contains('no-drag') // special class style that disables drag/drop if it's applied to the element
  } 

  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    this.courseSessionReadOnly = this.trainingEngineService.courseSessionReadOnly;
    this._page = page;
  }

  get page(): ICoursePage { return this._page };

  private _questionPack: ICoursePageContentQuestionPack;
  @Input()
  set questionPack(questionPack: ICoursePageContentQuestionPack) {
    this._questionPack = questionPack;
    this.dragulaContainerName = `responses-${this._questionPack.coursePageContentQuestionPackId}`;
    this.buildAnswersCollection();
    this.loadCourseSessionUserData(); //this loads the user's selections (if any)
  }
  get questionPack(): ICoursePageContentQuestionPack { return this._questionPack };

  constructor(private questionPackService: CoursePageContentQuestionPackService,
              private dragulaService: DragulaService,
              private trainingEngineService: TrainingEngineService) { }

  ngOnInit() {
   // this.loadQuestionPack(); //used for testing manually
    this.defineDragulaEventHandlers();
  }

  ngOnDestroy() {
    this.dragulaService.destroy(this.dragulaContainerName);
  }

  loadQuestionPack(): void {
    //REPLACE VALUE OF 5 WITH EXISTING QUESTIONPACKID FOR TESTING
    this.questionPackService.getCoursePageContentQuestionPackById(5).subscribe(questionPack => {
      this.questionPack = questionPack;
      this.buildAnswersCollection();
    }, error => console.log(`Unexpected error: ${error}`));
  }

  private buildAnswersCollection(): void {

    let answersList: ICoursePageContentQuestionResponse[] = [];

    // //iterate through all questions - REDUNDANT NOW, EACH QUESTION NOW CONTAINS DUPLICATE CORRECT/WRONG ANSWER
    // this.questionPack.coursePageContentQuestions.forEach((questionObj, i) => {
    //   if(i === 0){
    //     //add all the responses from the first question into the answersList array
    //     answersList.push(...questionObj.coursePageContentQuestionResponses);
    //   } else {
    //     //only add the correct response(s) into the answersList array
    //     //get the correct answer
    //     let correctAnswers = questionObj.coursePageContentQuestionResponses.filter(r => r.correctValue === 1);
    //     if(correctAnswers && correctAnswers.length){
    //       answersList.push(...correctAnswers);
    //     }
    //   }
    // });

    answersList.push(...this.questionPack.coursePageContentQuestions[0].coursePageContentQuestionResponses);

    
    this.shuffleArray(answersList); //shuffle the answers in situ
    this.answers = answersList;
  }

  private shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
    }
  }

  private defineDragulaEventHandlers() {
    
    //onDrop handler - if the container has a data-attribute of data-mode set and is of value 'single', 
    //then special behaviour to only allow a single item in selection, causing it to swap an existing item
     this.dragulaService.drop(this.dragulaContainerName).subscribe((value) => {
      
      let bag = this.dragulaService.find(value[0]); //get container
      
      let el: HTMLElement = value[1];
      let target: HTMLElement = value[2];
      let source: HTMLElement = value[3];
      let sibling: HTMLElement = value[4];

      // if(this.courseSessionReadOnly){
      //   bag.drake.cancel(true);
      //   return;
      // }
      //determine if a button was dropped next to a question, if so, special behaviour to move an existing answer back to the answers container
      if(target.dataset['mode'] && target.dataset['mode'] === 'single'){
        let childBtns = Array.from(target.children).filter(childEl => childEl.classList.contains('btn'));
        if(childBtns.length > 1){
          //move the other existing button back to source container (ie answers container)
          let otherBtn = childBtns.find(childEl => childEl != el);
          source.appendChild(otherBtn);
          this.changeButtonStyleForContainer(<HTMLElement>otherBtn, source);
        }
      }

      this.changeButtonStyleForContainer(el, target); //apply styling to dragged button
      this.showOrHidePlaceholderInContainer(source); //duh
      this.showOrHidePlaceholderInContainer(target); //duh
    }); 
  }

  private changeButtonStyleForContainer(el: HTMLElement, target: HTMLElement){
    //this adds or removes the 'btn-block' style for a passed element depending on whether it's in the answer container (marked with data-mode=single)

    if(target.dataset['mode'] && target.dataset['mode'] === 'single'){
      //the response is being placed next to a question - add the btn-block style
      if(!el.classList.contains('btn-block')){
        el.classList.add('btn-block');
      }
    } else {
      //the response is being returned to the answers section - remove the btn-block style
      if(el.classList.contains('btn-block')){
        el.classList.remove('btn-block');
      }
    }
  }

  private showOrHidePlaceholderInContainer(target: HTMLElement): void {
    if(target.dataset['mode'] && target.dataset['mode'] === 'single'){
      if(target.childElementCount >= 1){
        //check if the placeholder is present - if so, remove it
       var childrenArray = Array.from(target.children);
       let placeholderElement = childrenArray.find(childEl => childEl.classList.contains('placeholder'));
       if(placeholderElement){
         //remove it
         placeholderElement.remove();
       }
      } else {
        //add the placeholder
        let placeholderElement = document.createElement('div');
        placeholderElement.classList.add('placeholder');
        placeholderElement.innerText = ' Drag your answer ';
        target.appendChild(placeholderElement);
      }
    }
  }

  private applyAnswerStylesToResponses(): void {
    //apply styles to selected answers (green ie. btn-success is correct, red ie. btn-danger is incorrect) btn-info is default black style

    //iterate through each question and find the questionObject in the dom
    this.questionPack.coursePageContentQuestions.forEach((q, i) => {
      //find the question element in the dom
      let qEl = document.getElementById(`cpcqid-${q.coursePageContentQuestionId}`);
      if(qEl){
        //get the answer container
        let answerContainerEl = qEl.querySelector('[data-mode="single"]');
        //get the coursePageContentQuestionResponseId from the answer
        let answerResponseEl = <HTMLElement>answerContainerEl.querySelector('[data-id^="cpcqrid-"]');
        if(answerResponseEl){
          //get the responseid
          let coursePageContentQuestionResponseId = +answerResponseEl.dataset.id.replace('cpcqrid-', '');
          if(this.isAnswerCorrect(q, coursePageContentQuestionResponseId)){
            //apply the success style
            answerResponseEl.classList.add('btn-success');
          } else {
            //apply the incorrect style
            answerResponseEl.classList.add('btn-danger');
          }
          answerResponseEl.classList.remove('btn-info');
        }
        
      }
    });
  }

  private clearAnswerStylesOnResponses(): void {
    //clear any correct/incorrect styles to selected answer and reset all answers (including those in container) to default black style ie btn-info

    //iterate through each question and find the questionObject in the dom, and then clear the answer styles if present, and restore to default btn-info style
    this.questionPack.coursePageContentQuestions.forEach((q, i) => {
      //find the question element in the dom
      let qEl = document.getElementById(`cpcqid-${q.coursePageContentQuestionId}`);
      if(qEl){
        //get the answer container
        let answerContainerEl = qEl.querySelector('[data-mode="single"]');
        //get the coursePageContentQuestionResponseId from the answer
        let answerResponseEl = <HTMLElement>answerContainerEl.querySelector('[data-id^="cpcqrid-"]');
        if(answerResponseEl){
          answerResponseEl.classList.remove('btn-success');
          answerResponseEl.classList.remove('btn-danger');
          
          if(!answerResponseEl.classList.contains('btn-info')){
            answerResponseEl.classList.add('btn-info');
          }
        }
      }
    });

    //clear the correct/incorrect styles from items that are in the answers container
    if(this.answersContainerRef){
      let answersContainer: HTMLElement = this.answersContainerRef.nativeElement;
      
      let childBtns = Array.from(answersContainer.children).filter(childEl => childEl.classList.contains('btn'));
      childBtns.forEach(el => {
        el.classList.remove('btn-success');
        el.classList.remove('btn-danger');
        if(!el.classList.contains('btn-info')){
          el.classList.add('btn-info');
        }
      })
    }
  }

  private isAnswerCorrect(questionItem: ICoursePageContentQuestion, coursePageContentQuestionResponseId: number): boolean {
    //now db structure originally had 1 question with many answers, but the new drag/drop questions UI was designed so that there is only a single group of answers for a series of questions.
    // in order to make this work without invalidating db, we need to get the responseObject provided by the id, and then compare against the provided question responses to find it's equivalent
    //as every question is still saved with multiple answers (but in this instance they are duplicates), but they always have one of their own correct answer

    //get the responseObj from the provided coursePageContentQuestionResponseId
    let responseObj: ICoursePageContentQuestionResponse = this.questionPack.coursePageContentQuestions.filter(q => q.coursePageContentQuestionResponses.some(r => r.coursePageContentQuestionResponseId === coursePageContentQuestionResponseId)).map(q => q.coursePageContentQuestionResponses.find(r => r.coursePageContentQuestionResponseId === coursePageContentQuestionResponseId))[0];

    if(responseObj){
      //find the equivalent answer in the questionResponses
      let qResponseObj: ICoursePageContentQuestionResponse;
      if(responseObj.coursePageContentQuestionId === questionItem.coursePageContentQuestionId){
        //the response actually belongs to the question!
        qResponseObj = responseObj;
      } else {
        //the response belongs to another question, try to find it's equivalent answer in the question (by getting a corresponding response with the same text)
        qResponseObj = questionItem.coursePageContentQuestionResponses.find(r => r.response === responseObj.response);
      }

      //check if we have found a responseObject that matches the question
      if(qResponseObj){

        //return whether this question is marked as correct or incorrect
        return qResponseObj.correctValue === 1;
      } 
    }

    //if we got to here, it means we could not find the response matching to the question (meaning the provided coursePageContentQuestionResponseId is a correct answer for another question).
    return false; //this is also failsafe if something goes wrong
  }

  private getResponseObjForQuestion(questionItem: ICoursePageContentQuestion): ICoursePageContentQuestionResponse{
    
    let qEl = document.getElementById(`cpcqid-${questionItem.coursePageContentQuestionId}`);
      if(qEl){
        //get the answer container
        let answerContainerEl = qEl.querySelector('[data-mode="single"]');
        //get the coursePageContentQuestionResponseId from the answer
        let answerResponseEl = <HTMLElement>answerContainerEl.querySelector('[data-id^="cpcqrid-"]');
        if(answerResponseEl){
          //get the responseid
          let coursePageContentQuestionResponseId = +answerResponseEl.dataset.id.replace('cpcqrid-', '');

           //get the responseObj from the provided coursePageContentQuestionResponseId
            let responseObj: ICoursePageContentQuestionResponse = this.questionPack.coursePageContentQuestions.filter(q => q.coursePageContentQuestionResponses.some(r => r.coursePageContentQuestionResponseId === coursePageContentQuestionResponseId)).map(q => q.coursePageContentQuestionResponses.find(r => r.coursePageContentQuestionResponseId === coursePageContentQuestionResponseId))[0];

            if(responseObj){
              //find the equivalent answer in the questionResponses
              let qResponseObj: ICoursePageContentQuestionResponse;
              if(responseObj.coursePageContentQuestionId === questionItem.coursePageContentQuestionId){
                //the response actually belongs to the question!
                qResponseObj = responseObj;
              } else {
                //the response belongs to another question, try to find it's equivalent answer in the question (by getting a corresponding response with the same text)
                qResponseObj = questionItem.coursePageContentQuestionResponses.find(r => r.response === responseObj.response);
              }

              return qResponseObj;
            }
        } else {
          return null;
        }
      }

    return null;
  }

  private getQuestionElement(questionObj: ICoursePageContentQuestion): HTMLElement {
    if(!questionObj) return null; //failsafe
    let qEl = document.getElementById(`cpcqid-${questionObj.coursePageContentQuestionId}`);
    return qEl;
  }

  private getQuestionResponseContainer(questionEl: HTMLElement): HTMLElement {
    if(!questionEl) return null; //failsafe

    let answerContainerEl = <HTMLElement>questionEl.querySelector('[data-mode="single"]');
    return answerContainerEl;
  }

  private getResponseAnswerEl(answerContainerEl: HTMLElement): HTMLElement {
    if(!answerContainerEl) return null; //failsafe
    let answerResponseEl = <HTMLElement>answerContainerEl.querySelector('[data-id^="cpcqrid-"]');
    return answerResponseEl;
  }

  private ensureQuestionAnswerContainerIsEmpty(questionObj: ICoursePageContentQuestion): HTMLElement {
    let questionEl = this.getQuestionElement(questionObj);
      if(questionEl){
        let questionAnswerContainer = this.getQuestionResponseContainer(questionEl);
        if (questionAnswerContainer){
          let questionAnswerEl = this.getResponseAnswerEl(questionAnswerContainer);
          if(questionAnswerEl){
            //there is already an answerElement present, move it back to the main answers container
            this.answersContainerRef.nativeElement.appendChild(questionAnswerEl);
            this.changeButtonStyleForContainer(<HTMLElement>questionAnswerEl,  this.answersContainerRef.nativeElement);
          }

          return questionAnswerContainer;
        }
      }

      return null;
  }

  /// ------------------ FOR TESTING -------------------
  cmdSubmitAnswers(): void {
    this.clearAnswerStylesOnResponses(); //first clear previous styles
    this.applyAnswerStylesToResponses();
  }

  cmdReset(): void {
    this.clearAnswerStylesOnResponses();
  }

  private loadCourseSessionUserData(): void {
    if (!this.trainingEngineService.courseSession) {
      return; //missing courseSession!
    }

    this.trainingEngineService.getCourseSessionUserData(this.trainingEngineService.courseSession.courseSessionId, this.page.coursePageId).subscribe(csud => {
      if (csud) {
        //found existing courseSessionUserData object for the page / session
        this.courseSessionUserData = csud;
      } else {
        //there is no existing courseSessionUserData object, so create one (in memory)
        this.courseSessionUserData = this.trainingEngineService.initCourseSessionUserData();
        this.courseSessionUserData.courseSessionId = this.trainingEngineService.courseSession.courseSessionId;
       this.courseSessionUserData.courseId = this.trainingEngineService.courseSession.courseId;
       this.courseSessionUserData.courseModuleId = this.page.courseModuleId;
       this.courseSessionUserData.coursePageId = this.page.coursePageId;
      }

       //iterate through each question
       this.questionPack.coursePageContentQuestions.forEach(qItem => {
        
        //find the corresponding userdata for that question
        let userDataQuestionResponse = this.courseSessionUserData.courseSessionUserDataQuestionResponses.find (udqr => udqr.coursePageContentQuestionId === qItem.coursePageContentQuestionId);
        if(userDataQuestionResponse && userDataQuestionResponse.courseSessionUserDataQuestionResponseId){
          //we found an existing userData - WITH response

          //find the answer btn (that is mapped to the questionId)
          let answersContainer: HTMLElement = this.answersContainerRef.nativeElement;
          let answerBtn = answersContainer.querySelector(`[data-id="cpcqrid-${userDataQuestionResponse.coursePageContentQuestionResponseId}"]`);
          if(!answerBtn){
            //if we could nt find the answer btn, then look for another answer with the same response value but belongs to another question - this is likely a wrong answer which has duplicate entries in the db
            let alternateExistingAnswer = this.answers.find(a => a.response === userDataQuestionResponse.responseValue);
            if(alternateExistingAnswer){
              //find the existingAnswer in the answers container
              answerBtn = answersContainer.querySelector(`[data-id="cpcqrid-${alternateExistingAnswer.coursePageContentQuestionResponseId}"]`);
            }
          }
          
          if(!answerBtn){
              console.log(`Unexpected error - could not find answer with the same response. (ref loadCourseSessionUserData)`);
              //do nothing, just continue iterating
          } else {
            //with a answerBtn, move it to the question container (if there is anything already there, move it back to the main answers container below)
            //apply the answer style to the answerItem
            let questionAnswerContainerEl = this.ensureQuestionAnswerContainerIsEmpty(qItem);
            if(questionAnswerContainerEl){
              questionAnswerContainerEl.appendChild(answerBtn);
              this.changeButtonStyleForContainer(<HTMLElement>answerBtn, questionAnswerContainerEl);
              this.showOrHidePlaceholderInContainer(questionAnswerContainerEl);
            } else {
              console.log(`Unexpected error - could find find question answer container`);
            }
            
          }

        } else {
            //there is no response, ensure the question response container is empty (move anything back to the answer container)
            this.ensureQuestionAnswerContainerIsEmpty(qItem);
        }
        
       });

       this.applyAnswerStylesToResponses();
       //job done
     });

  }

  cmdSaveQuestionUserData(): Observable<ICourseSessionUserData> {
    //this method saves the courseSessionUserDataobject for this page, including all the courseSessionUserDataQuestionResponses

     if(this.trainingEngineService.courseSessionReadOnly){
       //don't save anything because the courseSession is readonly
       return Observable.empty();
     }
    //try to get the existing CourseSesionUserData object if it exists for the courseSession
     if (!this.courseSessionUserData) {
       //initialise a new courseSessionUserDataObject
       this.courseSessionUserData = this.trainingEngineService.initCourseSessionUserData();
       this.courseSessionUserData.courseSessionId = this.trainingEngineService.courseSession.courseSessionId;
       this.courseSessionUserData.courseId = this.trainingEngineService.courseSession.courseId;
       this.courseSessionUserData.courseModuleId = this.page.courseModuleId;
       this.courseSessionUserData.coursePageId = this.page.coursePageId;
     }

     //iterate through each question
     this.questionPack.coursePageContentQuestions.forEach(qItem => {
        //get the selected answer (responseObj) for the question
        let responseObj = this.getResponseObjForQuestion(qItem);

        //try to find if there is an existing userDataResponseItem for the question
        let userDataQuestionResponse = this.courseSessionUserData.courseSessionUserDataQuestionResponses.find (udqr => udqr.coursePageContentQuestionId === qItem.coursePageContentQuestionId);
        if(!userDataQuestionResponse){
          //could not find an existing userDataQuestionResponse object, so initialise a new one
          userDataQuestionResponse = this.trainingEngineService.initCourseSessionUserDataQuestionResponse();
          userDataQuestionResponse.courseSessionId = this.trainingEngineService.courseSession.courseSessionId;
          userDataQuestionResponse.coursePageContentQuestionId = qItem.coursePageContentQuestionId;

          //add it to the userData collection in the session
          this.courseSessionUserData.courseSessionUserDataQuestionResponses.push(userDataQuestionResponse);
        }
        
        if(responseObj){
          //set the answer to the selected value
          userDataQuestionResponse.coursePageContentQuestionResponseId = responseObj.coursePageContentQuestionResponseId;
          userDataQuestionResponse.responseValue = responseObj.response;
          userDataQuestionResponse.responseScore = responseObj.correctValue;
        } else {
          //we couldnt find the responseObj, so dont change any value
        }
     });

     //now update the courseSessionUserData via webservice
     return this.trainingEngineService.saveCourseSessionUserData(this.courseSessionUserData).do(csud => {
      if (csud && !this.courseSessionUserData.courseSessionUserDataId) {
        //update the courseSessionUserDataId because it was an add (the id was originally 0)
        this.courseSessionUserData.courseSessionUserDataId = csud.courseSessionUserDataId;
      }
    });

  }

  private checkIfAllQuestionsHaveBeenAnswered(): boolean {
    let allAnswered: boolean = false;

    let responseMaps = this.questionPack.coursePageContentQuestions.map(q => this.getResponseObjForQuestion(q));
    if(responseMaps.indexOf(null) === -1){
      allAnswered = true;
    } else {
      allAnswered = false;
    }
    // //this.questionPack.coursePageContentQuestions.
    // //iterate through each question and see if there is an answer btn
    // this.questionPack.coursePageContentQuestions.forEach((questionItem, i) => {
    //   let responseObj = this.getResponseObjForQuestion(questionItem);
    // });

    return allAnswered;
  }

  saveComponentUserData(): Observable<void> {
    //event that is subscribed to when the page changes. This triggers saving of the user data and then triggering the observable to signify it's complete
    let observer = Observable.create((obs) => {
      this.cmdSaveQuestionUserData().subscribe(() => {
        //saving is complete, trigger the observable to indicate it's finished
        
        //if the session is not read-only - apply the answer styles
        if(!this.courseSessionReadOnly){
          this.applyAnswerStylesToResponses();
        }
        obs.next();
      }, error => console.log(`Unexpected error ${error} (ref saveComponentUserData - training-question-interactive)`));
    });

    return observer;
  }

  canMoveForward(): boolean {
    if(this.courseSessionReadOnly){
      return true;  
    } else {
      return this.checkIfAllQuestionsHaveBeenAnswered();
    }
  }
}