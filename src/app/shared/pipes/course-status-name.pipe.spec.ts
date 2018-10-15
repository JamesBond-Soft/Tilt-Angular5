import { CourseStatusNamePipe } from './course-status-name.pipe';

describe('CourseStatusNamePipe', () => {
  it('create an instance', () => {
    const pipe = new CourseStatusNamePipe();
    expect(pipe).toBeTruthy();
  });
});
