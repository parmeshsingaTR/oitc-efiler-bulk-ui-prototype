import { NgModule } from '@angular/core';
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
  imports: [...materialModules],
  exports: [...materialModules]
})
export class MaterialModule { }