import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { EfilingRecord, MOCK_DATA, ACTION_MENU_ITEMS } from '../models/efiling.model';
import { WorkflowService } from '../services/workflow.service';
import { EfilingWorkflowComponent } from '../efiling-workflow/efiling-workflow.component';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-efiling-management',
  templateUrl: './efiling-management.component.html',
  styleUrls: ['./efiling-management.component.scss']
})
export class EfilingManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  private gridApi!: GridApi;
  rowData: EfilingRecord[] = [];
  actionMenuItems = ACTION_MENU_ITEMS;
  selectedRow: EfilingRecord | null = null;
  selection = new SelectionModel<EfilingRecord>(true, []); // Allow multiple selection

  columnDefs: ColDef[] = [
    {
      headerName: 'Select',
      field: 'select',
      width: 50,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      sortable: false,
      filter: false
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 100,
      cellRenderer: this.actionCellRenderer.bind(this),
      sortable: false,
      filter: false
    },
    { field: 'dataset', headerName: 'Dataset', sortable: true, filter: true },
    { field: 'jurisdiction', headerName: 'Jurisdiction', sortable: true, filter: true },
    { field: 'entityName', headerName: 'Entity Name', sortable: true, filter: true },
    { field: 'returnName', headerName: 'Return Name', sortable: true, filter: true },
    { field: 'purpose', headerName: 'Purpose', sortable: true, filter: true },
    { field: 'status', headerName: 'Status', sortable: true, filter: true },
    { field: 'noAutoRollforward', headerName: 'No Auto Rollforward', sortable: true, filter: true },
    { field: 'startDate', headerName: 'Start Date', sortable: true, filter: true },
    { field: 'endDate', headerName: 'End Date', sortable: true, filter: true },
    { field: 'period', headerName: 'Period', sortable: true, filter: true },
    { field: 'templateVersion', headerName: 'Template Version', sortable: true, filter: true },
    { field: 'eFilingStatus', headerName: 'E-Filing Status', sortable: true, filter: true },
    { field: 'prevEfilingAction', headerName: 'Previous E-Filing Action', sortable: true, filter: true },
    { field: 'templateName', headerName: 'Template Name', sortable: true, filter: true }
  ];

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true
  };

  constructor(
    private dialog: MatDialog,
    private workflowService: WorkflowService
  ) {}

  ngOnInit(): void {
    // Initialize rowData with mock data
    console.log('Mock data:', MOCK_DATA);
    this.rowData = [...MOCK_DATA];
  }

  ngAfterViewInit(): void {
    // Ensure grid is refreshed after view initialization
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.setRowData(this.rowData);
        this.gridApi.sizeColumnsToFit();
      }
    }, 0);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    
    // Set row data explicitly
    this.gridApi.setRowData(MOCK_DATA);
    
    // Set up selection handling
    this.gridApi.addEventListener('rowSelected', (event) => {
      if (event.node.isSelected()) {
        this.selection.select(event.data);
      } else {
        this.selection.deselect(event.data);
      }
    });
  }

  // Check if all rows are selected
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.rowData.length;
    return numSelected === numRows;
  }

  // Toggle all rows
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.gridApi.deselectAll();
    } else {
      this.rowData.forEach(row => this.selection.select(row));
      this.gridApi.selectAll();
    }
  }

  actionCellRenderer(params: any) {
    // Create a wrapper div
    const eCell = document.createElement('div');
    
    // Create a button with material styling
    const eButton = document.createElement('button');
    eButton.className = 'mat-icon-button';
    eButton.setAttribute('type', 'button');
    
    // Add the icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-icons';
    iconSpan.textContent = 'more_vert';
    eButton.appendChild(iconSpan);
    
    // Add click handler
    eButton.addEventListener('click', (event: Event) => {
      this.selectedRow = params.data;
      if (this.menuTrigger) {
        this.menuTrigger.menuData = { row: params.data };
        this.menuTrigger.openMenu();
        event.stopPropagation();
      }
    });
    
    eCell.appendChild(eButton);
    return eCell;
  }

  onActionClick(action: string) {
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

  openEfilingWizard() {
    // Check if multiple records are selected
    if (this.selection.selected.length > 1) {
      // Process multiple records
      this.processMultipleRecords();
    } else {
      // Process single record (the one that was right-clicked)
      if (!this.selectedRow) return;
      
      // Initialize the workflow with the selected record
      this.workflowService.initializeWorkflow(
        [this.selectedRow], 
        'corporate', 
        false
      );
      
      // Open the workflow dialog
      const dialogRef = this.dialog.open(EfilingWorkflowComponent, {
        width: '800px',
        height: '600px',
        disableClose: true
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.completed) {
          // Update the record status
          const index = this.rowData.findIndex(r => r.dataset === this.selectedRow?.dataset);
          if (index !== -1) {
            this.rowData[index].eFilingStatus = 'Filed';
            this.rowData[index].prevEfilingAction = 'E-Filed on ' + new Date().toLocaleDateString();
            this.gridApi.setRowData([...this.rowData]);
          }
        }
      });
    }
  }

  // Process multiple selected records
  private processMultipleRecords() {
    // Initialize the workflow with all selected records
    this.workflowService.initializeWorkflow(
      this.selection.selected, 
      'corporate', 
      false
    );
    
    // Open the workflow dialog
    const dialogRef = this.dialog.open(EfilingWorkflowComponent, {
      width: '800px',
      height: '600px',
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.completed) {
        // Update the status of all selected records
        this.selection.selected.forEach(selectedRecord => {
          const index = this.rowData.findIndex(r => r.dataset === selectedRecord.dataset);
          if (index !== -1) {
            this.rowData[index].eFilingStatus = 'Filed';
            this.rowData[index].prevEfilingAction = 'E-Filed on ' + new Date().toLocaleDateString();
          }
        });
        
        // Update the grid
        this.gridApi.setRowData([...this.rowData]);
      }
    });
  }
}