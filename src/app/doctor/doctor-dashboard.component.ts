import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../services/doctor.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  patients: any[] = [];
  selectedPatient: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private doctorService: DoctorService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.doctorService.getPatients().subscribe({
      next: (response) => {
        this.patients = response.patients;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load patients';
        this.isLoading = false;
      }
    });
  }

  selectPatient(patient: any): void {
    this.selectedPatient = patient;
    // Navigate to chat with this patient
    this.router.navigate(['/chat'], { queryParams: { patientId: patient.patient_id } });
  }

  viewPatientDetails(patient: any): void {
    this.isLoading = true;
    this.doctorService.getPatientDetails(patient.patient_id).subscribe({
      next: (response) => {
        this.selectedPatient = response.patient;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load patient details';
        this.isLoading = false;
      }
    });
  }
}

