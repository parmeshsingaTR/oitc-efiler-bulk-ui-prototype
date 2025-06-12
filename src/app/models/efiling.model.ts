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
  efileProgress?: string;
  efileStatus?: string;
  prevEfilingAction?: string;
  templateName?: string;
}

export interface ActionMenuItem {
  label: string;
  icon?: string;
  action: string;
  showOnMultiSelect?: boolean;
}

// Function to generate mock data
function generateMockData(count: number): EfilingRecord[] {
  const mockData: EfilingRecord[] = [];
  
  // Base records
  const baseRecords = [
    {
      dataset: 'AL_2193 Dataset 05-2025',
      jurisdiction: 'Australia',
      entityName: 'AL_2193',
      returnName: 'AL_2193 Return - 31/05/2025',
      purpose: 'Return',
      status: 'Draft',
      noAutoRollforward: false,
      startDate: '01/05/2025',
      endDate: '31/05/2025',
      period: '01/05/2025 - 31/05/2025',
      templateVersion: 'v 12.309',
      efileProgress: '75%',
      efileStatus: 'Processing'
    },
    {
      dataset: '100ParallelImports_UK_12Apr',
      jurisdiction: 'Australia',
      entityName: '100ParallelImports_UK_12Apr',
      returnName: '100ParallelImports_UK_12Apr Return - 31/10/2023',
      purpose: 'Return',
      status: 'Draft',
      noAutoRollforward: true,
      startDate: '01/10/2023',
      endDate: '31/10/2023',
      period: '01/10/2023 - 31/10/2023',
      templateVersion: 'v 12.294',
      efileProgress: '50%',
      efileStatus: 'Pending'
    },
    {
      dataset: '100ParallelImports_UK_26Mar',
      jurisdiction: 'Australia',
      entityName: '100ParallelImports_UK_26Mar',
      returnName: '100ParallelImports_UK_26Mar Return - 31/10/2023',
      purpose: 'Return',
      status: 'Draft',
      noAutoRollforward: true,
      startDate: '01/10/2023',
      endDate: '31/10/2023',
      period: '01/10/2023 - 31/10/2023',
      templateVersion: 'v 12.294',
      efileProgress: '25%',
      efileStatus: 'Initiated'
    },
    {
      dataset: 'Income statement 2020-CVQWDDBGAG',
      jurisdiction: 'Australia',
      entityName: 'EntUK1-CVQWYBEAD',
      returnName: 'EntUK1-CVQWYBEAD Return - 31/12/2020',
      purpose: 'Return',
      status: 'API Return Status-CVQBGPBFFD',
      noAutoRollforward: false,
      startDate: '01/01/2020',
      endDate: '31/12/2020',
      period: '01/01/2020 - 31/12/2020',
      templateVersion: 'v 9.242',
      efileProgress: '90%',
      efileStatus: 'Validating'
    },
    {
      dataset: 'Income statement 2020-CVQCAPFACI',
      jurisdiction: 'Australia',
      entityName: 'EntUK1-CVQCEEDFHE',
      returnName: 'EntUK1-CVQCEEDFHE Return - 31/12/2020',
      purpose: 'Return',
      status: 'API Return Status-CVQCDDACEDD',
      noAutoRollforward: false,
      startDate: '01/01/2020',
      endDate: '31/12/2020',
      period: '01/01/2020 - 31/12/2020',
      templateVersion: 'v 9.242',
      efileProgress: '100%',
      efileStatus: 'Submitted'
    }
  ];
  
  // Add base records to the mock data
  mockData.push(...baseRecords);
  
  // Jurisdictions
  const jurisdictions = ['Australia', 'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Japan', 'Singapore'];
  
  // Status options
  const statusOptions = ['Draft', 'In Progress', 'Submitted', 'Approved', 'Rejected'];
  
  // Progress options
  const progressOptions = ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '95%'];
  
  // Efile status options
  const efileStatusOptions = ['Not Sent', 'Initiated', 'Processing', 'Pending', 'Validating', 'Submitted', 'Validation Failed'];
  
  // Generate additional records
  for (let i = 0; i < count - baseRecords.length; i++) {
    const year = 2020 + Math.floor(i / 12) % 6; // Years from 2020 to 2025
    const month = (i % 12) + 1; // Months from 1 to 12
    const startDate = `01/${month.toString().padStart(2, '0')}/${year}`;
    const endDate = `${new Date(year, month, 0).getDate()}/${month.toString().padStart(2, '0')}/${year}`;
    const period = `${startDate} - ${endDate}`;
    
    const entityId = `Entity${i + 1}`;
    const datasetId = `Dataset_${entityId}_${month}_${year}`;
    
    const jurisdiction = jurisdictions[i % jurisdictions.length];
    const status = statusOptions[i % statusOptions.length];
    const progress = progressOptions[i % progressOptions.length];
    const efileStatus = efileStatusOptions[i % efileStatusOptions.length];
    
    mockData.push({
      dataset: datasetId,
      jurisdiction: jurisdiction,
      entityName: entityId,
      returnName: `${entityId} Return - ${endDate}`,
      purpose: 'Return',
      status: status,
      noAutoRollforward: i % 2 === 0, // Alternate between true and false
      startDate: startDate,
      endDate: endDate,
      period: period,
      templateVersion: `v ${12 - (i % 4)}.${200 + i}`,
      efileProgress: progress,
      efileStatus: efileStatus
    });
  }
  
  return mockData;
}

export const MOCK_DATA: EfilingRecord[] = generateMockData(100); // Generate 100 records (5 base + 95 additional)

export const ACTION_MENU_ITEMS: ActionMenuItem[] = [
  { label: 'Insert Sheets', action: 'insert-sheets', icon: 'note_add' },
  { label: 'E-Filing', action: 'e-filing', icon: 'upload_file' },
  { label: 'Save to Excel', action: 'save-excel', icon: 'save' },
  { label: 'Change Status', action: 'change-status', icon: 'edit' },
  { label: 'Delete', action: 'delete', icon: 'delete' },
  { label: 'Print', action: 'print', icon: 'print' },
  { label: 'Force Upgrade', action: 'force-upgrade', icon: 'upgrade' }
];

export const ACTION_MENU_ITEMS_PROGRESS: ActionMenuItem[] = [
  { label: 'E-Filing', action: 'e-filing', icon: 'upload_file' },
];
