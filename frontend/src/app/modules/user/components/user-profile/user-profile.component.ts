import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  profileError = '';
  profileSuccess = false;
  passwordError = '';
  passwordSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  // Convenience getters for easy access to form fields
  get pf() { return this.profileForm.controls; }
  get pwf() { return this.passwordForm.controls; }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.profileError = '';
    this.profileSuccess = false;

    this.userService.updateProfile({
      username: this.pf['username'].value,
      email: this.pf['email'].value
    }).subscribe({
      next: (user) => {
        this.loading = false;
        this.profileSuccess = true;
        // Update the current user in the auth service
        this.authService.updateCurrentUser(user);
      },
      error: (error) => {
        this.loading = false;
        this.profileError = error.error?.message || 'Failed to update profile';
        console.error('Error updating profile', error);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    this.passwordError = '';
    this.passwordSuccess = false;

    this.userService.changePassword(
      this.pwf['currentPassword'].value,
      this.pwf['newPassword'].value
    ).subscribe({
      next: () => {
        this.loading = false;
        this.passwordSuccess = true;
        this.passwordForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.passwordError = error.error?.message || 'Failed to change password';
        console.error('Error changing password', error);
      }
    });
  }
} 