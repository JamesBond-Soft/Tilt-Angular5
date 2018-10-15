import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-settings-edit',
  templateUrl: './user-settings-edit.component.html',
  styleUrls: ['./user-settings-edit.component.css']
})
export class UserSettingsEditComponent implements OnInit {
  pageTitle: string = "User Settings";
  constructor() { }

  ngOnInit() {
  }

}
