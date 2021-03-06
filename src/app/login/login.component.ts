import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../_services/auth.service';
import {TokenStorageService} from '../_services/token-storage.service';
import {ProfileApiService} from '../_services/api/profile-api.service';
import {NavigationService} from '../_services/navigation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  showPassword = false;
  form: any = {};
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private apiServiceProfile: ProfileApiService,
    private navigationService: NavigationService
  ) { }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
      if (!this.tokenStorage.getUser().company) {
        this.apiServiceProfile.getCompany().subscribe( res => {
          this.tokenStorage.saveCompany(res);
        });

      }
      this.navigationService.open('/profile');
    }
  }

  onSubmit() {
    this.authService.login(this.form).subscribe(
      data => {
        if (data.blocked) {
          this.errorMessage = 'You are blocked! For more information contact support.';
          this.isLoginFailed = true;
          return;
        }
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.reloadPage();
      },
      err => {
        this.errorMessage = 'Username or password is incorrect';
        this.isLoginFailed = true;
      }
    );
  }

  reloadPage() {
    window.location.reload();
  }

  showOrHidePassword() {
    this.showPassword = !this.showPassword;
  }
}
