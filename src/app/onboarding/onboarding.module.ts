import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { OnboardingComponent } from './onboarding.component';
import { OnboardingService } from '../services/onboarding.service';

const routes: Routes = [
  {
    path: '',
    component: OnboardingComponent
  }
];

@NgModule({
  declarations: [
    OnboardingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [OnboardingService]
})
export class OnboardingModule { }

