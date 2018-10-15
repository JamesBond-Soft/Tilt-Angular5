//------------------------------------------------------------------------------
//                    COMPONENT USED FOR TESTING CONTENTCREATOR 
//------------------------------------------------------------------------------

import { Component, OnInit, ViewChild, ViewContainerRef, Input, AfterViewInit, Compiler, Injector, NgModuleRef, NgModule, ComponentFactoryResolver, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { CommonModule } from '@angular/common';
import { ClarityComponent } from './clarity.component';
import { ResourceLibraryAssetService } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';

@Component({
  selector: 'simple',
  template: `<div #placeholder></div>`
})
export class SimpleComponent implements OnInit, AfterViewInit {
  @Input() htmlContent: string;
  @ViewChild('placeholder', { read: ViewContainerRef }) placeholder: ViewContainerRef;
  clarityList: ClarityComponent[] = [];

  constructor(//private _compiler: Compiler,
    private _injector: Injector,
   // private _m: NgModuleRef<any>,
    private resolver: ComponentFactoryResolver,
    private app: ApplicationRef,
    //private cd: ChangeDetectorRef,
    private resourceLibraryAssetService: ResourceLibraryAssetService) { }

  ngOnInit() {
    this.placeholder.element.nativeElement.innerHTML = this.htmlContent;
    this.processDOMContent();
  }

  ngAfterViewInit() {
  //  this.cd.detectChanges();
  }

  // compileModuleNComponent(): void {
  //   let template = this.content;// '<span>I am {{name}}</span><ng-template #insideJob></ng-template>';

  //   const tmpCmp = Component({ template: template })(class {});
  //   const tmpModule = NgModule({ imports: [CommonModule], declarations: [tmpCmp, ClarityComponent] })(class {
  //   });

  //   this._compiler.compileModuleAndAllComponentsAsync(tmpModule)
  //     .then((factories) => {
  //       const f = factories.componentFactories[0];
  //       const cmpRef = f.create(this._injector, [], null, this._m);
  //       //cmpRef.instance.name = 'B component';
  //       this.placeholder.insert(cmpRef.hostView);
  //     })
  // }

  processDOMContent(): void {
    //process the html content for various special types that are to be replaced with relavent angular component (and data) by dynamically creating the component(s)
    
    this.prepareVideos(); //scan for tilt-suite videos and generate dynamic video component in appropriate place in dom
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

  // attachClarity(): void {
  //   // let factory = this.resolver.resolveComponentFactory(ClarityComponent);

  //   // this.extractSection.clear();
  //   // let componentRef = this.extractSection.createComponent(factory);
  //   // (<SimpleComponent>componentRef.instance).content = this.extractedHTML;
    

  //   //let regexPattern: string = `<div\b\sid="(rla-[^"]*)?"[^>]*>(?:\^RESOURCELIBARYASSET:?)(?<rlaid>.+?)(?:\^)</div>`;
  //   let videoRegex = new RegExp('<div\\b\\sid="(?<elementid>rla-[^"]*)?"[^>]*>(?:\\^RESOURCELIBARYASSET:?)(?<rlaid>.+?)(?:\\^)</div>','g');
  //   //let matches = this.content.match(videoRegex);
  //   //let array1;
    
  //   // while ((array1 = videoRegex.exec(this.content)) !== null) {
  //   //   console.log(`Found ${array1[0]}. Next starts at ${videoRegex.lastIndex}.`);
  //   //   // expected output: "Found foo. Next starts at 9."
  //   //   // expected output: "Found foo. Next starts at 19."
  //   // }

  //   let  match = videoRegex.exec(this.content);
  //   while (match != null) {
  //     if(match['groups'] && match['groups']['elementid'] && match['groups']['rlaid']){
  //       let elementId = match['groups']['elementid'];
  //       let rlaId = match['groups']['rlaid'];

  //       this.processResourceLibraryAssetVideo(elementId, +rlaId);

        
  //     }
      
  //   // matched text: match[0]
  //   // match start: match.index
  //   // capturing group n: match[n]
  //   //console.log(match[0])
  //   match = videoRegex.exec(this.content);
  // }

    // let rlaNodes = document.querySelectorAll('#rla-1124');
    // if(rlaNodes && rlaNodes.length){
    //   for(let i:number =0; i< rlaNodes.length; i++){
    //     let rlaNode = rlaNodes[i]//document.getElementById('rla-1124');
    //     if (rlaNode) {
    //       const ref = factory.create(this._injector, [], rlaNode);
    //       ref.instance.data = "Roger";
    //       ref.instance.url = "https://tilt-test.s3.ap-southeast-2.amazonaws.com/08311746-6581-47a1-9054-c8f43295dc0d.mp4"; 
    //       ref.instance.contentType = "video/mp4";
    //       this.clarityList.push(ref.instance);
    //       this.app.attachView(ref.hostView);
    
    //       //this.clarityList[0].data = "Robert";
    //     }
    //   }
      
    // }
    
    // let newNode = document.createElement('div');
    // newNode.id = "placeholder";
    // document.getElementById('extractSection').appendChild(newNode);

    // const ref = factory.create(this._injector, [], newNode);
    // (<SimpleComponent>ref.instance).content = this.extractedHTML;
    // this.app.attachView(ref.hostView);
  //}

  private processResourceLibraryAssetVideo(domElementId: string, resourceLibraryAssetId: number): void {
    //load the resourceLibraryAsset and create a new component which has the vgPlayer inside it

    //resolve ONE factory for the component - no need to keep re-creating as we only need to resolve once.
    let factory = this.resolver.resolveComponentFactory(ClarityComponent);

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
    

}
