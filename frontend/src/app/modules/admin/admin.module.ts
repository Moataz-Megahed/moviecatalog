import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AdminGuard } from '../../guards/admin.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { MovieManagementComponent } from './components/movie-management/movie-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'movies',
    component: MovieManagementComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  declarations: [
    AdminDashboardComponent,
    MovieManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { } 