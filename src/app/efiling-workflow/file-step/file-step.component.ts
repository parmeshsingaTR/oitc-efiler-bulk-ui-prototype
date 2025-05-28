import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EfilingRecord } from '../../models/efiling.model';

interface FilingResult {
  recordId: string;
  entityName: string;
  returnName: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  referenceNumber?: string;
  errorMessage?: string;
}

@Component({
  selector: 'app-file-step',
  template: `
    <div class="file-step-container">
      <h2>E-File Returns</h2>
      
      <p class="step-description">
        Submit e-filing for {{ records.length }} validated record(s).
        {{ userType === 'taxAgent' ? 'As a tax agent, you are filing on behalf of your clients.' : '' }}
      </p>
      
      <div class="filing-form-container" *ngIf="!isLoading && !filingComplete">
        <form [formGroup]="filingForm">
          <h3>Filing Options</h3>
          
          <div class="form-field">
            <label>Filing Method:</label>
            <mat-radio-group formControlName="filingMethod">
              <mat-radio-button value="electronic">Electronic Filing</mat-radio-button>
              <mat-radio-button value="paper">Paper Filing</mat-radio-button>
            </mat-radio-group>
          </div>
          
          <div class="form-field">
            <mat-checkbox formControlName="confirmAccuracy" color="primary">
              I confirm that the information provided is accurate and complete to the best of my knowledge.
            </mat-checkbox>
          </div>
          
          <div class="form-field">
            <mat-checkbox formControlName="confirmAuthorization" color="primary">
              I am authorized to submit this filing on behalf of the entity.
            </mat-checkbox>
          </div>
          
          <div class="form-actions">
            <button 
              mat-raised-button 
              color="primary" 
              [disabled]="filingForm.invalid"
              (click)="startFiling()">
              Submit E-Filing
            </button>
          </div>
        </form>
      </div>
      
      <div class="filing-progress" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Processing e-filing for {{ records.length }} record(s)...</p>
        
        <div class="progress-table-container">
          <table class="filing-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Return Name</th>
                <th>Status</th>
                <th>Reference Number</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let result of filingResults" 
                  [ngClass]="{'success-row': result.status === 'success', 'error-row': result.status === 'failed'}">
                <td>{{ result.entityName }}</td>
                <td>{{ result.returnName }}</td>
                <td>
                  <div [ngClass]="'status-indicator ' + result.status">
                    <mat-spinner diameter="20" *ngIf="result.status === 'processing'"></mat-spinner>
                    <mat-icon *ngIf="result.status === 'pending'">hourglass_empty</mat-icon>
                    <mat-icon *ngIf="result.status === 'success'">check_circle</mat-icon>
                    <mat-icon *ngIf="result.status === 'failed'">error</mat-icon>
                    <span>{{ result.status | titlecase }}</span>
                  </div>
                </td>
                <td>
                  {{ result.referenceNumber || '-' }}
                  <span class="error-message" *ngIf="result.status === 'failed'">
                    {{ result.errorMessage }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="filing-results" *ngIf="filingComplete">
        <div [ngClass]="'filing-summary ' + (allSuccessful() ? 'success' : '')">
          <mat-icon>{{ allSuccessful() ? 'check_circle' : 'warning' }}</mat-icon>
          <span>{{ allSuccessful() ? 'All filings submitted successfully' : 'Some filings failed' }}</span>
        </div>
        
        <div class="results-table-container">
          <table class="filing-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Return Name</th>
                <th>Status</th>
                <th>Reference Number</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let result of filingResults" 
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
                <td>
                  {{ result.referenceNumber || '-' }}
                  <span class="error-message" *ngIf="result.status === 'failed'">
                    {{ result.errorMessage }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="filing-actions">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="onNext()">
            Continue to Confirmation
          </button>
          <button 
            mat-button 
            *ngIf="hasFailures()"
            (click)="retryFailed()">
            Retry Failed
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .file-step-container {
      padding: 16px;
    }
    
    h2 {
      margin-bottom: 16px;
    }
    
    .step-description {
      margin-bottom: 24px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .filing-form-container {
      margin-bottom: 24px;
    }
    
    h3 {
      margin-bottom: 16px;
    }
    
    .form-field {
      margin-bottom: 16px;
    }
    
    .form-actions {
      margin-top: 24px;
    }
    
    .filing-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    }
    
    .filing-progress p {
      margin: 16px 0;
      font-weight: 500;
    }
    
    .progress-table-container {
      width: 100%;
      margin-top: 24px;
    }
    
    .filing-summary {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 4px;
      background-color: #f5f5f5;
    }
    
    .filing-summary.success {
      background-color: #e8f5e9;
    }
    
    .filing-summary mat-icon {
      margin-right: 8px;
      color: #4caf50;
    }
    
    .filing-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .filing-table th, .filing-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .filing-table th {
      font-weight: 500;
      background-color: #f5f5f5;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
    }
    
    .status-indicator mat-icon, .status-indicator mat-spinner {
      margin-right: 8px;
    }
    
    .status-indicator.success {
      color: #4caf50;
    }
    
    .status-indicator.failed {
      color: #f44336;
    }
    
    .status-indicator.processing {
      color: #2196f3;
    }
    
    .status-indicator.pending {
      color: #9e9e9e;
    }
    
    .error-message {
      display: block;
      color: #f44336;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .success-row {
      background-color: rgba(76, 175, 80, 0.05);
    }
    
    .error-row {
      background-color: rgba(244, 67, 54, 0.05);
    }
    
    .filing-actions {
      display: flex;
      justify-content: flex-start;
      gap: 8px;
      margin-top: 24px;
    }
  `]
})
export class FileStepComponent implements OnInit {
  @Input() records: EfilingRecord[] = [];
  @Input() validationData: any;
  @Input() userType: 'taxAgent' | 'corporate' = 'corporate';
  
