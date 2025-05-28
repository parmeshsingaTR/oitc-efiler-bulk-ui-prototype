export interface EfilingRecord {
  dataset: string;
  jurisdiction: string;
  entityName: string;
  returnName: string;
  purpose: string;
  status: string;
  noAutoRollforward: boolean;
  startDate: string;
  endDate: string;
  period: string;
  templateVersion: string;
  eFilingStatus?: string;
  prevEfilingAction?: string;
  templateName?: string;
}

export interface ActionMenuItem {
  label: string;
  icon?: string;
  action: string;
  showOnMultiSelect?: boolean;
}

export const MOCK_DATA: EfilingRecord[] = [
  {
    dataset: 'AL_2193 Dataset 05-2025',
    jurisdiction: 'Poland',
    entityName: 'AL_2193',
    returnName: 'AL_2193 Return - 31/05/2025',
    purpose: 'Return',
    status: 'Draft',
    noAutoRollforward: false,
    startDate: '01/05/2025',
    endDate: '31/05/2025',
    period: '01/05/2025 - 31/05/2025',
    templateVersion: 'v 12.309'
  },
  {
    dataset: '100ParallelImports_UK_12Apr',
    jurisdiction: 'United Kingdom',
    entityName: '100ParallelImports_UK_12Apr',
    returnName: '100ParallelImports_UK_12Apr Return - 31/10/2023',
    purpose: 'Return',
    status: 'Draft',
    noAutoRollforward: true,
    startDate: '01/10/2023',
    endDate: '31/10/2023',
    period: '01/10/2023 - 31/10/2023',
    templateVersion: 'v 12.294'
  },
  {
    dataset: '100ParallelImports_UK_26Mar',
    jurisdiction: 'United Kingdom',
    entityName: '100ParallelImports_UK_26Mar',
    returnName: '100ParallelImports_UK_26Mar Return - 31/10/2023',
    purpose: 'Return',
    status: 'Draft',
    noAutoRollforward: true,
    startDate: '01/10/2023',
    endDate: '31/10/2023',
    period: '01/10/2023 - 31/10/2023',
    templateVersion: 'v 12.294'
  },
  {
    dataset: 'Income statement 2020-CVQWDDBGAG',
    jurisdiction: 'United Kingdom',
    entityName: 'EntUK1-CVQWYBEAD',
    returnName: 'EntUK1-CVQWYBEAD Return - 31/12/2020',
    purpose: 'Return',
    status: 'API Return Status-CVQBGPBFFD',
    noAutoRollforward: false,
    startDate: '01/01/2020',
    endDate: '31/12/2020',
    period: '01/01/2020 - 31/12/2020',
    templateVersion: 'v 9.242'
  },
  {
    dataset: 'Income statement 2020-CVQCAPFACI',
    jurisdiction: 'United Kingdom',
    entityName: 'EntUK1-CVQCEEDFHE',
    returnName: 'EntUK1-CVQCEEDFHE Return - 31/12/2020',
    purpose: 'Return',
    status: 'API Return Status-CVQCDDACEDD',
    noAutoRollforward: false,
    startDate: '01/01/2020',
    endDate: '31/12/2020',
    period: '01/01/2020 - 31/12/2020',
    templateVersion: 'v 9.242'
  }
];

export const ACTION_MENU_ITEMS: ActionMenuItem[] = [
  { label: 'Insert Sheets', action: 'insert-sheets', icon: 'note_add' },
  { label: 'E-Filing', action: 'e-filing', icon: 'upload_file' },
  { label: 'Save to Excel', action: 'save-excel', icon: 'save' },
  { label: 'Change Status', action: 'change-status', icon: 'edit' },
  { label: 'Delete', action: 'delete', icon: 'delete' },
  { label: 'Print', action: 'print', icon: 'print' },
  { label: 'Force Upgrade', action: 'force-upgrade', icon: 'upgrade' }
];