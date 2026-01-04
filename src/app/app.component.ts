import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Assignment App';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Check if user is already logged in
    this.authService.checkAuthStatus();
    
    // Redirect based on role after login
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        const user = this.authService.getCurrentUser();
        if (user) {
          if (user.role === 'doctor') {
            // Doctors go to dashboard
            // Navigation handled by routing
          } else if (user.role === 'patient') {
            // Patients go to onboarding if not completed, else chat
            // Navigation handled by routing
          }
        }
      }
    });
  }
}

