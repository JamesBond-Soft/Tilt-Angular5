import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewContainerRef, ViewChild, Compiler, Injector, NgModuleRef, ApplicationRef, ComponentFactoryResolver, Input, Output, EventEmitter } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { IResourceLibraryAssetType, IResourceLibraryAsset } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { ResourceLibraryAssetService } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { ICoursePageContentBlock, IContentBlockType } from '../courses/manage-courses/course-page-content-blocks/course-page-content-block';
import { CoursePageContentBlockService } from '../courses/manage-courses/course-page-content-blocks/course-page-content-block.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IForcedStorage } from './forced-storage';
import { IMediaPickerMode, MediaPickerDialogComponent } from '../shared/tiny-editor/media-picker-dialog/media-picker-dialog.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/do';
import { SimpleComponent } from './simple.component';
import { ICoursePage } from '../courses/manage-courses/course-pages/course-page';
import { QuestionPickerDialogComponent } from '../shared/question-picker-dialog/question-picker-dialog.component';
import { ICoursePageContentQuestionPack } from '../courses/manage-courses/course-page-content-questions/course-page-content-question-pack';
import { CoursePageContentQuestionPackService } from '../courses/manage-courses/course-page-content-questions/course-page-content-question-pack.service';

declare var grapesjs: any;

@Component({
  selector: 'contentcreator',
  templateUrl: './contentcreator.component.html',
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  //encapsulation: ViewEncapsulation.None
  //template: '<div id="gjs"></div>'
  //styleUrls: ['./contentcreator.component.scss']
})
export class ContentCreatorComponent implements OnInit {
  editor: any;
  resourceLibraryAssets: IResourceLibraryAsset[];
  coursePageContentBlock: ICoursePageContentBlock;
  constructor(private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private resourceLibraryAssetService: ResourceLibraryAssetService,
              private coursePageContentBlockService: CoursePageContentBlockService,
              private modalService: BsModalService,
              private changeDetection: ChangeDetectorRef,
              // private _compiler: Compiler,
              // private _injector: Injector,
              // private _m: NgModuleRef<any>,
              // private app: ApplicationRef,
              private resolver: ComponentFactoryResolver,
              private coursePageContentQuestionPackService: CoursePageContentQuestionPackService
            ) { }

  extractedHTML: string;
  extractedCSS: string;
  extractedData: any[];
  forcedStorage: IForcedStorage;
  subscriptions: Subscription[] = []; //array to hold modal subscriptions
  questionPackMappings: IGrapesJsComponentMapping[] = [];

