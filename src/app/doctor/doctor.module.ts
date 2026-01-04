import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { DoctorService } from '../services/doctor.service';

const routes: Routes = [
  {
    path: '',
    component: DoctorDashboardComponent
  }
];

@NgModule({
  declarations: [
    DoctorDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [DoctorService]
})
export class DoctorModule { }

