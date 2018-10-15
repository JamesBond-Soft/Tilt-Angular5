import { Component, OnInit, Input } from '@angular/core';
import { IResourceLibraryFileProperties } from '../../resource-library-asset';

@Component({
  selector: 'resource-file-details',
  templateUrl: './resource-file-details.component.html',
  styleUrls: ['./resource-file-details.component.scss']
})
export class ResourceFileDetailsComponent implements OnInit {
  @Input() fileProperties: IResourceLibraryFileProperties;
  
  constructor() { }

  ngOnInit() {
  }

}
