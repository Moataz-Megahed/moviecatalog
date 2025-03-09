import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RoleRedirectComponent } from './components/role-redirect/role-redirect.component';

const routes: Routes = [
  { 
    path: '', 
    component: RoleRedirectComponent
  },
  { 
    path: 'home', 
    component: HomeComponent
  },
  { 
    path: 'movies', 
    loadChildren: () => import('./modules/movies/movies.module').then(m => m.MoviesModule) 
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'user', 
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard]
  },
  { 
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  { 
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full'
  },
  { 
    path: '**', 
    redirectTo: '/' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 