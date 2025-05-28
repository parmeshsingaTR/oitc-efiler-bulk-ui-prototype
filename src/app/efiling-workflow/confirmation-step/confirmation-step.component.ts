import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface FilingResult {
  recordId: string;
  entityName: string;
  returnName: string;
  status: string;
  referenceNumber?: string;
}

interface FilingResults {
  results: FilingResult[];
  timestamp: string;
  allSuccessful: boolean;
}

@Component({
  selector: 'app-confirmation-step',
  template: `
    <div class="confirmation-step-container">
      <h2>E-Filing Confirmation</h2>
      
      <div class="confirmation-content">
        <div class="confirmation-header">
          <mat-icon color="primary">check_circle</mat-icon>
          <h3>E-Filing Submission Complete</h3>
          <p>Your e-filing submission has been processed. Please save this confirmation for your records.</p>
        </div>
        
        <div class="confirmation-details">
          <div class="detail-row">
            <span class="label">Submission Date:</span>
            <span class="value">{{ getSubmissionDate() }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Submitted By:</span>
            <span class="value">{{ userType === 'taxAgent' ? 'Tax Agent' : 'Corporate User' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Total Records:</span>
            <span class="value">{{ getTotalRecords() }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Successful:</span>
            <span class="value">{{ getSuccessfulCount() }}</span>
          </div>
          <div class="detail-row" *ngIf="!isAllSuccessful()">
            <span class="label">Failed:</span>
            <span class="value">{{ getFailedCount() }}</span>
          </div>
        </div>
        
        <div class="results-table-container">
          <h4>Filing Results</h4>
          <table class="confirmation-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Return Name</th>
                <th>Status</th>
                <th>Reference Number</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let result of getResults()" 
                  [ngClass]="{'success-row': result.status === 'success', 'error-row': result.status === 'failed'}">
                <td>{{ result.entityName }}</td>
                <td>{{ result.returnName }}</td>
                <td>
                  <div [ngClass]="'status-indicator ' + result.status">
                    <mat-icon *ngIf="result.status === 'success'">check_circle</mat-icon>
                    <mat-icon *ngIf="result.status === 'failed'">error</mat-icon>
                    <span>{{ result.status | titlecase }}</span>
                  </div>
                </td>
                <td>{{ result.referenceNumber || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="next-steps">
          <h4>Next Steps</h4>
          <ul>
            <li>Save or print this confirmation for your records.</li>
            <li>You will receive an email confirmation at your registered email address.</li>
            <li>Track the status of your filing in the E-Filing Management dashboard.</li>
            <li *ngIf="!isAllSuccessful()">For failed submissions, please review the errors and resubmit.</li>
          </ul>
        </div>
        
        <div class="confirmation-actions">
          <button mat-raised-button color="primary" (click)="downloadReceipt()">
            <mat-icon>download</mat-icon>
            Download Receipt
          </button>
          <button mat-button (click)="printConfirmation()">
            <mat-icon>print</mat-icon>
            Print
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-step-container {
      padding: 16px;
    }
    
    h2 {
      margin-bottom: 16px;
    }
    
    .confirmation-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .confirmation-header mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #4caf50;
      margin-bottom: 16px;
    }
    
    .confirmation-header h3 {
      margin-bottom: 8px;
      font-size: 20px;
    }
    
    .confirmation-header p {
      color: rgba(0, 0, 0, 0.6);
    }
    
    .confirmation-details {
      background-color: #f5f5f5;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 24px;
    }
    
    .detail-row {
      display: flex;
      margin-bottom: 8px;
    }
    
    .detail-row:last-child {
      margin-bottom: 0;
    }
    
    .detail-row .label {
      flex: 1;
      font-weight: 500;
    }
    
    .detail-row .value {
      flex: 2;
    }
    
    .results-table-container {
      margin-bottom: 24px;
    }
    
    h4 {
      margin-bottom: 16px;
    }
    
    .confirmation-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .confirmation-table th, .confirmation-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .confirmation-table th {
      font-weight: 500;
      background-color: #f5f5f5;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
    }
    
    .status-indicator mat-icon {
      margin-right: 8px;
    }
    
    .status-indicator.success {
      color: #4caf50;
    }
    
    .status-indicator.failed {
      color: #f44336;
    }
    
    .success-row {
      background-color: rgba(76, 175, 80, 0.05);
    }
    
    .error-row {
      background-color: rgba(244, 67, 54, 0.05);
    }
    
    .next-steps {
      margin-bottom: 32px;
    }
    
    .next-steps ul {
      padding-left: 24px;
    }
    
    .next-steps li {
      margin-bottom: 8px;
    }
    
    .confirmation-actions {
      display: flex;
      justify-content: flex-start;
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class ConfirmationStepComponent implements OnInit {
  @Input() filingResults: FilingResults | null = null;
  @Input() userType: 'taxAgent' | 'corporate' = 'corporate';
  
  @Output() complete = new EventEmitter<any>();
  @Output() previous = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  constructor() { }

  ngOnInit(): void {
  }
  
  getSubmissionDate(): string {
    if (this.filingResults && this.filingResults.timestamp) {
      return new Date(this.filingResults.timestamp).toLocaleString();
    }
    return new Date().toLocaleString();
  }
  
  getTotalRecords(): number {
    if (this.filingResults && this.filingResults.results) {
      return this.filingResults.results.length;
    }
    return 0;
  }
  
  getSuccessfulCount(): number {
    if (this.filingResults && this.filingResults.results) {
      return this.filingResults.results.filter(r => r.status === 'success').length;
    }
    return 0;
  }
  
  getFailedCount(): number {
    if (this.filingResults && this.filingResults.results) {
      return this.filingResults.results.filter(r => r.status === 'failed').length;
    }
    return 0;
  }
  
  isAllSuccessful(): boolean {
    return this.filingResults?.allSuccessful || false;
  }
  
  getResults(): FilingResult[] {
    if (this.filingResults && this.filingResults.results) {
      return this.filingResults.results;
    }
    return [];
  }
  
  downloadReceipt(): void {
    // Simulate downloading a receipt
    alert('Receipt download started...');
  }
  
  printConfirmation(): void {
    // Simulate printing confirmation
    window.print();
  }
  
  onComplete(): void {
    this.complete.emit({
      completed: true,
      timestamp: new Date().toISOString()
    });
  }
  
  onPrevious(): void {
    this.previous.emit();
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}