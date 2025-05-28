import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EfilingRecord } from '../models/efiling.model';
import { WorkflowState, WorkflowStep, EFILING_WORKFLOW_STEPS } from '../models/workflow.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private workflowState: WorkflowState = {
    currentStepId: 'list',
    steps: [...EFILING_WORKFLOW_STEPS],
    selectedRecords: [],
    automaticMode: false,
    userType: 'corporate',
    workflowData: {}
  };

  private workflowStateSubject = new BehaviorSubject<WorkflowState>(this.workflowState);
  
  constructor() { }

  // Get the current workflow state as an observable
  getWorkflowState(): Observable<WorkflowState> {
    return this.workflowStateSubject.asObservable();
  }

  // Get the current step
  getCurrentStep(): WorkflowStep {
    return this.workflowState.steps.find(step => step.id === this.workflowState.currentStepId)!;
  }

  // Initialize the workflow with selected records
  initializeWorkflow(records: EfilingRecord[], userType: 'taxAgent' | 'corporate', automaticMode: boolean = false): void {
    this.workflowState = {
      currentStepId: 'list',
      steps: [...EFILING_WORKFLOW_STEPS].map(step => ({ ...step, completed: false })),
      selectedRecords: [...records],
      automaticMode,
      userType,
      workflowData: {}
    };
    this.workflowStateSubject.next(this.workflowState);
    
    // If automatic mode is enabled, proceed through the workflow automatically
    if (automaticMode) {
      this.runAutomaticWorkflow();
    }
  }

  // Move to the next step in the workflow
  nextStep(stepData?: any): void {
    const currentStep = this.getCurrentStep();
    const currentIndex = this.workflowState.steps.findIndex(step => step.id === currentStep.id);
    
    // Mark current step as completed and save step data if provided
    this.workflowState.steps[currentIndex].completed = true;
    if (stepData) {
      this.workflowState.workflowData[currentStep.id] = stepData;
    }
    
    // Move to next step if available
    if (currentIndex < this.workflowState.steps.length - 1) {
      this.workflowState.currentStepId = this.workflowState.steps[currentIndex + 1].id;
    }
    
    this.workflowStateSubject.next({ ...this.workflowState });
    
    // If in automatic mode, continue to the next step
    if (this.workflowState.automaticMode) {
      setTimeout(() => this.processCurrentStepAutomatically(), 500);
    }
  }

  // Move to the previous step in the workflow
  previousStep(): void {
    const currentStep = this.getCurrentStep();
    const currentIndex = this.workflowState.steps.findIndex(step => step.id === currentStep.id);
    
    if (currentIndex > 0) {
      this.workflowState.currentStepId = this.workflowState.steps[currentIndex - 1].id;
      this.workflowStateSubject.next({ ...this.workflowState });
    }
  }

  // Go to a specific step
  goToStep(stepId: string): void {
    const stepExists = this.workflowState.steps.some(step => step.id === stepId);
    if (stepExists) {
      this.workflowState.currentStepId = stepId;
      this.workflowStateSubject.next({ ...this.workflowState });
    }
  }

  // Update data for a specific step
  updateStepData(stepId: string, data: any): void {
    this.workflowState.workflowData[stepId] = data;
    this.workflowStateSubject.next({ ...this.workflowState });
  }

  // Get data for a specific step
  getStepData(stepId: string): any {
    return this.workflowState.workflowData[stepId];
  }

  // Toggle automatic mode
  setAutomaticMode(automatic: boolean): void {
    this.workflowState.automaticMode = automatic;
    this.workflowStateSubject.next({ ...this.workflowState });
    
    if (automatic) {
      this.runAutomaticWorkflow();
    }
  }

  // Run the workflow automatically
  private runAutomaticWorkflow(): void {
    this.processCurrentStepAutomatically();
  }

  // Process the current step automatically
  private processCurrentStepAutomatically(): void {
    const currentStep = this.getCurrentStep();
    
    // If the current step is completed or we're at the end, stop
    if (currentStep.completed || currentStep.id === 'confirmation') {
      return;
    }
    
    // Simulate processing for each step
    switch (currentStep.id) {
      case 'list':
        // Simulate list processing
        setTimeout(() => {
          this.nextStep({ selectedItems: this.workflowState.selectedRecords });
        }, 1000);
        break;
        
      case 'prefill':
        // Simulate prefill processing
        setTimeout(() => {
          this.nextStep({ prefilledData: { status: 'completed' } });
        }, 1500);
        break;
        
      case 'validate':
        // Simulate validation processing
        setTimeout(() => {
          this.nextStep({ validationResults: { valid: true, messages: [] } });
        }, 2000);
        break;
        
      case 'file':
        // Simulate filing processing
        setTimeout(() => {
          this.nextStep({ filingResults: { success: true, referenceNumbers: ['REF123456'] } });
        }, 2500);
        break;
        
      case 'confirmation':
        // Final step, nothing to do automatically
        break;
    }
  }

  // Reset the workflow
  resetWorkflow(): void {
    this.workflowState = {
      currentStepId: 'list',
      steps: [...EFILING_WORKFLOW_STEPS].map(step => ({ ...step, completed: false })),
      selectedRecords: [],
      automaticMode: false,
      userType: 'corporate',
      workflowData: {}
    };
    this.workflowStateSubject.next(this.workflowState);
  }
}