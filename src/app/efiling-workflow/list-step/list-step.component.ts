import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { EfilingRecord } from '../../models/efiling.model';

@Component({
  selector: 'app-list-step',
  template: `
    <div class="list-step-container">
      <h2>Select Records for E-Filing</h2>
      
      <p class="step-description">
        Select the records you want to include in this e-filing submission.
        {{ userType === 'taxAgent' ? 'As a tax agent, you can select multiple records for batch processing.' : '' }}
      </p>
      
      <div class="records-table-container">
        <table class="records-table">
          <thead>
            <tr>
              <th>
                <mat-checkbox 
                  (change)="$event ? masterToggle() : null"
                  [checked]="selection.hasValue() && isAllSelected()"
                  [indeterminate]="selection.hasValue() && !isAllSelected()">
                </mat-checkbox>
              </th>
              <th>Dataset</th>
              <th>Jurisdiction</th>
              <th>Entity Name</th>
              <th>Return Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of records" (click)="selection.toggle(row)">
              <td>
                <mat-checkbox
                  (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)">
                </mat-checkbox>
              </td>
              <td>{{ row.dataset }}</td>
              <td>{{ row.jurisdiction }}</td>
              <td>{{ row.entityName }}</td>
              <td>{{ row.returnName }}</td>
              <td>{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="selection-summary">
        <span>{{ selection.selected.length }} of {{ records.length }} records selected</span>
      </div>
    </div>
  `,
  styles: [`
    .list-step-container {
      padding: 16px;
    }
    
    h2 {
      margin-bottom: 16px;
    }
    
    .step-description {
      margin-bottom: 24px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .records-table-container {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 16px;
    }
    
    .records-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .records-table th, .records-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .records-table th {
      font-weight: 500;
      background-color: #f5f5f5;
    }
    
    .records-table tr:hover {
      background-color: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }
    
    .selection-summary {
      margin-top: 16px;
      font-weight: 500;
    }
  `]
})
export class ListStepComponent implements OnInit {
  @Input() records: EfilingRecord[] = [];
  @Input() userType: 'taxAgent' | 'corporate' = 'corporate';
  
  @Output() next = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  
  selection = new SelectionModel<EfilingRecord>(true, []);
  
  constructor() { }

  ngOnInit(): void {
    // Pre-select all records by default
    this.selection = new SelectionModel<EfilingRecord>(true, [...this.records]);
  }
  
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.records.length;
    return numSelected === numRows;
  }
  
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.records.forEach(row => this.selection.select(row));
    }
  }
  
  checkboxLabel(row?: EfilingRecord): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }
  
  onNext(): void {
    this.next.emit({
      selectedRecords: this.selection.selected
    });
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}