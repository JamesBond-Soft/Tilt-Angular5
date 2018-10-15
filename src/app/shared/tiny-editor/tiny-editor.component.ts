import { Component, OnInit, AfterViewInit, EventEmitter, OnDestroy, Input, Output, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import 'tinymce';
import 'tinymce/themes/modern';

import 'tinymce/plugins/table';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
//import 'tinymce/plugins/media';
//import 'tinymce/plugins/imagetools';
//import 'tinymce/plugins/preview';
import 'tinymce/plugins/code';
//import 'tinymce/plugins/tiltmedia'
//import 'tinymce/plugins/template'
import { ReplaySubject } from 'rxjs/ReplaySubject';



declare var tinymce: any;

@Component({
  selector: 'app-tiny-editor',
  template: `<textarea id="{{elementId}}"></textarea>`,
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  encapsulation: ViewEncapsulation.None
  //templateUrl: './tiny-editor.component.html',
  //styleUrls: ['./tiny-editor.component.scss']
})
export class TinyEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() elementId: String;
  @Output() onEditorContentChange = new EventEmitter();
  @Output() onVideoSelected = new EventEmitter();

  editor;
  contentSubject: ReplaySubject<string>;

  constructor(private location: Location) { 
    this.contentSubject = new ReplaySubject(1); //special subscription/subject used to handle the setContent being called
  }

  ngOnInit(){
   
    
  }

  ngAfterViewInit() {
    tinymce.init({
      selector: '#' + this.elementId,
      plugins: ['link', 'table', 'image', 'code'],//, 'tiltmedia', 'template'],
      skin_url: this.location.prepareExternalUrl('/assets/skins/lightgray'),
      content_css: this.location.prepareExternalUrl('/assets/skins/lightgray/assistant-styles.css'),
      theme: 'modern',
      menubar: false,
      statusbar: true,
      elementpath: false,
      toolbar: 'undo redo | styleselect | bold italic | table | link image custom-media | code ',
      resize: 'true',
      image_list: [
        {title: 'My image 1', value: 'https://www.tinymce.com/my1.gif'},
        {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
      ],
      image_dimensions: false,
      image_class_list: [
        {title: 'Responsive', value: 'img-responsive'},
        {title: 'Bootstrap Responsive', value: 'img-fluid'}
      ],
      table_default_styles: {
        width: '100%'
      },
      // templates: [
      //   {title: 'Some title 1', description: 'Some desc 1', content: 'My content'},
      //   {title: 'Some title 2', description: 'Some desc 2', url: 'http://localhost:4300/courses/module/1/10'},
      //   {title: 'Some title 3', description: 'Some desc 2', content: '<p>Name: {$name}, StaffID: {$staffid}</p>'},
      //   {title: 'Some title 4', description: 'Some desc 4', content: '<div class="mceTmpl" data-name="{$me}">{$me}</div>'}
      // ],
      // template_replace_values: {
      //   name: "Jack Black",
      //   staffid: "991234",
      //   me: 'Robert'
      // },
      extended_valid_elements: "+@[data-options]",
      //forced_root_block: 'div',
      setup: editor => {
        this.editor = editor;
        editor.on('keyup change', () => {
          const content = editor.getContent();
          this.onEditorContentChange.emit(content);
        });

        function toTimeHtml(date) {
          return '<time datetime="' + date.toString() + '">' + date.toDateString() + '</time>';
        }

        function insertDate() {
          var html = toTimeHtml(new Date());
          editor.insertContent(html);
        }

        editor.addButton('custom-media', {
          icon: 'media',
          //image: 'http://p.yusukekamiyamane.com/icons/search/fugue/icons/calendar-blue.png',
          tooltip: "Insert Video",
          onclick: () => {
            this.boohoo();
          }
        });

        editor.on('init', () => {
          this.contentSubject.subscribe(result => {
            this.editor.setContent(result, {format: 'raw'});
          });
        });

        
      }
    });
  }

  boohoo(): void {
   // alert('huzaah!');
   // this.editor.insertContent(`<video class="resource-library video-placeholder">Video</video>`);
   this.onVideoSelected.emit(true);
  }

  ngOnDestroy() {
    this.contentSubject.unsubscribe(); //unsubscripe to the content subscription
    tinymce.remove(this.editor);
  }

  public setContent(content: string): void {
    //broadcasts the new content so the editor can grab it when it's ready - which then calls the this.editor.setContent function
    this.contentSubject.next(content);
  }

}