  @ViewChild('extractSection', { read: ViewContainerRef }) extractSection: ViewContainerRef;
  
  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    this._page = page;
    this.onStartEdit();
  }
  get page(): ICoursePage { return this._page };

  @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished

  ngOnInit() {
    this.initEditor(); //initalise the editor
  }

  private onStartEdit(): void {
    //method triggered when the page Input property is set.
    this.loadCoursePageContentBlock(); //get the coursepagecontentblock from the passed page property and load the data into the canvas
  }

  private loadCoursePageContentBlock(): void {
    //load the coursePageContentBlock from the current page (loaded direct via service)
    this.coursePageContentBlockService.getCoursePageContentBlocksByPageId(this.page.coursePageId).subscribe(coursePageContentBlocks => {
      if(coursePageContentBlocks && coursePageContentBlocks.length){
        this.coursePageContentBlock = coursePageContentBlocks[0]; //pick the first block always as contentcreator stuff is always one block
        //this.loadCoursePageContentIntoEditor();
        this.loadQuestionPacks();
        
      } else {
        //no existing blocks, initialise a new empty contentblock for the page
        console.log('No content block, initialising new content block object');
        this.coursePageContentBlock = this.coursePageContentBlockService.initialiseCoursePageContentBlock();
        this.coursePageContentBlock.coursePageId = this.page.coursePageId;
        this.coursePageContentBlock.coursePageContentId = this.page.coursePageContent.coursePageContentId;
        this.coursePageContentBlock.blockType = IContentBlockType.HTML;

        this.questionPackMappings = [];
      }
      
    }, error => console.log(`Unexpected error ${error} (ref loadCoursePageContentBlock)`));
  }

  private loadQuestionPacks(): void {
    //check if existing page
    if(this.page.coursePageId){
      //load all existing questionPacks into array
      this.coursePageContentQuestionPackService.getCoursePageContentQuestionPacksByPageId(this.page.coursePageId).subscribe(questionPacks => {
        this.questionPackMappings = questionPacks.map(qp => <IGrapesJsComponentMapping>{ compModelRef: null, questionPack: qp });
        this.loadCoursePageContentIntoEditor();
      });
    }
  }

  private loadCoursePageContentIntoEditor(): void {
    //load the data from the content-block into the forced-storage instance
    if(!this.coursePageContentBlock) return; //failsafe

    let forcedStorage: IForcedStorage = <IForcedStorage>{}; //initialise new forcedStorage object

    //load the styles if it's available
    if(this.coursePageContentBlock.rawStyles && this.coursePageContentBlock.rawStyles.length){
     // this.forcedStorage.
     forcedStorage["gjs-styles"] = this.coursePageContentBlock.rawStyles;
    }

    //now load the content either via structured raw components or preprocessed html(legacy)
    if(this.coursePageContentBlock.rawComponents && this.coursePageContentBlock.rawComponents.length){
      //we have raw content - so use this as preferred loading method
      forcedStorage["gjs-components"] = this.coursePageContentBlock.rawComponents;
    } else {
      if(this.coursePageContentBlock.content && this.coursePageContentBlock.content.length){
        //load the pre-processed html - not ideal. This may have come from the tinyeditor
        forcedStorage["gjs-html"] = this.coursePageContentBlock.content;
      }
    }

    this.forcedStorage = forcedStorage;
    this.editor.load(); //force the editor to load the data from forced-storage (ie refresh canvas)
  }

  private initEditor(){
    //main method that initialises the editor and associated plugins.
    this.editor = grapesjs.init({
      container: '#gjs',
      plugins: [
        'grapesjs-tiltsuite',
        'gjs-blocks-basic',
        'gjs-blocks-flexbox',
        'grapesjs-lory-slider',
        'grapesjs-tabs',
        //'grapesjs-blocks-bootstrap4'//, //experimental
      ],
      pluginsOpts: {
        'gjs-blocks-basic': {
          blocks: ['column1', 
                   'column2', 
                   'column3', 
                   'column3-7', 
                   'text', 
                   'link', 
                   'image', 
                   'video', 
                   'map'],
          stylePrefix: 'ch-'
        },
        'grapesjs-tabs': {
          tabsBlock: {
            category: 'Basic'
          }
        },
        'grapesjs-lory-slider': {
          sliderBlock: {
            category: 'Basic'
          }
        }
      },
      storageManager: { type: 'forced-storage' }, //custom storage
      forceClass: true,
      canvas: {
        styles: [
          //this.location.prepareExternalUrl('../node_modules/bootstrap/dist/css/bootstrap.min.css'),
          //this.location.prepareExternalUrl('/assets/tilt_ui/scss/tilt.scss'),
          'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css'
        ],
        scripts: [
          // 'https://code.jquery.com/jquery-3.2.1.slim.min.js',
          // 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js',
        //  'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js'
        ],
      }
    });

    let bm = this.editor.BlockManager;
    bm.add('questions', {
      label: 'Questions',
      category: 'TILT Suite',
      attributes: {
        class:'fa fa-hand-rock-o'
      },
      content: { type: 'question-types', activeOnRender: 1 },
    });

    this.initForceStorage(); //initialises the custom storage for grapesjs
    
    //setup custom buttons & behaviour for editor
    this.buildEditorPanelButtons();
    this.setupDefaultCommandsForEditor();
    this.InsertFontSizeControlInRichTextEditor();

    //make the blocks panel open by default
    this.editor.Panels.getButton('views', 'open-blocks').set('active', true);

    //custom behaviour to attach a resourceAssetId to the images where possible on add/edit
    //this.hookImageEditEventToAttachUUID(); //temporarily off

    //generate a custom block
    this.buildCustomBlock();

    //--- testing, programatically add a new questionpack component to canvas ----
    // this.editor.addComponents({type: 'questions'});
    // this.editor.runCommand('open-question-picker', { target: this.editor.getComponents().models[0]})

    //setup event handlers for editor
    this.editor.on('component:remove', (model) => { 
      //NOTE THERE IS A BUG IN GRAPESJS v0.12.40. THIS IS BEING TRIGGERED ON DESELECT ON A COMPONENT.
      //console.log('remove triggered');
      this.editorOnComponentRemovedHandler(model);
    });
  }

  private initForceStorage(){
    //initialise the forced storage object if it's not already set
    if(!this.forcedStorage){
      this.forcedStorage = {"gjs-components": null, "gjs-styles": null, "gjs-html": null, "gjs-css": null};
    }

    //attach the forced storage to the object and define the load and store events required
    this.editor.StorageManager.add('forced-storage', {
      load: (keys, callback, callbackError) => {
        //load data from forced-storage property in angular component
        let result = {};

        if(!this.forcedStorage){
          this.forcedStorage = {"gjs-components": null, "gjs-styles": null, "gjs-html": null, "gjs-css": null};
        }

        keys.forEach(key => {
          const value = this.forcedStorage[key];
          if (value) {
            result[key] = value;
          }
        });
    
        // Might be called inside some async method
        callback(result);
      },
      store: (data, callback, callbackError) => {
        //store data into forced-storage property that resides in angular-component. The angular component is responsible for then persisting data in db and etc
        for (let key in data) {
          this.forcedStorage[key] = data[key];
        }
        // Might be called inside some async method
        callback();
      }
    });
  }

  private generateHTMLForQuestion(model: any): Element{
    let qpMapping: IGrapesJsComponentMapping = this.questionPackMappings.find(qpm => qpm.compModelRef === model);
    
    let questionPackItem: ICoursePageContentQuestionPack;
    if(qpMapping){
      questionPackItem = qpMapping.questionPack;
    } else {
      //we could not find the questionPack by model, so lets search by questionPackId instead (if it exists)
      if(model.attributes.attributes && model.attributes.attributes['data-uuid'] && model.attributes.attributes['data-uuid'] > 0){
        //existing questionPackid specified, lets try to find it in the questionPackMappings array
        qpMapping = this.questionPackMappings.find(qpm => qpm.questionPack.coursePageContentQuestionPackId === model.attributes.attributes['data-uuid'])
        qpMapping.compModelRef = model;
        questionPackItem = qpMapping.questionPack;
      }
    }

    if(questionPackItem){
      var questionPackNode = document.createElement('div');
      let innerHTMLStr: string = "";
        //build questions
        questionPackItem.coursePageContentQuestions.forEach(q => {
          let correctAnswer = q.coursePageContentQuestionResponses.find(r => r.correctValue === 1);
          innerHTMLStr += `<div>${q.question} : ${correctAnswer ? correctAnswer.response : ''}</div>`
        });

        if(questionPackItem.coursePageContentQuestions.length && questionPackItem.coursePageContentQuestions[0].coursePageContentQuestionResponses.some(r => r.correctValue === 0)){
          //build incorrectResponses - using first question only
          let invalidQuestionsStr = '<div>Incorrect Answers:<br />';
          questionPackItem.coursePageContentQuestions[0].coursePageContentQuestionResponses.forEach(r => {
            if(r.correctValue === 0){
              invalidQuestionsStr += `<div>${r.response}</div>`;
            }
          })
          invalidQuestionsStr += '</div>';

          innerHTMLStr += invalidQuestionsStr;
        }
        
        questionPackNode.innerHTML = innerHTMLStr;
      return questionPackNode;
    } else{
      console.log('Warning - Question Pack Not Found...');
      var warningNode = document.createElement('div');
      warningNode.innerHTML = `<div>ERROR - Question Pack Not Found...</div>`;
      return warningNode;
    }   
  }
  private buildCustomBlock(){
    //helper method to assist in building new blocks and components before moving to plugin

    let comps = this.editor.DomComponents;
    // Get the model and the view from the default Component type
    var defaultType = comps.getType('default');
    var defaultModel = defaultType.model;
    var defaultView = defaultType.view;

    var extRefToGenerateHTMLForQuestion = (model: any) => { return this.generateHTMLForQuestion(model) };
    //NOTE custom blocks and components moved into grapesjs-tiltsuite plugin
    
    comps.addType('question-types', {
      model: defaultModel.extend( {           
            initialize: function initialize() {
                defaultModel.prototype.initialize.apply( this, arguments );
            }, toHTML() {
                if(this.attributes.attributes && this.attributes.attributes['data-uuid']){
                  return `<div id="cpcqp-${this.attributes.attributes['data-uuid']}"><!-- COURSEPAGECONTENTQUESTIONPACK:${this.attributes.attributes['data-uuid']} --></div>`;
                } else {
                  return '';
                }
            }
        },
        {
            isComponent: function ( el ) {
                if ( el.classList && el.classList.contains( 'question-types' ) ) {
                    return { type: 'question-types' };
                }
            }
        } 
      ),
        
      view: defaultType.view.extend({
        init(){
         this.listenTo(this.model, 'active', this.openQuestionPicker);
       },
        events: {
          dblclick: function(){
             this.openQuestionPicker();
           }
        },
        openQuestionPicker(){
          this.opts.config.em.get('Editor').runCommand('open-question-picker', { target: this.model})
        },
        render(){
          defaultView.prototype.render.apply( this, arguments );
          this.el.classList.add( 'question-types', 'questionTypes' );

          var getQuestionHTMLNode = extRefToGenerateHTMLForQuestion(this.model);
          if(getQuestionHTMLNode){
            this.el.appendChild(getQuestionHTMLNode);
          } else {
            this.el.appendChild(document.createTextNode('WARNING - No Questions!!'));
          }
         
          return this;
        }
      }),
    });

   

  }

  private InsertFontSizeControlInRichTextEditor() {
    var rte = this.editor.RichTextEditor;
   
    // An example with fontSize
    rte.add('fontSize', {
      icon: `<select class="gjs-field">
            <option>1</option>
            <option>4</option>
            <option>7</option>
          </select>`,
      // Bind the 'result' on 'change' listener
      event: 'change',
      result: (rte, action) => rte.exec('fontSize', action.btn.firstChild.value),
      // Callback on any input change (mousedown, keydown, etc..)
      update: (rte, action) => {
        const value = rte.doc.queryCommandValue(action.name);
        if (value != 'false') { // value is a string
          action.btn.firstChild.value = value;
        }
      }
    });
  }

  private buildEditorPanelButtons() {
    //this creates the top panel buttons for the editor eg undo, redo and etc

    let pnm = this.editor.Panels;
    pnm.addButton('options', [{
      id: 'undo',
      className: 'fa fa-undo icon-undo',
      command: 'undo',
      attributes: { title: 'Undo (CTRL/CMD + Z)' }
    }, {
      id: 'redo',
      className: 'fa fa-repeat icon-redo',
      command: 'redo',
      attributes: { title: 'Redo (CTRL/CMD + SHIFT + Z)' }
    }, {
      id: 'clean-all',
      className: 'fa fa-trash icon-blank',
      command: 'clean-all',
      attributes: { title: 'Empty canvas' }
    }, 
    // {
    //   id: 'tilt-test',
    //   className: 'fa fa-magic',
    //   command: 'tilt',
    //   attributes: { title: 'Test trigger tilt method' }
    // }
    ]);
  }

  private setupDefaultCommandsForEditor(): void {
    //sets up the commands for the editor top buttons ie undo, redo and etc

    var cmdm = this.editor.Commands;
    cmdm.add('undo', {
      run: function (editor, sender) {
        sender.set('active', 0);
        editor.UndoManager.undo(1);
      }
    });
    cmdm.add('redo', {
      run: function (editor, sender) {
        sender.set('active', 0);
        editor.UndoManager.redo(1);
      }
    });
    cmdm.add('set-device-desktop', {
      run: function (editor) {
        editor.setDevice('Desktop');
      }
    });
    cmdm.add('set-device-tablet', {
      run: function (editor) {
        editor.setDevice('Tablet');
      }
    });
    cmdm.add('set-device-mobile', {
      run: function (editor) {
        editor.setDevice('Mobile portrait');
      }
    });
    cmdm.add('clean-all', {
      run: function (editor, sender) {
        sender && sender.set('active', false);
        if (confirm('Are you sure to clean the canvas?')) {
          var comps = editor.DomComponents.clear();
          setTimeout(function () {
            //localStorage.clear() //disabled this as it inadvertidely clears tilt session authentication!
          }, 0)
        }
      }
    });

    // let parent = this;
    // cmdm.add('tilt', {
    //   run: (parent) => {
    //     this.cmdGetHTML();
    //     alert('I just talked to angular!');
    //   }
    // });

    cmdm.add('open-assets', {
      run: (editor, sender, opts = {}) =>{
        //console.log('asset manager open for business');
        let editorSelectedItem: any = this.editor.getSelected();

        //get mode
        let mode: IMediaPickerMode;
        if(opts['types'][0] === 'video'){
            mode = IMediaPickerMode.Video;
        } else {
          mode = IMediaPickerMode.Image;
        }
        this.openMediaSelectionDialog(mode, opts['target']);
      }
    });

    cmdm.add('open-question-picker', {
      run: (editor, sender, opts = {}) =>{
        //console.log('asset manager open for business');
        let editorSelectedItem: any = this.editor.getSelected();
       
        this.openQuestionPickerDialog(opts['target']);
      }
    });

    // cmdm.add('tlb', {
    //   run: function (editor, sender) {
    //     editor.getSelected().view.enableEditing();
    //     //sethref for link etc
    //     alert('Hello world!');
    //   },
    //   stop: function (editor, sender) {
    //   },
    // });
  }

  private editorOnComponentRemovedHandler(model: any): void {
    //console.log('component removed');
    //ATTENTION!!! - this is not working correctly, GrapesJS incorrectly triggers this on deselect. GrapesJS will fix issue in future release, so commenting this code for now
    // if(model.attributes.type === 'questions'){
    //   let qpMappingIndex = this.questionPackMappings.findIndex(qm => qm.compModelRef === model);
    //   if(qpMappingIndex > -1){
    //     let qpMapping: IGrapesJsComponentMapping = this.questionPackMappings[qpMappingIndex];
        
    //     //check if the questionPack was existing - keep it if so, otherwise trash it
    //     if(qpMapping.questionPack.coursePageContentQuestionPackId){
    //       //keep the mapping but clear the model
    //       qpMapping.compModelRef = null;
    //     } else {
    //       //only in-memory, trash it
    //       this.questionPackMappings.splice(qpMappingIndex,1);
    //     }
        
    //   }
    // }
  }
  
  cmdSave(): void {
    //save method to store data that is in the forced-storage instance; within the relavent coursepagecontentblock object. Angular is responsible for storing and loading data via web services.
    
    this.editor.store(); //trigger method to force canvas to save current changes into the forced-storage instance
    this.saveCoursePageContentQuestionPacks().subscribe(() => {
      console.log('saved question packs');
      //now save the canvas to store again (as the attributes would have changed)
      this.editor.store();

      //check that there is a contentblock - failsafe or if playing with contentcreator to build new components
      if(this.coursePageContentBlock){
        var html = this.editor.getHtml(); //get pre-processed html that is potentially rendered in training engine
        var css = this.editor.getCss(); //get the css styles for canvas.
        var extractedHTML = `<style>${css}</style>${html}`; //store the css inside a style tag and merge it above the raw html.

        this.coursePageContentBlock.content = extractedHTML; //save the css + html as the coursepagecontentblock - content
        this.coursePageContentBlock.rawStyles = this.forcedStorage["gjs-styles"]; //get the raw css objects in json - NB. only used by contentcreator
        this.coursePageContentBlock.rawComponents = this.forcedStorage["gjs-components"]; //get the raw html objects in json - NB. only used by contentcreator

        //call the webservice to save the data
        this.coursePageContentBlockService.saveCoursePage(this.coursePageContentBlock).subscribe(() => {
          this.onFinishSave(true); //all good
        }, error => console.log("Unexpected error: ${error} (ref cmdSave)")); //well thats a problem
      } else {
        this.onFinishSave(false); //skip saving anything
      }
      
    }, error => console.log(`Unexpected error: ${error} (ref cmdSave->saveCoursePageContentQuestionPacks)`));
    return;

    
  }

  cmdCancel(): void {
    //user clicked the cancel button
    this.onFinishSave(false);
  }

  private onFinishSave(shouldRefresh: boolean): void {
    this.onFinishEditEvent.emit(shouldRefresh);
  }

  private saveCoursePageContentQuestionPacks(): Observable<any> {
    //save any questionPacks that may have been added to canvas. This is done BEFORE saving the contentBlock as the contentBlock relies on the ID values in the pre-processed html

    var arrayOfObservables = []; //array that will hold observers for each save observable
    
    //iterate through each CoursePageContentQuestionPack and save changes.
    this.questionPackMappings.forEach((qpMapping) => {
      if(qpMapping.compModelRef && qpMapping.questionPack && qpMapping.compModelRef.view.$el[0].parentNode){
        //save the questionPack via service
        let obs = this.coursePageContentQuestionPackService.saveCoursePageContentQuestionPack(qpMapping.questionPack)
        .do(resp => {
          //saving pack to service now complete. check if it was a new pack, if so, then update the questionPackId value in the grapesjs questions block/component attribute
          if(!qpMapping.questionPack.coursePageContentQuestionPackId){
            //this was a new questionPack, so update the id value for items in memory
            qpMapping.questionPack.coursePageContentQuestionPackId = resp.coursePageContentQuestionPackId; //update the id in the corresponding pack object in the array
            
            //now set data-uuid of newly created questionPack inside the questionPack component
            if (!qpMapping.compModelRef.attributes.attributes['data-uuid']) {
              qpMapping.compModelRef.addAttributes({ 'data-uuid': qpMapping.questionPack.coursePageContentQuestionPackId });
            } else {
              qpMapping.compModelRef.setAttributes({'data-uuid': qpMapping.questionPack.coursePageContentQuestionPackId})
            }
          }
        });
        arrayOfObservables.push(obs);
      }
    });

    if(arrayOfObservables.length==0)
    {
      arrayOfObservables.push(Observable.of(null));
    }

   return Observable.forkJoin(arrayOfObservables); 
  }

  private openMediaSelectionDialog(mediaPickerMode: IMediaPickerMode, target: any): void {
    //opens the video-selection-dialog component in a modal, and subscribes to the hide event

    //set the initial state objects
    let initialState: any = {mediaPickerMode: mediaPickerMode}; //define what mode the media picker will act in ie image, video
    let mediaPickerDialogComponentModalRef: BsModalRef = this.modalService.show(MediaPickerDialogComponent, {initialState: initialState, class: 'modal-lg'});
    
    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)

          //get any data from the component if needed
          let vsdComp: MediaPickerDialogComponent  = mediaPickerDialogComponentModalRef.content;
          let resourceLibraryAssetId: number; //temp var that is used to set the data-uuid attribute
          if(vsdComp){
            if(vsdComp.selectedAsset){
              //selected an asset
              resourceLibraryAssetId = vsdComp.selectedAsset.resourceLibraryAssetId;

              //get mode and set src
              if(mediaPickerMode === IMediaPickerMode.Video){
                //picked asset detected here
  
                //get the thumbnail image (if it exists)
                // if(vsdComp.selectedAsset.thumbnailFileProperties && vsdComp.selectedAsset.thumbnailFileProperties.url && vsdComp.selectedAsset.thumbnailFileProperties.url.length){
                // //target.set('src', vsdComp.selectedAsset.thumbnailFileProperties.url);
                // }
                target.set('src', vsdComp.selectedAsset.fileProperties.url);
                
                
              } else if(mediaPickerMode === IMediaPickerMode.Image){
                if(vsdComp.selectedAsset.fileProperties && vsdComp.selectedAsset.fileProperties.url && vsdComp.selectedAsset.fileProperties.url.length){
                  target.set('src', vsdComp.selectedAsset.fileProperties.url);
                }
              }

            } else {
              //no selected asset
              resourceLibraryAssetId = -1;

              //the user didnt select anything - set source to nada
              target.set('src', '');
            }
          }
          
          //set the data-uuid attribute
          if (!target.attributes.attributes['data-uuid']) {
            //add attribute
            target.addAttributes({ 'data-uuid': resourceLibraryAssetId });
          } else {
            //update existing attribute
            target.attributes.attributes['data-uuid'] = resourceLibraryAssetId; 
          }
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  private unsubscribe() {
    //unsubscripe cleanup when closing component
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  private openQuestionPickerDialog(target: any): void {
    //opens the video-selection-dialog component in a modal, and subscribes to the hide event

    //find the component in questionPackMappings collection
    let qpMapping: IGrapesJsComponentMapping = this.questionPackMappings.find(qpm => qpm.compModelRef === target);
    
    if(!qpMapping){
      //there is no existing mapping, so create a new one and add it to the collection
      qpMapping = { compModelRef: target, questionPack: null};
      this.questionPackMappings.push(qpMapping);
    }
    
    //check if the questionPack exists (or loaded in memory)
    if(!qpMapping.questionPack){
      //questionPack not loaded - so load existing from service, or instantiate new one

      //check if there is an existing coursePageContentQuestionPack id stored in the data-uutid attribute
      if (target.attributes.attributes['data-uuid'] && target.attributes.attributes['data-uuid'] > 0) {
        //there is an existing coursePageContentQuestionPack, so load it from the service here
        //TODO - OR MAY NOT BE RELAVENT IF LOADING DONE UPFRONT (PREFERABLE)
      } else {
        //no existing questionPack, so instantiate a new one
        qpMapping.questionPack = this.coursePageContentQuestionPackService.initialiseCoursePageContentQuestionPack();

        //ok we now need to set the coursePageId and coursePageContentId in the questionPack object
        if(this.page){
          qpMapping.questionPack.coursePageId = this.page.coursePageId;
          qpMapping.questionPack.coursePageContentId = this.page.coursePageContent.coursePageContentId;
        }
      }
    }
    
    
    let initialState: any = {questionPack: qpMapping.questionPack}; //define what mode the media picker will act in ie image, video
    let questionPickerDialogComponentModalRef: BsModalRef = this.modalService.show(QuestionPickerDialogComponent, {initialState: initialState, class: 'modal-lg'});
    
    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)

          //get any data from the component if needed
          let dialogComponent: QuestionPickerDialogComponent  = questionPickerDialogComponentModalRef.content;
          if(dialogComponent){
            qpMapping.questionPack = dialogComponent.questionPack;
          }
          
          //set the data-uuid attribute
          // if (!target.attributes.attributes['data-uuid']) {
          //   //add attribute
//             target.addAttributes({ 'data-uuid': 1 });
             
          // } else {
          //   //update existing attribute
          //   target.attributes.attributes['data-uuid'] = resourceLibraryAssetId; 
          // }
         }// else {
        //    if (target.attributes.attributes['data-uuid']) {
        //      target.setAttributes({'data-uuid': null });
        //      //target.removeAttribute('data-uuid');
        //     //target.attributes.attributes.splice(target.attributes.attributes.findIndex('data-uuid'), 1);
        //    } 
        // }
        target.view.render();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  /// ----- testing helper stuff, to be removed later ----
  cmdGetHTML(): void {
    //alert(this.editor.getHtml());
    //this.extractedHTML = this.editor.getHtml();
    var html = this.editor.getHtml();
    var css = this.editor.getCss();
    this.extractedHTML = `<style>${css}</style>${html}`;
    this.extractedCSS = css;

    // const f = factories.componentFactories[0];
    //             const cmpRef = f.create(this._injector, [], null, this._m);
    //             cmpRef.instance.name = 'B component';
    //             this._container.insert(cmpRef.hostView);

    let factory = this.resolver.resolveComponentFactory(SimpleComponent);

    this.extractSection.clear();
    let componentRef = this.extractSection.createComponent(factory);
    (<SimpleComponent>componentRef.instance).htmlContent = this.extractedHTML;

    // let newNode = document.createElement('div');
    // newNode.id = "placeholder";
    // document.getElementById('extractSection').appendChild(newNode);

    // const ref = factory.create(this._injector, [], newNode);
    // (<SimpleComponent>ref.instance).content = this.extractedHTML;
    // this.app.attachView(ref.hostView);


  }

  cmdGetData(): void {
    //this.extractedData = this.editor.getComponents();
    //console.log(this.extractedData);
    this.editor.store(function(){ console.log('saving done'); });
    this.extractedData = this.forcedStorage['gjs-components'];
    this.extractedHTML = JSON.stringify(this.extractedData);

    
  }

  cmdLoadData(): void {
    this.editor.DomComponents.clear();
    this.forcedStorage['gjs-components'] = null;
    this.forcedStorage['gjs-styles'] = null;
    this.forcedStorage['gjs-css'] = null;
    this.forcedStorage['gjs-html'] = null;
    this.forcedStorage['gjs-components'] = this.extractedData;
    this.editor.load(function(result){ console.log(`loading done` + result); });

    // const getAllComponents = (model, result = []) => {
    //   result.push(model);
    //   model.components().each(mod => getAllComponents(mod, result))
    //   return result;
    // }
    // const all = getAllComponents(this.editor.DomComponents.getWrapper());
    // console.log(all);
   // this.editor.setComponents(this.extractedData);
  }

  // -----------------------------------------------------------
}

export interface IGrapesJsComponentMapping {
  //Helper interface to map a grapesjs questions component with the actual questionPack object
  compModelRef: any,
  questionPack: ICoursePageContentQuestionPack
}
