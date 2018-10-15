import { FilterMyCoursesPipe } from "./filter-my-courses.pipe";
import { CourseSessionStatusNamePipe } from './course-session-status-name.pipe';
import { DatePipe } from "@angular/common";

describe('FilterMyCoursesPipe', () => {
  it('create an instance', () => {
    let  courseSessionStatusNamePipe = new CourseSessionStatusNamePipe();
    const pipe = new FilterMyCoursesPipe(courseSessionStatusNamePipe, new DatePipe(''));
    expect(pipe).toBeTruthy();
  });
});
