import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EfilingRecord } from '../../models/efiling.model';

@Component({
  selector: 'app-prefill-step',
  template: `
    <div class="prefill-step-container">
      <h2>Prefill E-Filing Data</h2>
      
      <p class="step-description">
        Configure how you want to prefill the e-filing data for {{ records.length }} selected record(s).
        {{ userType === 'taxAgent' ? 'As a tax agent, you can customize prefill options for batch processing.' : '' }}
      </p>
      
      <div class="prefill-form-container" *ngIf="!isLoading && !prefillComplete">
        <form [formGroup]="prefillForm">
          <h3>Prefill Options</h3>
          
          <div class="form-field">
            <label>Prefill Method:</label>
            <mat-radio-group formControlName="prefillMethod">
              <mat-radio-button *ngFor="let option of prefillOptions" [value]="option.value">
                {{ option.label }}
              </mat-radio-button>
            </mat-radio-group>
          </div>
          
          <div class="form-field">
            <mat-checkbox formControlName="includeAttachments">
              Include attachments
            </mat-checkbox>
          </div>
          
          <div class="form-field">
            <mat-checkbox formControlName="overwriteExisting">
              Overwrite existing data
            </mat-checkbox>
          </div>
          
          <div class="form-actions">
            <button mat-raised-button color="primary" (click)="startPrefill()">
              Start Prefill
            </button>
          </div>
        </form>
      </div>
      
      <div class="prefill-progress" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Prefilling data for {{ records.length }} record(s)...</p>
      </div>
      
      <div class="prefill-complete" *ngIf="prefillComplete">
        <mat-icon color="primary">check_circle</mat-icon>
        <p>Prefill completed successfully for {{ records.length }} record(s).</p>
        
        <div class="records-summary">
          <h3>Records Summary</h3>
          <table class="summary-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Return Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of records">
                <td>{{ record.entityName }}</td>
                <td>{{ record.returnName }}</td>
                <td>
                  <span class="status-badge">Ready for validation</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prefill-step-container {
      padding: 16px;
    }
    
    h2 {
      margin-bottom: 16px;
    }
    
    .step-description {
      margin-bottom: 24px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .prefill-form-container {
      margin-bottom: 24px;
    }
    
    h3 {
      margin-bottom: 16px;
    }
    
    .form-field {
      margin-bottom: 16px;
    }
    
    mat-radio-group {
      display: flex;
      flex-direction: column;
    }
    
    mat-radio-button {
      margin-bottom: 8px;
    }
    
    .form-actions {
      margin-top: 24px;
    }
    
    .prefill-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }
    
    .prefill-progress p {
      margin-top: 16px;
      font-weight: 500;
    }
    
    .prefill-complete {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .prefill-complete mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
    
    .prefill-complete p {
      font-weight: 500;
      margin-bottom: 24px;
    }
    
    .records-summary {
      width: 100%;
      margin-top: 24px;
    }
    
    .summary-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .summary-table th, .summary-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .summary-table th {
      font-weight: 500;
      background-color: #f5f5f5;
    }
    
    .status-badge {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
  `]
})
export class PrefillStepComponent implements OnInit {
  @Input() records: EfilingRecord[] = [];
  @Input() userType: 'taxAgent' | 'corporate' = 'corporate';
  
  @Output() next = new EventEmitter<any>();
  @Output() previous = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  prefillForm: FormGroup;
  prefillOptions = [
    { value: 'auto', label: 'Automatic Prefill' },
    { value: 'manual', label: 'Manual Entry' },
    { value: 'import', label: 'Import from File' }
  ];
  
  isLoading = false;
  prefillComplete = false;
  
  constructor(private fb: FormBuilder) {
    this.prefillForm = this.fb.group({
      prefillMethod: ['auto'],
      includeAttachments: [true],
      overwriteExisting: [false]
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }
  
  startPrefill(): void {
    this.isLoading = true;
    
    // Simulate prefill process
    setTimeout(() => {
      this.isLoading = false;
      this.prefillComplete = true;
    }, 2000);
  }
  
  onNext(): void {
    const prefillData = {
      method: this.prefillForm.get('prefillMethod')?.value,
      includeAttachments: this.prefillForm.get('includeAttachments')?.value,
      overwriteExisting: this.prefillForm.get('overwriteExisting')?.value,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    this.next.emit(prefillData);
  }
  
  onPrevious(): void {
    this.previous.emit();
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}