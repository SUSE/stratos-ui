import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreModule } from '../../../../../core/src/core/core.module';
import { SharedModule } from '../../../../../core/src/shared/shared.module';
import { CloudFoundryComponentsModule } from '../../../shared/components/components.module';
import { CreateApplicationStep2Component } from './create-application-step2/create-application-step2.component';
import { CreateApplicationStep3Component } from './create-application-step3/create-application-step3.component';
import { CreateApplicationComponent } from './create-application.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    CloudFoundryComponentsModule
  ],
  declarations: [
    CreateApplicationComponent,
    CreateApplicationStep2Component,
    CreateApplicationStep3Component
  ],
  exports: [
    CreateApplicationComponent,
  ]
})
export class CreateApplicationModule { }
