import { Component, OnInit } from '@angular/core';
import {ProfileApiService} from '../../_services/api/profile-api.service';
import {NavigationService} from '../../_services/navigation.service';
import {TokenStorageService} from '../../_services/token-storage.service';
import {User} from '../../model/user.model';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-become-driver',
  templateUrl: './become-driver.component.html',
  styleUrls: ['./become-driver.component.css']
})
export class BecomeDriverComponent implements OnInit {

  isDriverCheckbox: false;
  user: User;

  constructor(
    private apiServiceProfile: ProfileApiService,
    private navigation: NavigationService,
    private tokenStorage: TokenStorageService,
    private appComponent: AppComponent
  ) { }

  ngOnInit() {
    this.tokenStorage.saveSelectedMenuSidebar('become-driver');

    if (this.tokenStorage.getUser().driver) {
      this.navigation.open('profile');
      return;
    }
  }

  onSubmit() {
    if (this.isDriverCheckbox) {
      this.apiServiceProfile.becomeDriver().subscribe( res => {
        this.user = this.tokenStorage.getUser();
        this.user.driver = true;
        this.tokenStorage.saveUser(this.user);
        this.appComponent.becomeDriver();
        this.navigation.open('profile');
      });
    }
  }
}
