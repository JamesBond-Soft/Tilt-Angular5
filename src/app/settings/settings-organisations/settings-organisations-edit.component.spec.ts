// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms'
// import { RouterTestingModule } from '@angular/router/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// import { SettingsOrganisationsEditComponent } from './settings-organisations-edit.component';
// import { SettingsOrganisationsService } from './settings-organisations.service';
// import { ActivatedRoute, Data, Params } from '@angular/router';
// import { Observable } from 'rxjs/Observable';
// import { IOrganisation } from './organisation';


// describe('SettingsOrganisationsEditComponent', () => {
//   let component: SettingsOrganisationsEditComponent;
//   let fixture: ComponentFixture<SettingsOrganisationsEditComponent>;
//   // class MockActivatedRoute extends ActivatedRoute {
//   //   constructor() {
//   //       super();
//   //       let testOrg: IOrganisation = {
//   //         organisationId: 1,
//   //         organisationName: 'test',
//   //         description: ''
//   //       };
        
//   //       this.params = Observable.of({organisation: testOrg});
//   //   }
//   // }
//   let testOrg: IOrganisation = {
//     organisationId: 1,
//     organisationName: 'test',
//     description: ''
//   };
//   class MockActivatedRoute {
//     // here you can add your mock objects, like snapshot or parent or whatever
//     // example:
//     public data = {
//       organisation: testOrg
//     }

//     params = {
//       subscribe: jasmine.createSpy('subscribe')
//        .and
//        .returnValue(Observable.of(<Params>{id: 1}))
//     }

//     parent = {
//       snapshot: {data: {organisation: testOrg } },
//       routeConfig: { children: { filter: () => {} } }
//     };
//   }
  
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         ReactiveFormsModule,
//         RouterTestingModule,
//         HttpClientTestingModule
//       ],
//       declarations: [ SettingsOrganisationsEditComponent ],
//       providers: [SettingsOrganisationsService,
//         { provide: ActivatedRoute, useClass: MockActivatedRoute }
//       ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(SettingsOrganisationsEditComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//     //fixture.autoDetectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
