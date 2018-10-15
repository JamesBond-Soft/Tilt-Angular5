import { OrganisationNamePipe } from './organisation-name.pipe';

describe('OrganisationNamePipe', () => {
  it('create an instance', () => {
    const pipe = new OrganisationNamePipe();
    expect(pipe).toBeTruthy();
  });
});
