import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserMoviesComponent } from './components/user-movies/user-movies.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';

import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'movies',
    component: UserMoviesComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [
    UserProfileComponent,
    UserMoviesComponent,
    UserDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { } 