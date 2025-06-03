import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EfilingManagementComponent } from './efiling-management/efiling-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'efiling-management', component: EfilingManagementComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
