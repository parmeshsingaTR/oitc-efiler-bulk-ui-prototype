import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EfilingRecord } from '../models/efiling.model';

export interface EfilingWizardData {
  records: EfilingRecord[];
  entityType: string;
  isBulk: boolean;
}

@Component({
  selector: 'app-efiling-wizard',
  templateUrl: './efiling-wizard.component.html',
  styleUrls: ['./efiling-wizard.component.scss']
})
export class EfilingWizardComponent implements OnInit {
  // Current step in the wizard (1-based)
  currentStep = 1;
  
  // Total number of steps
  totalSteps = 3;
  
  // Step titles
  stepTitles = ['Filings', 'Actions', 'Status'];
  
  // Selected filing type
  selectedFilingType = 'Business Activity Statement';
  
  // Selected action
  selectedAction = 'List'; // Default to Manual (List)
  
  // E-Filing status
  efilingStatus = 'Not Sent';
  
  // Previous action
  previousAction = '-';
  
  // Success message
  successMessage = '';
  
  // Flag to indicate if filing is complete
  filingComplete = false;
  
  // Flag for auto-complete pending stages
  autoCompletePendingStages = false;

  constructor(
    public dialogRef: MatDialogRef<EfilingWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EfilingWizardData,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize with data from the selected records
    if (this.data && this.data.records && this.data.records.length > 0) {
      const record = this.data.records[0];
      this.efilingStatus = record.efileStatus || 'Not Sent';
      this.previousAction = record.prevEfilingAction || '-';
    }
  }

  // Go to the next step
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      
      // If we're on the last step, simulate filing completion
      if (this.currentStep === this.totalSteps) {
        this.completeEfiling();
      }
    }
  }
  
  // Update autoCompletePendingStages based on selectedAction
  onActionChange(): void {
    this.autoCompletePendingStages = (this.selectedAction === 'AutoComplete');
  }

  // Go to the previous step
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Complete the e-filing process
  completeEfiling(): void {
    this.filingComplete = true;
    this.successMessage = 'Your filing has been sent to the E-filing Manager successfully.';
    // Keep the original status from the selected record
  }

  // Refresh the status
  refreshStatus(): void {
    // In a real app, this would make an API call to get the latest status
    // For now, we'll just simulate a status update
    this.efilingStatus = 'Not Sent';
  }

  // Close the dialog
  closeDialog(completed: boolean = false): void {
    this.dialogRef.close({
      completed: completed,
      status: this.efilingStatus
    });
    
    // If completed and we're on the last step, navigate to the e-file-updates page
    if (completed && this.currentStep === this.totalSteps) {
      if (this.autoCompletePendingStages) {
        this.router.navigate(['/returns/e-file-updates'], { queryParams: { completion: 'auto_complete' } });
      } else {
        this.router.navigate(['/returns/e-file-updates']);
      }
    }
  }
}
