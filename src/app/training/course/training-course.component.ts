import { Component, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
//import 'rxjs/add/operator/flatMap';
import 'rxjs/add/observable/empty';

import { ManageCoursesService } from '../../courses/manage-courses/manage-courses.service';
import { ICourse } from '../../courses/manage-courses/course';
import { ICoursePage } from '../../courses/manage-courses/course-pages/course-page';
import { ICoursePageContentBlock, IContentBlockType } from '../../courses/manage-courses/course-page-content-blocks/course-page-content-block';
import { TrainingEngineService } from '../training-engine.service';
import { CoursePageContentBlockService } from '../../courses/manage-courses/course-page-content-blocks/course-page-content-block.service';
import { ICourseModule } from '../../courses/manage-courses/course-modules/course-module';
import { CourseModuleService } from '../../courses/manage-courses/course-modules/course-module.service';


import { CoursePageService } from '../../courses/manage-courses/course-pages/course-page.service';
import { ICoursePageContentQuestion, ICoursePageContentQuestionType } from '../../courses/manage-courses/course-page-content-questions/course-page-content-question';
import { ICourseSession, ICourseSessionStatusType } from '../course-session';

import { TrainingQuestionComponent } from './training-question/training-question.component';
import { TrainingNextModuleDialogComponent } from './training-next-module-dialog/training-next-module-dialog.component';
import { TrainingCourseCompleteDialogComponent } from './training-course-complete-dialog/training-course-complete-dialog.component';
import { TrainingDynamicContentComponent } from './training-dynamic-content/training-dynamic-content.component';

import { LoginService, RoleType } from '../../login/login.service';

@Component({
  selector: 'app-training-course',
  templateUrl: './training-course.component.html',
  styleUrls: ['./training-course.component.scss']
})
export class TrainingCourseComponent implements OnInit {
  @ViewChild('trainingQuestionComponent') trainingQuestionComponent: TrainingQuestionComponent;
  @ViewChild('trainingNextModuleDialog') trainingNextModuleDialog: TrainingNextModuleDialogComponent;
  @ViewChild('trainingCourseCompleteDialog') trainingCourseCompleteDialog: TrainingCourseCompleteDialogComponent;
  @ViewChild('trainingDynamicContentComponent') trainingDynamicContentComponent: TrainingDynamicContentComponent;
 
  userRole: RoleType;
  courseId: number
  moduleId: number;
  pageId: number;
  course: ICourse;
  showFatalError: boolean;
  page: ICoursePage;
  module: ICourseModule;
  courseProgress: number;
  moduleProgress: number;
  IContentBlockType = IContentBlockType;
  ICoursePageContentQuestionType = ICoursePageContentQuestionType;
  private nextModuleId: number;
  
  constructor(private router: Router, 
              private route: ActivatedRoute,
              private courseService: ManageCoursesService,
              private trainingEngineService: TrainingEngineService,
              private coursePageContentBlockService: CoursePageContentBlockService,
              private coursePageService: CoursePageService,
              private courseModuleService: CourseModuleService,
              private loginService: LoginService
              ) { }

  ngOnInit() {
    
    //subscribe to when the route parameters change
    let routeChange$: Observable<any> = this.route.paramMap.switchMap(params => {
            //console.log('route changed');
            if(this.courseId !== +params.get('courseId')){
              //load the course
              this.courseId = +params.get('courseId');
              this.moduleId = +params.get('moduleId');
              this.pageId = +params.get('pageId');

              return this.courseService.getCourse(+params.get('courseId')).do(course => {
                this.course = course;
                this.courseModuleService.getCourseModule(this.moduleId).subscribe(module => this.module = module);
                this.coursePageService.getCoursePageWithData(+params.get('pageId')).subscribe(page => this.page = page);
              });
              
            } else if(this.moduleId !== +params.get('moduleId')) {
              this.moduleId = +params.get('moduleId');
              this.pageId = +params.get('pageId');
              return this.courseModuleService.getCourseModule(this.moduleId).do(module => {
                this.module = module;
                this.coursePageService.getCoursePageWithData(+params.get('pageId')).subscribe(page => this.page = page);
              });
                
              //return Observable.empty();
            } else if(this.pageId !== +params.get('pageId')) {
              this.pageId = +params.get('pageId');
              return this.coursePageService.getCoursePageWithData(+params.get('pageId')).do(page => this.page = page);
            } else {
              //who knows!
              return Observable.empty();
            }
           
    });

    routeChange$.subscribe(() => {
      console.log(`routeChanged course: ${this.courseId}, module: ${this.moduleId}, page: ${this.pageId}`);
      this.trainingEngineService.getCurrentCourseProgress(this.courseId, this.moduleId, this.pageId).map(progress => { return progress * 100}).subscribe(progress => {
        this.courseProgress = progress
      });

      this.trainingEngineService.getCurrentModuleProgress(this.courseId, this.moduleId, this.pageId).map(progress => { return progress * 100 }).subscribe(progress => {
        this.moduleProgress = progress;
      });
    })

    this.userRole = this.findUserRoleType(); 
  }

  cmdPrevious(): void {
    //go back to previous page
    if(this.trainingEngineService.courseSessionReadOnly){
      window.history.back();
      return;
    }

    if(!this.trainingEngineService.courseSessionReadOnly && this.page.coursePageContent.templateType === 1 && this.trainingQuestionComponent && this.trainingQuestionComponent.questionMapItems){
      //save the questions first
      this.trainingQuestionComponent.cmdSaveQuestionUserData().subscribe(() => {
        console.log('saving question was triggered');
        console.log('cmdPrevious');
        window.history.back();
      });
    } else {
      // No questions OR Course is being viewed via Training-History so it's READ ONLY
      console.log('no questions to save here');
      console.log('cmdPrevious');
      window.history.back();
    }
  }

  cmdNext(): void {
    //check if the session is read-only, if so, proceed to the next page
    if(this.trainingEngineService.courseSessionReadOnly){
      this.goToNextPage();
      return;
    }

    //determine pageType - as it has different behaviour to proceed to the next page
    switch(this.page.coursePageContent.templateType){
      case 0: {
        //static HTML
        this.goToNextPage();
        return;
      }
      case 1: {
        //Standard Questionaire
        if(this.trainingQuestionComponent){ //commended out this second part of check} && this.trainingQuestionComponent.questionMapItems){
          this.trainingQuestionComponent.saveComponentUserData().subscribe( () => { //this is the new standardised saveHook
            //this.trainingQuestionComponent.cmdSaveQuestionUserData().subscribe(() => {
              this.goToNextPage();
              return;
            });
        }
        break;
      }
      case 2: {
        //Resource Item
        this.goToNextPage();
        return;
      } 
      case 3:{
        //Dynamic
        if(this.trainingDynamicContentComponent){

          if(this.trainingDynamicContentComponent.canMoveForward()){
            this.trainingDynamicContentComponent.saveComponentUserData().subscribe(() => {

              // let transitionInterval: number = 0;
              // if(!this.trainingEngineService.courseSessionReadOnly){
              //   //force a delay so users can see their answers
              //   transitionInterval = 2000;
              // } 
  
              //TODO - ADD BEHAVIOUR TO BLOCK PAGE TRANSITION IF QUESTIONAIRE INCOMPLETE!!!!
  
            //setTimeout(() => {
              this.goToNextPage();
           // }, transitionInterval);
              
              return;
            });
          } else {
            alert('Please answer all question(s)');
            return;
          }
          
        }
        break;
      }
      default:{
        this.goToNextPage();
        return;
      }
    }
  }

  private goToNextPage(): void {
      //go to next page
      this.trainingEngineService.getNextPage(this.courseId, this.moduleId, this.pageId).subscribe(pageId => {
        if(pageId > 0){
          this.updateCourseSessionProgress(this.courseId, this.moduleId, pageId, ICourseSessionStatusType.Underway);
          this.router.navigate(['training/course',this.course.courseId, this.moduleId, pageId]);
        } else {
          if(pageId === -2 || pageId === null){
            //we are already on the last page, try to get the next module
            this.trainingEngineService.getNextModule(this.courseId, this.moduleId).subscribe(nextModuleId => {
              if(nextModuleId > 0){
                //ask for confirmation if the user wants to continue to the next module
                //load the next module to get the name
                this.courseModuleService.getCourseModule(nextModuleId).subscribe(nextModule => {
                  this.nextModuleId = nextModuleId;
                  this.trainingNextModuleDialog.openModal(this.module.name, nextModule.name);
                })
              } else {
                if(nextModuleId === -2){
                  //that was the last module
                  this.updateCourseSessionProgress(this.courseId, this.moduleId, this.pageId, ICourseSessionStatusType.Completed);
                  this.trainingCourseCompleteDialog.openModal(this.course.name);
                  // alert('Congratulations! - You have finished the course.');

                  // if(this.trainingEngineService.courseSessionReadOnly){
                  //   //course was viewed via training-history - return user back to training-history component
                  //   this.router.navigate(['/training/history']);
                  // } else {
                  //   //normal course session - return user to my-courses component
                  //   this.router.navigate(['/training/my-courses']);
                  // }
                } else {
                  console.error('this is bad - couldnt get the next module');
                }
              }
            })
          } else {
            console.log('page is empty. Trying the next module');
            this.pageId = -2;
            this.cmdNext();
          }
        }
        
      });
  }

  private updateCourseSessionProgress(courseId: number, moduleId: number, pageId: number, status: ICourseSessionStatusType): void {
    if (!this.trainingEngineService.courseSession && !this.trainingEngineService.courseSessionReadOnly) {
      this.trainingEngineService.courseSession = this.trainingEngineService.initCourseSession();
      this.courseId = courseId;
    }

    this.trainingEngineService.getCurrentCourseProgress(courseId, moduleId, pageId).map(progress => { return progress * 100 }).subscribe(progress => {
      let courseSession: ICourseSession = this.trainingEngineService.courseSession;
      courseSession.courseProgress = progress;
      courseSession.currentCourseModuleId = moduleId;
      courseSession.currentCoursePageId = pageId;
      courseSession.status = status;
      if (!this.trainingEngineService.courseSessionReadOnly) {
        this.trainingEngineService.updateCourseSessionProgress(courseSession).subscribe(() => {
        });
      }     
    });
  }

  private findUserRoleType(): number {
    //find the role the user is assigned to
    return this.loginService.getUserRoleType();
  }

  cmdBackToMyCourses(): void {
    if (this.trainingEngineService.courseSessionReadOnly) {
      // currently in read-only mode - return to training-history
      if (this.userRole === RoleType.Admin || this.userRole === RoleType.Sysadmin) {
        this.router.navigate(['/reporting/completed-courses']);
      }
      else 
      this.router.navigate(['/training/history']);

    } else {
      //save progress - return to my-courses
      if (this.page.coursePageContent.templateType === 1 && this.trainingQuestionComponent && this.trainingQuestionComponent.questionMapItems) {
        //save the questions first
        this.trainingQuestionComponent.cmdSaveQuestionUserData().subscribe(() => {
          //navigate to my-courses
          if (this.userRole === RoleType.Admin || this.userRole === RoleType.Sysadmin) {
            this.router.navigate(['/reporting/completed-courses']);
          }
          else 
          this.router.navigate(['/training/history']);
        });
      } else {
        //navigate to my-courses
        if (this.userRole === RoleType.Admin || this.userRole === RoleType.Sysadmin) {
          this.router.navigate(['/reporting/completed-courses']);
        }
        else 
        this.router.navigate(['/training/history']);
      }
    }
  }

  nextModuleOnConfirmHandler(confirmationResult: boolean): void {
    if (confirmationResult) {
      //we will open the next module.
      //first get the next pageId of that module
      this.trainingEngineService.getNextPage(this.courseId, this.nextModuleId, 0).subscribe(nextPageId => {
        if (nextPageId > 0) {
          this.updateCourseSessionProgress(this.courseId, this.nextModuleId, nextPageId, ICourseSessionStatusType.Underway);
          this.router.navigate(['training/course', this.course.courseId, this.nextModuleId, nextPageId]);
        } else {
          //something is wrong with the module, call cmdNext to go the the next module?
          this.moduleId = this.nextModuleId;
          this.pageId = -2;
          this.cmdNext();
        }
      });

    } else {
      //user clicked NO.

      if(this.trainingEngineService.courseSessionReadOnly){
        //take the user back to the training-history page
        this.router.navigate(['/training/history']);
      } else {
        //take the user back to my courses page
        this.router.navigate(['/training/my-courses']);
      }
    }
  }
}
