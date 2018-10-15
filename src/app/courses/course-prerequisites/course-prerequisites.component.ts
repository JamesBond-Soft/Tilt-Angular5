import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { CoursePrerequisitesService } from './course-prerequisites.service';
import { ICourse } from '../manage-courses/course';
import { ICoursePrerequisites } from './course-prerequisites';
import { ManageCoursesService } from '../manage-courses/manage-courses.service';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-course-prerequisites',
  templateUrl: './course-prerequisites.component.html',
  styleUrls: ['./course-prerequisites.component.scss']
})
export class CoursePrerequisitesComponent implements OnInit {  
  @Input() coursePrerequisites: ICoursePrerequisites[]
  @Input() organisationId: number;
  @Input() selectedCourse: ICourse;

  private _coursePrerequisites: ICoursePrerequisites[] = new Array();
  private courses:ICourse[] = new Array();  
  availableCourses = []
  currentPrerequisites = []

  searchString:string = ""

  constructor(
              public bsModalRef: BsModalRef, 
              private coursePrerequisiteService: CoursePrerequisitesService, 
              private courseService: ManageCoursesService) { 
  }

  ngOnInit() {
    this.coursePrerequisites.forEach(c=>{
      this._coursePrerequisites.push(c);
    })
    this.loadCourses();
  }
  

  loadCourses(){
    if(!this.organisationId) return;
    
    this.courseService.getCourses(this.organisationId).subscribe(data=>{
      data.forEach(d=>{
        if(d.courseId!= this.selectedCourse.courseId)//prevent adding self
        {
          this.courses.push(d);             
        }
      })
      this.loadAvailableCourses();
    });      
  }

  cmdSearchCourse(event)
  {
    let value = event.target.value;
    this.searchString = value;
    this.loadAvailableCourses();
  }

  SortAvailableAndCurrentPrerequisites() {
    this.currentPrerequisites = []
    this.availableCourses = []

    this.courses.forEach(c=>{
      let exists = false;
      this._coursePrerequisites.forEach(cp=>{
        if(cp.prerequisiteCourseId== c.courseId)
        {
          exists= true;
        }
      })

      if(exists)
      {
        this.currentPrerequisites.push(c);
      }else{
        this.availableCourses.push(c);
      }
     })
  }

  loadAvailableCourses(){
    //this.availableCourses = this.courses; //reset collection
    this.SortAvailableAndCurrentPrerequisites()
    
    if(this.searchString == "")
      return;

    let foundCourses = [];
     this.availableCourses.forEach(c=>{
       if(c.name.toLowerCase().indexOf(this.searchString.toLowerCase())>=0)
       {
          foundCourses.push(c);
       }
     })
    this.availableCourses = foundCourses;
  }

  cmdAddCurrentPrerequisiteItem(course)
  {
    let preq : ICoursePrerequisites = {
      courseId: this.selectedCourse.courseId,
      order:1,
      coursePrerequisiteID:0,
      prerequisiteCourseId:course.courseId,
      prerequisiteCourseName:course.name,
      prerequisiteCourseCompleted:false
    }

    this._coursePrerequisites.push(preq);
    this.loadAvailableCourses();
  }

  cmdRemoveCurrentPrerequisiteItem(course)
  {
    let tempCollection = [];
    this._coursePrerequisites.forEach(c=>{
      if(c.prerequisiteCourseId != course.courseId)
      {
        tempCollection.push(c)
      }
    })

    this._coursePrerequisites = tempCollection;
    this.loadAvailableCourses();
  }

  cmdSave(){
    this.coursePrerequisites = this._coursePrerequisites;
    this.bsModalRef.hide();
  }

  cmdCancel(){
    this.bsModalRef.hide();
  }
}
