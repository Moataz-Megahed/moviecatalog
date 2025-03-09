import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // Check if route is restricted by role
      if (route.data['roles'] && !route.data['roles'].includes(currentUser.role)) {
        // Role not authorized, redirect to home page
        this.router.navigate(['/']);
        return false;
      }

      // Authorized, return true
      return true;
    }

    // Not logged in, redirect to login page with return url
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
} 