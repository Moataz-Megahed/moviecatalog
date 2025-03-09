import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role-redirect',
  templateUrl: './role-redirect.component.html',
  styleUrls: ['./role-redirect.component.css']
})
export class RoleRedirectComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      // Check if user is admin
      if (this.authService.isAdmin()) {
        console.log('User is admin, redirecting to admin dashboard');
        // Redirect to admin dashboard
        this.router.navigate(['/admin/movies']);
      } else {
        console.log('User is not admin, redirecting to user dashboard');
        // Redirect to user dashboard
        this.router.navigate(['/user/dashboard']);
      }
    } else {
      console.log('User is not logged in, redirecting to home page');
      // Redirect to home page for non-authenticated users
      this.router.navigate(['/home']);
    }
  }
} 