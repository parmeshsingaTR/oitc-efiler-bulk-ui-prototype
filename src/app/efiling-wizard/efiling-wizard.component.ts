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
  selectedAction = 'AutoComplete'; // Default to AutoComplete
  
  // Flag for auto-complete pending stages (set to true by default since AutoComplete is selected)
  autoCompletePendingStages = true;

  // E-Filing status
  efilingStatus = 'Not Sent';
  
  // Previous action
  previousAction = '-';
  
  // Success message
  successMessage = '';
  
  // Flag to indicate if filing is complete
  filingComplete = false;
  
  
  // Context window name
  contextWindowName = '';
  
  // Flag to show context window box (only when opened from efiling-management route)
  showContextWindow = false;

  constructor(
    public dialogRef: MatDialogRef<EfilingWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EfilingWizardData,
    private router: Router
  ) { }
  
  /**
   * Gets the current date and time formatted as a string
   * @returns Formatted date and time string
   */
  getCurrentDateTime(): string {
    return new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  ngOnInit(): void {
    // Initialize context window name with current date time
    this.contextWindowName = `Efile Progress on ${this.getCurrentDateTime()}`;
    
    // Check if the dialog was opened from the efiling-management route
    this.checkCurrentRoute();
    
    // Initialize with data from the selected records
    if (this.data && this.data.records && this.data.records.length > 0) {
      const record = this.data.records[0];
      this.efilingStatus = record.efileStatus || 'Not Sent';
      this.previousAction = record.prevEfilingAction || '-';
      
      // Set the selected action based on the current e-filing status
      this.setSelectedActionBasedOnStatus();
    }
  }
  
  /**
   * Sets the selected action based on the current e-filing status
   */
  setSelectedActionBasedOnStatus(): void {
    // Get the next action based on the current status
    const nextAction = this.getNextAction();
    
    // Set the selected action to AutoComplete by default
    this.selectedAction = 'AutoComplete';
    
    // Set autoCompletePendingStages to true since AutoComplete is selected
    this.autoCompletePendingStages = true;
    
    console.log('Current status:', this.efilingStatus);
    console.log('Selected action:', this.selectedAction);
  }
  
  /**
   * Gets the next action based on the current e-filing status
   * @returns The next action to perform
   */
  getNextAction(): string {
    // Define the mapping from status to next action
    const statusToAction = {
      'Not Sent': 'List',
      'Listings In Progress': 'List',
      'Listings Received': 'Prefill',
      'Prefill Inprogress': 'Prefill',
      'Prefill Received': 'Validation',
      'Validation InProgress': 'Validation',
      'Validation Completed': 'Efile',
      'Efile Inprogress': 'Efile',
      'Efile Completed': 'Efile'
    };
    
    // Return the next action or default to 'List'
    return statusToAction[this.efilingStatus] || 'List';
  }
  
  /**
   * Gets the label for the next action based on the current e-filing status
   * @returns The label for the next action
   */
  getNextActionLabel(): string {
    return this.getNextAction();
  }
  
  /**
   * Checks if the current route is /efiling-management to determine if context window should be shown
   */
  checkCurrentRoute(): void {
    // Get the current URL
    const currentUrl = this.router.url;
    
    // Show context window only if opened from efiling-management route
    this.showContextWindow = currentUrl.includes('/efiling-management');
    
    console.log('Current route:', currentUrl);
    console.log('Show context window:', this.showContextWindow);
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
    // Check if the selected action is 'AutoComplete'
    this.autoCompletePendingStages = (this.selectedAction === 'AutoComplete');
    
    console.log('Selected action changed to:', this.selectedAction);
    console.log('Auto complete pending stages:', this.autoCompletePendingStages);
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
