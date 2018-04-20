import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';
import { CreateApplicationModule } from '../create-application/create-application.module';
import { DeployApplicationStep2Component } from './deploy-application-step2/deploy-application-step2.component';
import { DeployApplicationStep3Component } from './deploy-application-step3/deploy-application-step3.component';
import { DeployApplicationComponent } from './deploy-application.component';
import { GithubProjectExistsDirective } from './github-project-exists.directive';
import { DeployApplicationStep21Component } from './deploy-application-step2-1/deploy-application-step2-1.component';
import { CommitListWrapperComponent } from './deploy-application-step2-1/commit-list-wrapper/commit-list-wrapper.component';

@NgModule({
  imports: [
    CoreModule,
    SharedModule,
    CommonModule,
    CreateApplicationModule
  ],
  declarations: [
    DeployApplicationComponent,
    DeployApplicationStep2Component,
    GithubProjectExistsDirective,
    DeployApplicationStep3Component,
    DeployApplicationStep21Component,
    CommitListWrapperComponent,
  ],
  exports: [
    DeployApplicationComponent
  ]
})
export class DeployApplicationModule { }
