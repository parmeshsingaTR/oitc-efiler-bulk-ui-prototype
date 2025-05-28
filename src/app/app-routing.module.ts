import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EfilingManagementComponent } from './efiling-management/efiling-management.component';

const routes: Routes = [
  { path: '', redirectTo: 'efiling-management', pathMatch: 'full' },
  { path: 'efiling-management', component: EfilingManagementComponent },
  { path: '**', redirectTo: 'efiling-management' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