  @Output() next = new EventEmitter<any>();
  @Output() previous = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  filingForm: FormGroup;
  isLoading = false;
  filingComplete = false;
  filingResults: FilingResult[] = [];
  
  constructor(private fb: FormBuilder) {
    this.filingForm = this.fb.group({
      filingMethod: ['electronic', Validators.required],
      confirmAccuracy: [false, Validators.requiredTrue],
      confirmAuthorization: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // Initialize filing results
    this.filingResults = this.records.map(record => ({
      recordId: record.dataset,
      entityName: record.entityName,
      returnName: record.returnName,
      status: 'pending'
    }));
  }
  
  startFiling(): void {
    if (this.filingForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    // Process each record with a slight delay between them
    this.filingResults.forEach((result, index) => {
      setTimeout(() => {
        // Update status to processing
        this.filingResults[index].status = 'processing';
        
        // Simulate filing process with random success/failure
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate for demo
          
          if (success) {
            this.filingResults[index].status = 'success';
            this.filingResults[index].referenceNumber = this.generateReferenceNumber();
          } else {
            this.filingResults[index].status = 'failed';
            this.filingResults[index].errorMessage = 'Connection timeout. Please try again.';
          }
          
          // Check if all records are processed
          if (index === this.filingResults.length - 1) {
            this.isLoading = false;
            this.filingComplete = true;
          }
        }, 1500);
      }, index * 1000);
    });
  }
  
  generateReferenceNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  allSuccessful(): boolean {
    return this.filingComplete && 
           this.filingResults.every(result => result.status === 'success');
  }
  
  hasFailures(): boolean {
    return this.filingResults.some(result => result.status === 'failed');
  }
  
  retryFailed(): void {
    const failedIndices = this.filingResults
      .map((result, index) => result.status === 'failed' ? index : -1)
      .filter(index => index !== -1);
    
    failedIndices.forEach(index => {
      this.filingResults[index].status = 'pending';
    });
    
    // Restart filing only for failed records
    this.startFiling();
  }
  
  onNext(): void {
    const filingData = {
      results: this.filingResults,
      timestamp: new Date().toISOString(),
      allSuccessful: this.allSuccessful()
    };
    
    this.next.emit(filingData);
  }
  
  onPrevious(): void {
    this.previous.emit();
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}