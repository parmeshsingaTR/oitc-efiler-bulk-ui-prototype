import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { EfilingRecord, MOCK_DATA, ACTION_MENU_ITEMS, ACTION_MENU_ITEMS_PROGRESS } from '../models/efiling.model';
import { formatDate } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { EfilingWizardComponent } from '../efiling-wizard/efiling-wizard.component';

/**
 * Interface for record groups
 */
interface RecordGroup {
  name: string;
  records: EfilingRecord[];
  expanded: boolean;
  selected?: boolean;
}

/**
 * Interface for filter options
 */
interface FilterOption {
  value: string;
  selected: boolean;
}

/**
 * Interface for column filter
 */
interface ColumnFilter {
  column: string;
  options: FilterOption[];
  searchText: string;
  sortDirection: 'asc' | 'desc' | null;
  activeTab: 'value' | 'condition';
}

@Component({
  selector: 'app-efiling-progress',
  templateUrl: './efiling-progress.component.html',
  styleUrls: ['./efiling-progress.component.scss']
})
export class EfilingProgressComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  
  inProgressRecords: EfilingRecord[] = [];
  completedRecords: EfilingRecord[] = [];
  
  // Store original unfiltered data
  originalInProgressRecords: EfilingRecord[] = [];
  originalRecordGroups: RecordGroup[] = [];
  
  // Record groups for the e-file updates page
  recordGroups: RecordGroup[] = [];
  
  // Map to store progress values for each record
  progressValues: Map<string, number> = new Map();
  
  // Map to track failed records
  failedRecords: Map<string, boolean> = new Map();
  
  // Map to track current stage for each record
  currentStages: Map<string, number> = new Map();
  
  // Action menu items
  actionMenuItems = ACTION_MENU_ITEMS_PROGRESS;
  
  // Selected row for actions
  selectedRow: EfilingRecord | null = null;
  
  // Pagination variables
  currentPage: number = 1;
  pageSize: number = 100;
  totalPages: number = 1;
  
  // Filter variables
  activeFilter: ColumnFilter | null = null;
  filterPosition = { top: '0', left: '0' };
  showFilter = false;
  
  // Element reference for filter container
  @ViewChild('filterContainer') filterContainer!: ElementRef;
  
  // Array of all possible stages
  efilingStages: string[] = [
    'Not Sent',
    'Listings In Progress',
    'Listings Received',
    'Prefill Inprogress',
    'Prefill Received',
    'Validation InProgress',
    'Validation Completed',
    'Efile Inprogress',
    'Efile Completed'
  ];
  
  // Flag to determine if we should auto-complete all stages quickly
  autoComplete: boolean = false;
  
  // Subscription to manage the interval observable
  private progressSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Check for completion query parameter
    this.route.queryParams.subscribe(params => {
      this.autoComplete = params['completion'] === 'auto_complete';
    });
    
    // Close filter when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
    
    // Filter mock data into in-progress and completed records
    this.inProgressRecords = MOCK_DATA.filter(record => 
      record.efileProgress !== '100%' && record.efileStatus !== 'Submitted');
    
    this.completedRecords = MOCK_DATA.filter(record => 
      record.efileProgress === '100%' && record.efileStatus === 'Submitted');
    
    // Store original data for filtering
    this.originalInProgressRecords = [...this.inProgressRecords];
      
    // Create record groups for the e-file updates page
    this.createRecordGroups();
    
    // Store original record groups for filtering
    this.originalRecordGroups = JSON.parse(JSON.stringify(this.recordGroups));
    
    // Initialize progress values, failed status, and stages for each in-progress record
    this.inProgressRecords.forEach(record => {
      // Use dataset as a unique identifier for each record
      this.progressValues.set(record.dataset, 0);
      
      // Randomly mark some records to fail (approximately 40% chance)
      this.failedRecords.set(record.dataset, Math.random() < 0.4);
      
      // Set initial stage to "Not Sent" (index 0)
      this.currentStages.set(record.dataset, 0);
      record.efileStatus = this.efilingStages[0];
    });
    
    // Start the progress animation
    this.startProgressAnimation();
  }
  
  /**
   * Creates record groups for the e-file updates page
   */
  createRecordGroups(): void {
    // Clear existing groups
    this.recordGroups = [];
    
    // Get the current date and time for the first group
    const currentDateTime = this.getCurrentDateTime();
    
    // Create the first group with the first 3 records
    if (this.inProgressRecords.length > 0) {
      const firstGroupRecords = this.inProgressRecords.slice(0, 3);
      this.recordGroups.push({
        name: `Efile Progress on ${currentDateTime}`,
        records: firstGroupRecords,
        expanded: true
      });
    }
    
    // Calculate how many groups we need for the remaining records (approximately 20 records per group)
    const recordsPerGroup = 20;
    const remainingRecords = this.inProgressRecords.slice(3);
    const totalGroups = Math.ceil(remainingRecords.length / recordsPerGroup);
    
    // Create groups for the remaining records
    for (let i = 0; i < totalGroups; i++) {
      // Calculate the start and end index for this group
      const startIndex = i * recordsPerGroup;
      const endIndex = Math.min(startIndex + recordsPerGroup, remainingRecords.length);
      
      // Get the records for this group
      const groupRecords = remainingRecords.slice(startIndex, endIndex);
      
      // Calculate a date time for this group (each group is 1 hour before the previous)
      const groupDateTime = this.getDateTimeHoursBefore(i + 1); // +1 because the first group is at current time
      
      // Create the group
      this.recordGroups.push({
        name: `Efile Progress on ${groupDateTime}`,
        records: groupRecords,
        expanded: false // Only expand the first group by default
      });
    }
  }
  
  /**
   * Gets a date and time string for a specified number of hours before the current time
   * @param hours Number of hours to subtract from current time
   * @returns Formatted date and time string
   */
  getDateTimeHoursBefore(hours: number): string {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return formatDate(date, 'dd/MM/yyyy HH:mm:ss', 'en-US');
  }
  
  /**
   * Gets a date and time string for 1 hour before the current time
   * @returns Formatted date and time string
   */
  getDateTimeOneHourBefore(): string {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    return formatDate(date, 'dd/MM/yyyy HH:mm:ss', 'en-US');
  }
  
  /**
   * Gets the current date and time formatted as a string
   * @returns Formatted date and time string
   */
  getCurrentDateTime(): string {
    return formatDate(new Date(), 'dd/MM/yyyy HH:mm:ss', 'en-US');
  }
  
  /**
   * Toggles the selection of all records in a group
   * @param group The group to toggle selection for
   * @param checked Whether the checkbox is checked
   */
  toggleGroupSelection(group: RecordGroup, checked: boolean): void {
    group.selected = checked;
    
    // In a real application, you would also update the selection state of all records in the group
    // For example, if you have a selectedRecords array:
    // if (checked) {
    //   this.selectedRecords.push(...group.records.filter(r => this.isRecordCompleted(r)));
    // } else {
    //   group.records.forEach(record => {
    //     if (this.isRecordCompleted(record)) {
    //       const index = this.selectedRecords.findIndex(r => r.dataset === record.dataset);
    //       if (index !== -1) {
    //         this.selectedRecords.splice(index, 1);
    //       }
    //     }
    //   });
    // }
    
    console.log(`Group "${group.name}" selection toggled to ${checked}`);
  }
  
  /**
   * Checks if a record has completed its progress (successfully or with failure)
   * @param record The record to check
   * @returns True if the record has completed (successfully or with failure), false otherwise
   */
  isRecordCompleted(record: EfilingRecord): boolean {
    // Check if the progress is 100% or if the status indicates a failure
    const progress = this.getProgressValue(record.efileProgress, record.dataset);
    const isFailedStatus = record.efileStatus === 'Validation Failed';
    
    // Don't show checkbox for records with "Efile Completed" status
    if (record.efileStatus === 'Efile Completed') {
      return false;
    }
    
    // We want to include both successful and failed records, but only if they're completed
    return progress === 100 || isFailedStatus;
  }
  
  /**
   * Checks if a group has any completed records
   * @param records The records in the group
   * @returns True if the group has at least one completed record, false otherwise
   */
  hasCompletedRecords(records: EfilingRecord[]): boolean {
    return records.some(record => this.isRecordCompleted(record));
  }
  
  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    
    // Remove document click listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }
  
  /**
   * Handles document click to close filter dropdown when clicking outside
   * @param event Click event
   */
  onDocumentClick(event: MouseEvent): void {
    // If filter is shown and click is outside filter container and not on a filter icon
    if (
      this.showFilter && 
      this.filterContainer && 
      !this.filterContainer.nativeElement.contains(event.target) &&
      !(event.target as HTMLElement).closest('.filter-icon')
    ) {
      this.showFilter = false;
    }
  }
  
  /**
   * Opens the filter dropdown for a specific column
   * @param column The column to filter
   * @param event The click event
   */
  openFilter(column: string, event: MouseEvent): void {
    event.stopPropagation(); // Prevent document click from immediately closing the filter
    
    // Get unique values for the column
    const uniqueValues = this.getUniqueColumnValues(column);
    
    // Create filter options from unique values
    const filterOptions: FilterOption[] = uniqueValues.map(value => ({
      value,
      selected: true
    }));
    
    // Create or update the active filter
    this.activeFilter = {
      column,
      options: filterOptions,
      searchText: '',
      sortDirection: null,
      activeTab: 'value'
    };
    
    // Calculate position for the filter dropdown
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.filterPosition = {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`
    };
    
    // Show the filter
    this.showFilter = true;
  }
  
  /**
   * Gets unique values for a specific column
   * @param column The column to get unique values for
   * @returns Array of unique values
   */
  getUniqueColumnValues(column: string): string[] {
    // Get all records (from groups and individual records)
    const allRecords: EfilingRecord[] = [
      ...this.recordGroups.reduce((acc, group) => [...acc, ...group.records], [] as EfilingRecord[]),
      ...this.inProgressRecords
    ];
    
    // Get unique values for the column
    const uniqueValues = new Set<string>();
    allRecords.forEach(record => {
      if (record[column] !== undefined && record[column] !== null) {
        uniqueValues.add(record[column].toString());
      }
    });
    
    return Array.from(uniqueValues);
  }
  
  /**
   * Checks if all filter options are selected
   * @returns True if all options are selected, false otherwise
   */
  areAllOptionsSelected(): boolean {
    if (!this.activeFilter) return false;
    return this.activeFilter.options.every(o => o.selected);
  }
  
  /**
   * Checks if some (but not all) filter options are selected
   * @returns True if some options are selected, false otherwise
   */
  areSomeOptionsSelected(): boolean {
    if (!this.activeFilter) return false;
    return this.activeFilter.options.some(o => o.selected) && !this.activeFilter.options.every(o => o.selected);
  }
  
  /**
   * Toggles the selection of all filter options
   * @param selected Whether to select or deselect all options
   */
  toggleSelectAll(selected: boolean): void {
    if (!this.activeFilter) return;
    
    this.activeFilter.options.forEach(option => {
      option.selected = selected;
    });
  }
  
  /**
   * Filters the options based on search text
   * @returns Filtered options
   */
  getFilteredOptions(): FilterOption[] {
    if (!this.activeFilter) return [];
    
    if (!this.activeFilter.searchText) {
      return this.activeFilter.options;
    }
    
    const searchText = this.activeFilter.searchText.toLowerCase();
    return this.activeFilter.options.filter(option => 
      option.value.toLowerCase().includes(searchText)
    );
  }
  
  /**
   * Applies the current filter
   */
  applyFilter(): void {
    if (!this.activeFilter) return;
    
    const column = this.activeFilter.column;
    const selectedValues = this.activeFilter.options
      .filter(o => o.selected)
      .map(o => o.value);
    
    console.log('Applying filter for column:', column);
    console.log('Selected options:', selectedValues);
    
    // If all options are selected, no need to filter
    if (selectedValues.length === this.activeFilter.options.length) {
      // Reset to original data
      this.resetToOriginalData();
    } else {
      // Filter in-progress records
      this.inProgressRecords = this.originalInProgressRecords.filter(record => 
        selectedValues.includes(record[column]?.toString() || '')
      );
      
      // Recreate record groups with filtered data
      this.createRecordGroups();
      
      // Apply sorting if specified
      if (this.activeFilter.sortDirection) {
        this.sortData(column, this.activeFilter.sortDirection);
      }
    }
    
    // Close the filter dropdown
    this.showFilter = false;
  }
  
  /**
   * Sorts the data based on the specified column and direction
   * @param column The column to sort by
   * @param direction The sort direction ('asc' or 'desc')
   */
  sortData(column: string, direction: 'asc' | 'desc'): void {
    // Sort in-progress records
    this.inProgressRecords.sort((a, b) => {
      const valueA = a[column]?.toString() || '';
      const valueB = b[column]?.toString() || '';
      
      if (direction === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
    
    // Sort records within each group
    this.recordGroups.forEach(group => {
      group.records.sort((a, b) => {
        const valueA = a[column]?.toString() || '';
        const valueB = b[column]?.toString() || '';
        
        if (direction === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
    });
  }
  
  /**
   * Resets the data to its original state
   */
  resetToOriginalData(): void {
    // Reset in-progress records
    this.inProgressRecords = [...this.originalInProgressRecords];
    
    // Reset record groups
    this.recordGroups = JSON.parse(JSON.stringify(this.originalRecordGroups));
  }
  
  /**
   * Clears the current filter
   */
  clearFilter(): void {
    if (!this.activeFilter) return;
    
    // Reset all options to selected
    this.toggleSelectAll(true);
    this.activeFilter.searchText = '';
    this.activeFilter.sortDirection = null;
    
    // Reset to original data to show all records
    this.resetToOriginalData();
    
    console.log('Clearing filter for column:', this.activeFilter.column);
    
    // Close the filter dropdown
    this.showFilter = false;
  }
  
  /**
   * Cancels the current filter operation
   */
  cancelFilter(): void {
    // Simply close the filter dropdown without applying changes
    this.showFilter = false;
  }
  
  /**
   * Sets the sort direction for the current column
   * @param direction The sort direction ('asc' or 'desc')
   */
  setSortDirection(direction: 'asc' | 'desc'): void {
    if (!this.activeFilter) return;
    
    this.activeFilter.sortDirection = direction;
    
    // In a real application, you would sort the data based on the direction
    console.log('Sorting column:', this.activeFilter.column, 'Direction:', direction);
  }
  
  /**
   * Sets the active tab for the filter
   * @param tab The tab to set active ('value' or 'condition')
   */
  setActiveTab(tab: 'value' | 'condition'): void {
    if (!this.activeFilter) return;
    
    this.activeFilter.activeTab = tab;
  }
  
  /**
   * Starts the animation to update progress values and stages
   */
  startProgressAnimation(): void {
    // Define the progression paths for each starting state
    const progressionPaths = {
      'Not Sent': ['Listings In Progress', 'Listings Received'],
      'Listings In Progress': ['Listings Received'],
      'Listings Received': ['Prefill Inprogress', 'Prefill Received'],
      'Prefill Inprogress': ['Prefill Received'],
      'Prefill Received': ['Validation InProgress', 'Validation Completed'],
      'Validation InProgress': ['Validation Completed'],
      'Validation Completed': ['Efile Inprogress', 'Efile Completed'],
      'Efile Inprogress': ['Efile Completed'],
      'Efile Completed': [] // End of progression
    };
    
    // Determine animation duration based on auto_complete flag
    const animationDuration = this.autoComplete ? 10000 : 30000; // 10 or 30 seconds
    const totalSteps = 100;
    const stepDuration = animationDuration / totalSteps;
    
    // For auto-complete mode, we'll go through all stages
    if (this.autoComplete) {
    
      // Calculate how many steps to spend in each stage
      const stagesCount = this.efilingStages.length;
      const stepsPerStage = Math.floor(totalSteps / (stagesCount - 1)); // -1 because we start at stage 0
    
      this.progressSubscription = interval(stepDuration)
        .pipe(take(totalSteps + 1)) // +1 to reach 100%
        .subscribe(step => {
          // Calculate progress percentage (0 to 100)
          const progressPercentage = step;
          
          // Update progress for each in-progress record
          this.inProgressRecords.forEach(record => {
            // Update progress value
            this.progressValues.set(record.dataset, progressPercentage);
            
            // Calculate current stage based on progress
            const stageIndex = Math.min(
              Math.floor(progressPercentage / stepsPerStage),
              stagesCount - 1
            );
            
            // Update stage if it has changed
            const currentStageIndex = this.currentStages.get(record.dataset) || 0;
            if (stageIndex > currentStageIndex) {
              // Check if this record is marked to fail and we've reached the Validation stage
              const validationInProgressIndex = this.efilingStages.indexOf('Validation InProgress');
              
              if (this.isRecordFailed(record.dataset) && stageIndex >= validationInProgressIndex) {
                // If this is a record that should fail and we've reached the Validation stage,
                // set the status to "Validation Failed" and don't progress further
                this.currentStages.set(record.dataset, validationInProgressIndex);
                record.efileStatus = 'Validation Failed';
                
                // Make the progress bar 100% and red for failed records
                this.progressValues.set(record.dataset, 100);
                
                // Stop further progression for this record
                return;
              } else {
                // For non-failing records, continue with normal progression
                this.currentStages.set(record.dataset, stageIndex);
                record.efileStatus = this.efilingStages[stageIndex];
              }
            }
          });
        });
    } else {
      // For non-auto-complete mode, we'll animate through the specific progression path
      this.inProgressRecords.forEach(record => {
        // Get the current stage
        const currentState = record.efileStatus;
        
        // If we can't find the current stage, default to "Not Sent"
        if (!currentState || !progressionPaths[currentState]) {
          record.efileStatus = this.efilingStages[0]; // "Not Sent"
          return;
        }
        
        // Get the progression path for the current state
        const nextStates = progressionPaths[currentState] || [];
        
        // If there are no next states, skip this record
        if (nextStates.length === 0) {
          return;
        }
        
        // Set up animation for this record
        let recordSteps = 0;
        const stepsPerState = Math.floor(totalSteps / nextStates.length);
        
        // Create a subscription for this record
        const recordSubscription = interval(stepDuration)
          .pipe(take(totalSteps + 1)) // +1 to reach 100%
          .subscribe(step => {
            recordSteps = step;
            
            // Calculate which state we should be in
            const stateIndex = Math.min(
              Math.floor(recordSteps / stepsPerState),
              nextStates.length
            );
            
            // Update progress value (0-100%)
            const progressInCurrentState = (recordSteps % stepsPerState) / stepsPerState;
            const overallProgress = Math.min(
              ((stateIndex * stepsPerState) + (progressInCurrentState * stepsPerState)) / totalSteps * 100,
              100
            );
            this.progressValues.set(record.dataset, overallProgress);
            
            // If we've moved to a new state, update the status
            if (stateIndex > 0 && stateIndex <= nextStates.length) {
              const newState = nextStates[stateIndex - 1];
              const newStateIndex = this.efilingStages.indexOf(newState);
              
              if (newStateIndex !== -1 && newState !== record.efileStatus) {
                record.efileStatus = newState;
                this.currentStages.set(record.dataset, newStateIndex);
                
                // If this record is marked to fail, set status to "Validation Failed" and treat it as the last phase
                if (this.isRecordFailed(record.dataset)) {
                  record.efileStatus = 'Validation Failed';
                  this.progressValues.set(record.dataset, 100);
                  recordSubscription.unsubscribe(); // Stop animation for this record
                  return; // Exit the callback to prevent further processing
                }
              }
            }
          });
        
        // Add this subscription to our main subscription for cleanup
        if (this.progressSubscription) {
          const mainSub = this.progressSubscription;
          const originalUnsubscribe = mainSub.unsubscribe.bind(mainSub);
          mainSub.unsubscribe = () => {
            originalUnsubscribe();
            recordSubscription.unsubscribe();
          };
        }
      });
    }
  }

  /**
   * Gets the current progress value for a record
   * @param progressStr The original progress string from the record (not used anymore)
   * @param dataset The dataset identifier for the record
   * @returns A numeric value between 0 and 100
   */
  getProgressValue(progressStr: string | undefined, dataset?: string): number {
    if (dataset && this.progressValues.has(dataset)) {
      return this.progressValues.get(dataset) || 0;
    }
    
    // Fallback to the original method if dataset is not provided or not found
    if (!progressStr) return 0;
    
    // Extract the numeric part from the string (remove the % sign)
    const numericValue = parseInt(progressStr.replace('%', ''), 10);
    
    // Return the numeric value, or 0 if it's not a valid number
    return isNaN(numericValue) ? 0 : numericValue;
  }
  
  /**
   * Checks if a record is marked as failed
   * @param dataset The dataset identifier for the record
   * @returns True if the record is marked as failed, false otherwise
   */
  isRecordFailed(dataset: string): boolean {
    return this.failedRecords.get(dataset) || false;
  }
  
  /**
   * Gets the CSS class for the progress bar based on the record's status and progress
   * @param dataset The dataset identifier for the record
   * @param progress The current progress value
   * @returns CSS class name for the progress bar
   */
  getProgressBarClass(dataset: string, progress: number): string {
    // Only show as failed if the record is marked as failed AND progress is 100%
    return (this.isRecordFailed(dataset) && progress === 100) ? 'failed-progress' : 'normal-progress';
  }
  
  
  /**
   * Handles the action click from the menu
   * @param action The action to perform
   */
  onActionClick(action: string): void {
    if (!this.selectedRow) return;

    switch (action) {
      case 'insert-sheets':
        console.log('Insert Sheets clicked for:', this.selectedRow);
        break;
      case 'e-filing':
        this.openEfilingWizard();
        break;
      case 'save-excel':
        console.log('Save to Excel clicked for:', this.selectedRow);
        break;
      case 'change-status':
        console.log('Change Status clicked for:', this.selectedRow);
        break;
      case 'delete':
        console.log('Delete clicked for:', this.selectedRow);
        break;
      case 'print':
        console.log('Print clicked for:', this.selectedRow);
        break;
      case 'force-upgrade':
        console.log('Force Upgrade clicked for:', this.selectedRow);
        break;
    }
  }
  
  /**
   * Opens the e-filing wizard dialog
   */
  openEfilingWizard(): void {
    if (!this.selectedRow) return;
    
    // Open the e-filing wizard dialog
    const dialogRef = this.dialog.open(EfilingWizardComponent, {
      width: '650px',
      height: '450px',
      disableClose: true,
      data: {
        records: [this.selectedRow],
        entityType: 'corporate',
        isBulk: false
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.completed) {
        // Update the record status
        const index = this.inProgressRecords.findIndex(r => r.dataset === this.selectedRow?.dataset);
        if (index !== -1) {
          this.inProgressRecords[index].efileStatus = result.status || 'Filed';
          this.inProgressRecords[index].prevEfilingAction = 'E-Filed on ' + new Date().toLocaleDateString();
        }
      }
    });
  }
}
