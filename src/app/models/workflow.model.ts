export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  requiresUserIntervention: boolean;
  completed: boolean;
  data?: any;
}

export interface WorkflowState {
  currentStepId: string;
  steps: WorkflowStep[];
  selectedRecords: any[];
  automaticMode: boolean;
  userType: 'taxAgent' | 'corporate';
  workflowData: {
    [key: string]: any;
  };
}

export const EFILING_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'list',
    name: 'List',
    order: 1,
    requiresUserIntervention: true,
    completed: false
  },
  {
    id: 'prefill',
    name: 'Prefill',
    order: 2,
    requiresUserIntervention: true,
    completed: false
  },
  {
    id: 'validate',
    name: 'Validation',
    order: 3,
    requiresUserIntervention: true,
    completed: false
  },
  {
    id: 'file',
    name: 'File',
    order: 4,
    requiresUserIntervention: true,
    completed: false
  },
  {
    id: 'confirmation',
    name: 'Confirmation',
    order: 5,
    requiresUserIntervention: true,
    completed: false
  }
];