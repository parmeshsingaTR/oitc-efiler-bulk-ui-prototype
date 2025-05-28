import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EfilingManagementComponent } from './efiling-management/efiling-management.component';
import { AgGridModule } from 'ag-grid-angular';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// E-Filing Workflow Components
import { EfilingWorkflowComponent } from './efiling-workflow/efiling-workflow.component';
import { ListStepComponent } from './efiling-workflow/list-step/list-step.component';
import { PrefillStepComponent } from './efiling-workflow/prefill-step/prefill-step.component';
import { ValidateStepComponent } from './efiling-workflow/validate-step/validate-step.component';
import { FileStepComponent } from './efiling-workflow/file-step/file-step.component';
import { ConfirmationStepComponent } from './efiling-workflow/confirmation-step/confirmation-step.component';

// Services
import { WorkflowService } from './services/workflow.service';

const materialModules = [
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatDialogModule,
  MatStepperModule,
  MatTableModule,
  MatCheckboxModule,
  MatRadioModule,
  MatProgressSpinnerModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatCardModule,
  MatDividerModule,
  MatTooltipModule
];

@NgModule({
  declarations: [
    AppComponent,
    EfilingManagementComponent,
    EfilingWorkflowComponent,
    ListStepComponent,
    PrefillStepComponent,
    ValidateStepComponent,
    FileStepComponent,
    ConfirmationStepComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    AgGridModule.withComponents([]),
    ...materialModules
  ],
  providers: [WorkflowService],
  bootstrap: [AppComponent]
})
export class AppModule { }