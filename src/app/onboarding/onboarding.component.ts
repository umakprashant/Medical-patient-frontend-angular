import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  onboardingForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  doctors: any[] = [];
  summary: any = null;

  // Step 1 fields
  step1Form: FormGroup;

  // Step 2 fields
  step2Form: FormGroup;
  allergyOptions = ['Penicillin', 'Aspirin', 'Sulfa', 'Latex', 'Shellfish', 'None', 'Other'];
  chronicConditionOptions = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Arthritis', 'None'];
  bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

  // Step 3 fields
  step3Form: FormGroup;
  timeSlotOptions = ['Morning', 'Afternoon', 'Evening'];
  referralSourceOptions = ['Google', 'Friend', 'Doctor Referral', 'Ad', 'Other'];

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.checkOnboardingStatus();
    this.loadDoctors();
    this.loadDraftData();
  }

  initializeForms(): void {
    // Step 1: Personal Information
    this.step1Form = this.fb.group({
      fullName: ['', [Validators.required, this.minWordsValidator(2)]],
      dateOfBirth: ['', [Validators.required, this.ageValidator(18)]],
      gender: ['', Validators.required],
      phoneNumber: ['', [Validators.required, this.phoneValidator]],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', [Validators.required, this.phoneValidator]]
    });

    // Step 2: Medical Information
    this.step2Form = this.fb.group({
      bloodType: ['Unknown', Validators.required],
      currentMedications: ['', this.maxLengthValidator(500)],
      knownAllergies: [[]],
      chronicConditions: [[]],
      previousSurgeries: [''],
      familyMedicalHistory: ['', this.maxLengthValidator(300)]
    });

    // Step 3: Insurance Information
    this.step3Form = this.fb.group({
      insuranceProvider: ['', Validators.required],
      insuranceId: ['', Validators.required],
      policyHolderName: ['', Validators.required],
      preferredDoctorId: ['', Validators.required],
      preferredTimeSlot: ['', Validators.required],
      referralSource: ['', Validators.required],
      additionalNotes: ['', this.maxLengthValidator(200)]
    });
  }

  checkOnboardingStatus(): void {
    this.onboardingService.getStatus().subscribe({
      next: (response) => {
        if (response.onboardingCompleted) {
          this.router.navigate(['/chat']);
        } else {
          this.currentStep = response.currentStep || 1;
        }
      },
      error: (error) => {
        console.error('Error checking onboarding status:', error);
      }
    });
  }

  loadDoctors(): void {
    this.onboardingService.getDoctors().subscribe({
      next: (response) => {
        this.doctors = response.doctors;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  loadDraftData(): void {
    // Load step 1
    this.onboardingService.getStep1().subscribe({
      next: (response) => {
        if (response.data) {
          this.step1Form.patchValue({
            fullName: response.data.full_name,
            dateOfBirth: response.data.date_of_birth,
            gender: response.data.gender,
            phoneNumber: response.data.phone_number,
            emergencyContactName: response.data.emergency_contact_name,
            emergencyContactPhone: response.data.emergency_contact_phone
          });
        }
      }
    });

    // Load step 2
    this.onboardingService.getStep2().subscribe({
      next: (response) => {
        if (response.data) {
          this.step2Form.patchValue({
            bloodType: response.data.blood_type,
            currentMedications: response.data.current_medications || '',
            knownAllergies: response.data.known_allergies || [],
            chronicConditions: response.data.chronic_conditions || [],
            previousSurgeries: response.data.previous_surgeries || '',
            familyMedicalHistory: response.data.family_medical_history || ''
          });
        }
      }
    });

    // Load step 3
    this.onboardingService.getStep3().subscribe({
      next: (response) => {
        if (response.data) {
          this.step3Form.patchValue({
            insuranceProvider: response.data.insurance_provider,
            insuranceId: response.data.insurance_id,
            policyHolderName: response.data.policy_holder_name,
            preferredDoctorId: response.data.preferred_doctor_id,
            preferredTimeSlot: response.data.preferred_time_slot,
            referralSource: response.data.referral_source,
            additionalNotes: response.data.additional_notes || ''
          });
        }
      }
    });
  }

  saveStep(step: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    let saveObservable;
    let formData;

    switch (step) {
      case 1:
        if (this.step1Form.invalid) {
          this.markFormGroupTouched(this.step1Form);
          this.isLoading = false;
          return;
        }
        formData = this.step1Form.value;
        saveObservable = this.onboardingService.saveStep1({
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone
        });
        break;
      case 2:
        if (this.step2Form.invalid) {
          this.markFormGroupTouched(this.step2Form);
          this.isLoading = false;
          return;
        }
        formData = this.step2Form.value;
        saveObservable = this.onboardingService.saveStep2({
          bloodType: formData.bloodType,
          currentMedications: formData.currentMedications,
          knownAllergies: formData.knownAllergies,
          chronicConditions: formData.chronicConditions,
          previousSurgeries: formData.previousSurgeries,
          familyMedicalHistory: formData.familyMedicalHistory
        });
        break;
      case 3:
        if (this.step3Form.invalid) {
          this.markFormGroupTouched(this.step3Form);
          this.isLoading = false;
          return;
        }
        formData = this.step3Form.value;
        saveObservable = this.onboardingService.saveStep3({
          insuranceProvider: formData.insuranceProvider,
          insuranceId: formData.insuranceId,
          policyHolderName: formData.policyHolderName,
          preferredDoctorId: parseInt(formData.preferredDoctorId),
          preferredTimeSlot: formData.preferredTimeSlot,
          referralSource: formData.referralSource,
          additionalNotes: formData.additionalNotes
        });
        break;
      default:
        this.isLoading = false;
        return;
    }

    saveObservable.subscribe({
      next: () => {
        this.isLoading = false;
        if (step < this.totalSteps) {
          this.currentStep = step + 1;
        } else {
          this.loadSummary();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to save. Please try again.';
      }
    });
  }

  loadSummary(): void {
    this.onboardingService.getSummary().subscribe({
      next: (response) => {
        this.summary = response.summary;
        this.currentStep = 4; // Summary step
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load summary.';
      }
    });
  }

  completeOnboarding(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.onboardingService.completeOnboarding().subscribe({
      next: () => {
        this.isLoading = false;
        // Refresh user data
        this.authService.checkAuthStatus();
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to complete onboarding. Please try again.';
      }
    });
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.summary = null;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.summary = null;
    }
  }

  // Custom validators
  minWordsValidator(minWords: number) {
    return (control: any) => {
      if (!control.value) return null;
      const words = control.value.trim().split(/\s+/).filter((w: string) => w.length > 0);
      return words.length >= minWords ? null : { minWords: { required: minWords, actual: words.length } };
    };
  }

  ageValidator(minAge: number) {
    return (control: any) => {
      if (!control.value) return null;
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
    };
  }

  phoneValidator(control: any) {
    if (!control.value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  }

  maxLengthValidator(maxLength: number) {
    return (control: any) => {
      if (!control.value) return null;
      return control.value.length <= maxLength ? null : { maxLength: { required: maxLength, actual: control.value.length } };
    };
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  toggleSelection(array: any[], value: any): void {
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(value);
    }
  }

  isSelected(array: any[], value: any): boolean {
    return array.indexOf(value) > -1;
  }
}
