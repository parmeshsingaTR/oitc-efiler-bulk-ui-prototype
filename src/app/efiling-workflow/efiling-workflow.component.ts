import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { WorkflowService } from '../services/workflow.service';
import { WorkflowState, WorkflowStep } from '../models/workflow.model';
import { EfilingRecord } from '../models/efiling.model';

@Component({
  selector: 'app-efiling-workflow',
  template: `
    <div class="efiling-workflow-container">
      <mat-horizontal-stepper [linear]="true" #stepper>
        <mat-step *ngFor="let step of workflowState.steps" [completed]="step.completed" [editable]="!workflowState.automaticMode">
          <ng-template matStepLabel>{{ step.name }}</ng-template>
          
          <!-- List Step -->
          <app-list-step 
            *ngIf="currentStep.id === 'list'"
            [records]="workflowState.selectedRecords"
            [userType]="workflowState.userType"
            (next)="onNextStep($event)"
            (cancel)="onCancel()">
          </app-list-step>
          
          <!-- Prefill Step -->
          <app-prefill-step 
            *ngIf="currentStep.id === 'prefill'"
            [records]="workflowState.selectedRecords"
            [userType]="workflowState.userType"
            (next)="onNextStep($event)"
            (previous)="onPreviousStep()"
            (cancel)="onCancel()">
          </app-prefill-step>
          
          <!-- Validate Step -->
          <app-validate-step 
            *ngIf="currentStep.id === 'validate'"
            [records]="workflowState.selectedRecords"
            [prefillData]="getPrefillData()"
            [userType]="workflowState.userType"
            (next)="onNextStep($event)"
            (previous)="onPreviousStep()"
            (cancel)="onCancel()">
          </app-validate-step>
          
          <!-- File Step -->
          <app-file-step 
            *ngIf="currentStep.id === 'file'"
            [records]="workflowState.selectedRecords"
            [validationData]="getValidationData()"
            [userType]="workflowState.userType"
            (next)="onNextStep($event)"
            (previous)="onPreviousStep()"
            (cancel)="onCancel()">
          </app-file-step>
          
          <!-- Confirmation Step -->
          <app-confirmation-step 
            *ngIf="currentStep.id === 'confirmation'"
            [filingResults]="getFilingData()"
            [userType]="workflowState.userType"
            (complete)="onComplete($event)"
            (previous)="onPreviousStep()"
            (cancel)="onCancel()">
          </app-confirmation-step>
        </mat-step>
      </mat-horizontal-stepper>
      
      <div class="workflow-controls">
        <mat-checkbox 
          [checked]="workflowState.automaticMode"
          (change)="setAutomaticMode($event.checked)"
          [disabled]="currentStep.id !== 'list'">
          Run automatically
        </mat-checkbox>
        
        <div class="workflow-buttons">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-button (click)="onPreviousStep()" [disabled]="isFirstStep() || workflowState.automaticMode">Previous</button>
          <button mat-raised-button color="primary" (click)="onNextStep()" [disabled]="workflowState.automaticMode">
            {{ isLastStep() ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .efiling-workflow-container {
      display: flex;
      flex-direction: column;
      min-height: 500px;
      max-height: 80vh;
      width: 800px;
      overflow: hidden;
    }
    
    ::ng-deep .mat-horizontal-stepper-header-container {
      margin-bottom: 20px;
    }
    
    ::ng-deep .mat-step-header.mat-step-header-selected {
      background-color: rgba(25, 118, 210, 0.05);
    }
    
    ::ng-deep .mat-step-icon-selected {
      background-color: #1976d2;
    }
    
    ::ng-deep .mat-step-icon-state-done {
      background-color: #4caf50;
    }
    
    mat-horizontal-stepper {
      flex: 1;
      overflow-y: auto;
      padding: 0 20px;
    }
    
    .workflow-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background-color: #fafafa;
    }
    
    .workflow-buttons {
      display: flex;
      gap: 8px;
    }
  `]
})
export class EfilingWorkflowComponent implements OnInit, OnDestroy {
  workflowState!: WorkflowState;
  currentStep!: WorkflowStep;
  private subscription: Subscription = new Subscription();

  constructor(
    private workflowService: WorkflowService,
    private dialogRef: MatDialogRef<EfilingWorkflowComponent>
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.workflowService.getWorkflowState().subscribe(state => {
        this.workflowState = state;
        this.currentStep = this.workflowService.getCurrentStep();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getPrefillData(): any {
    return this.workflowService.getStepData('prefill');
  }
  
  getValidationData(): any {
    return this.workflowService.getStepData('validate');
  }
  
  getFilingData(): any {
    return this.workflowService.getStepData('file');
  }

  onNextStep(data?: any): void {
    this.workflowService.nextStep(data);
  }

  onPreviousStep(): void {
    this.workflowService.previousStep();
  }

  onCancel(): void {
    this.workflowService.resetWorkflow();
    this.dialogRef.close();
  }

  onComplete(result: any): void {
    this.dialogRef.close(result);
  }

  setAutomaticMode(automatic: boolean): void {
    this.workflowService.setAutomaticMode(automatic);
  }

  isLastStep(): boolean {
    return this.currentStep.id === 'confirmation';
  }

  isFirstStep(): boolean {
    return this.currentStep.id === 'list';
  }
}