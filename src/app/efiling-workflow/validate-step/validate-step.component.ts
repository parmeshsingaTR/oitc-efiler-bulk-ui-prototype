import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EfilingRecord } from '../../models/efiling.model';

interface ValidationResult {
  recordId: string;
  entityName: string;
  returnName: string;
  status: 'valid' | 'warning' | 'error';
  messages: ValidationMessage[];
}

interface ValidationMessage {
  type: 'info' | 'warning' | 'error';
  code: string;
  message: string;
}

@Component({
  selector: 'app-validate-step',
  template: `
    <div class="validate-step-container">
      <h2>Validate E-Filing Data</h2>
      
      <p class="step-description">
        Validating e-filing data for {{ records.length }} selected record(s).
        {{ userType === 'taxAgent' ? 'As a tax agent, you can review and fix validation issues before proceeding.' : '' }}
      </p>
      
      <div class="validation-progress" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Validating data for {{ records.length }} record(s)...</p>
      </div>
      
      <div class="validation-results" *ngIf="validationComplete">
        <div [ngClass]="'validation-summary ' + (allValid() ? 'success' : '')">
          <mat-icon>{{ allValid() ? 'check_circle' : 'warning' }}</mat-icon>
          <span>{{ allValid() ? 'All records passed validation' : 'Some records have validation issues' }}</span>
        </div>
        
        <table class="validation-table">
          <thead>
            <tr>
              <th>Entity Name</th>
              <th>Return Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let result of validationResults" 
                [ngClass]="{'error-row': result.status === 'error', 'warning-row': result.status === 'warning'}">
              <td>{{ result.entityName }}</td>
              <td>{{ result.returnName }}</td>
              <td>
                <div [ngClass]="'status-indicator ' + result.status">
                  <mat-icon *ngIf="result.status === 'valid'">check_circle</mat-icon>
                  <mat-icon *ngIf="result.status === 'warning'">warning</mat-icon>
                  <mat-icon *ngIf="result.status === 'error'">error</mat-icon>
                  <span>{{ result.status | titlecase }}</span>
                </div>
              </td>
              <td>
                <button 
                  mat-button 
                  color="primary" 
                  *ngIf="result.status !== 'valid'"
                  (click)="fixValidationIssue(result)">
                  Fix Issues
                </button>
                <button 
                  mat-button 
                  *ngIf="result.status !== 'valid'"
                  [matMenuTriggerFor]="messageMenu">
                  View Details
                </button>
                <mat-menu #messageMenu="matMenu">
                  <div class="message-menu-content">
                    <h4>Validation Messages</h4>
                    <div *ngFor="let msg of result.messages" 
                         [ngClass]="'validation-message ' + msg.type">
                      <strong>{{ msg.code }}:</strong> {{ msg.message }}
                    </div>
                  </div>
                </mat-menu>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="validation-actions" *ngIf="validationComplete">
          <button 
            mat-raised-button 
            color="primary" 
            [disabled]="hasErrors()"
            (click)="onNext()">
            Continue to Filing
          </button>
          <button 
            mat-button 
            (click)="startValidation()">
            Revalidate
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .validate-step-container {
      padding: 16px;
    }
    
    h2 {
      margin-bottom: 16px;
    }
    
    .step-description {
      margin-bottom: 24px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .validation-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }
    
    .validation-progress p {
      margin-top: 16px;
      font-weight: 500;
    }
    
    .validation-summary {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 4px;
      background-color: #f5f5f5;
    }
    
    .validation-summary.success {
      background-color: #e8f5e9;
    }
    
    .validation-summary mat-icon {
      margin-right: 8px;
      color: #4caf50;
    }
    
    .validation-table {
      width: 100%;
      margin-bottom: 24px;
      border-collapse: collapse;
    }
    
    .validation-table th, .validation-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .validation-table th {
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
    
    .status-indicator.valid {
      color: #4caf50;
    }
    
    .status-indicator.warning {
      color: #ff9800;
    }
    
    .status-indicator.error {
      color: #f44336;
    }
    
    .error-row {
      background-color: rgba(244, 67, 54, 0.05);
    }
    
    .warning-row {
      background-color: rgba(255, 152, 0, 0.05);
    }
    
    .validation-actions {
      display: flex;
      justify-content: flex-start;
      gap: 8px;
      margin-top: 24px;
    }
    
    .message-menu-content {
      padding: 16px;
      min-width: 300px;
      max-width: 400px;
    }
    
    .validation-message {
      padding: 8px;
      margin-bottom: 8px;
      border-radius: 4px;
    }
    
    .validation-message.warning {
      background-color: rgba(255, 152, 0, 0.1);
    }
    
    .validation-message.error {
      background-color: rgba(244, 67, 54, 0.1);
    }
    
    .validation-message.info {
      background-color: rgba(33, 150, 243, 0.1);
    }
  `]
})
export class ValidateStepComponent implements OnInit {
  @Input() records: EfilingRecord[] = [];
  @Input() prefillData: any;
  @Input() userType: 'taxAgent' | 'corporate' = 'corporate';
  
  @Output() next = new EventEmitter<any>();
  @Output() previous = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  isLoading = false;
  validationComplete = false;
  validationResults: ValidationResult[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // Start validation automatically
    this.startValidation();
  }
  
  startValidation(): void {
    this.isLoading = true;
    this.validationComplete = false;
    this.validationResults = [];
    
    // Simulate validation process
    setTimeout(() => {
      this.validationResults = this.records.map(record => {
        // Generate random validation status for demo purposes
        const statuses: ('valid' | 'warning' | 'error')[] = ['valid', 'warning', 'error'];
        const randomStatus = statuses[Math.floor(Math.random() * 3)];
        
        const messages: ValidationMessage[] = [];
        
        if (randomStatus === 'warning') {
          messages.push({
            type: 'warning',
            code: 'W001',
            message: 'Optional field missing: Description'
          });
        } else if (randomStatus === 'error') {
          messages.push({
            type: 'error',
            code: 'E001',
            message: 'Required field missing: Tax Registration Number'
          });
        }
        
        return {
          recordId: record.dataset,
          entityName: record.entityName,
          returnName: record.returnName,
          status: randomStatus,
          messages
        };
      });
      
      this.isLoading = false;
      this.validationComplete = true;
    }, 2500);
  }
  
  fixValidationIssue(result: ValidationResult): void {
    // Simulate fixing validation issues
    const index = this.validationResults.findIndex(r => r.recordId === result.recordId);
    if (index !== -1) {
      this.validationResults[index].status = 'valid';
      this.validationResults[index].messages = [];
    }
  }
  
  allValid(): boolean {
    return this.validationComplete && 
           this.validationResults.every(result => result.status === 'valid');
  }
  
  hasErrors(): boolean {
    return this.validationResults.some(result => result.status === 'error');
  }
  
  onNext(): void {
    const validationData = {
      results: this.validationResults,
      timestamp: new Date().toISOString(),
      allValid: this.allValid()
    };
    
    this.next.emit(validationData);
  }
  
  onPrevious(): void {
    this.previous.emit();
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}