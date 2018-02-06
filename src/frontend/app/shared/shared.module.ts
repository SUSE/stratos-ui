import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { CoreModule } from '../core/core.module';
import {
  ApplicationStateIconComponent,
} from './components/application-state/application-state-icon/application-state-icon.component';
import { ApplicationStateIconPipe } from './components/application-state/application-state-icon/application-state-icon.pipe';
import { ApplicationStateComponent } from './components/application-state/application-state.component';
import { ApplicationStateService } from './components/application-state/application-state.service';
import { CardStatusComponent } from './components/cards/card-status/card-status.component';
import { CfAuthModule } from './components/cf-auth/cf-auth.module';
import { CodeBlockComponent } from './components/code-block/code-block.component';
import { ConfirmationDialogService } from './components/confirmation-dialog.service';
import { DetailsCardComponent } from './components/details-card/details-card.component';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { DialogErrorComponent } from './components/dialog-error/dialog-error.component';
import { DisplayValueComponent } from './components/display-value/display-value.component';
import { EditableDisplayValueComponent } from './components/editable-display-value/editable-display-value.component';
import { EndpointsMissingComponent } from './components/endpoints-missing/endpoints-missing.component';
import { FocusDirective } from './components/focus.directive';
import {
  AppEventDetailDialogComponentComponent,
} from './components/list/list-cards/custom-cards/card-app-event/app-event-detail-dialog-component/app-event-detail-dialog-component.component';
import {
  CardAppInstancesComponent,
} from './components/cards/card-app-instances/card-app-instances.component';
import { CardAppStatusComponent } from './components/cards/card-app-status/card-app-status.component';
import { CardAppUptimeComponent } from './components/cards/card-app-uptime/card-app-uptime.component';
import { CardAppUsageComponent } from './components/cards/card-app-usage/card-app-usage.component';
import { ListComponent, ListConfig } from './components/list/list.component';
import {
  EventTabActorIconPipe,
} from './components/list/list-types/app-event/table-cell-event-action/event-tab-actor-icon.pipe';
import { listTableComponents } from './components/list/list-table/table.types';
import { LoadingPageComponent } from './components/loading-page/loading-page.component';
import { LogViewerComponent } from './components/log-viewer/log-viewer.component';
import { MetadataItemComponent } from './components/metadata-item/metadata-item.component';
import { NoContentMessageComponent } from './components/no-content-message/no-content-message.component';
import { PageHeaderModule } from './components/page-header/page-header.module';
import { PageSubheaderComponent } from './components/page-subheader/page-subheader.component';
import { RunningInstancesComponent } from './components/running-instances/running-instances.component';
import { SshViewerComponent } from './components/ssh-viewer/ssh-viewer.component';
import { StatefulIconComponent } from './components/stateful-icon/stateful-icon.component';
import { SteppersModule } from './components/stepper/steppers.module';
import { TileGridComponent } from './components/tile/tile-grid/tile-grid.component';
import { TileGroupComponent } from './components/tile/tile-group/tile-group.component';
import { TileComponent } from './components/tile/tile/tile.component';
import { UniqueDirective } from './components/unique.directive';
import { UsageGaugeComponent } from './components/usage-gauge/usage-gauge.component';
import { CfOrgSpaceDataService } from './data-services/cf-org-space-service.service';
import { MbToHumanSizePipe } from './pipes/mb-to-human-size.pipe';
import { PercentagePipe } from './pipes/percentage.pipe';
import { UptimePipe } from './pipes/uptime.pipe';
import { UsageBytesPipe } from './pipes/usage-bytes.pipe';
import { ValuesPipe } from './pipes/values.pipe';
import { listCardComponents } from './components/list/list-cards/card.types';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    PageHeaderModule,
    RouterModule,
    SteppersModule,
    VirtualScrollModule,
    CfAuthModule,
    CdkTableModule,
  ],
  declarations: [
    LoadingPageComponent,
    DisplayValueComponent,
    StatefulIconComponent,
    EditableDisplayValueComponent,
    MbToHumanSizePipe,
    PercentagePipe,
    UptimePipe,
    UsageBytesPipe,
    ValuesPipe,
    LoadingPageComponent,
    DetailsCardComponent,
    FocusDirective,
    UniqueDirective,
    CodeBlockComponent,
    EventTabActorIconPipe,
    LogViewerComponent,
    AppEventDetailDialogComponentComponent,
    NoContentMessageComponent,
    EndpointsMissingComponent,
    DialogErrorComponent,
    SshViewerComponent,
    ApplicationStateIconPipe,
    ApplicationStateIconComponent,
    ApplicationStateComponent,
    PageSubheaderComponent,
    TileComponent,
    TileGroupComponent,
    TileGridComponent,
    MetadataItemComponent,
    UsageGaugeComponent,
    CardStatusComponent,
    CardAppStatusComponent,
    CardAppInstancesComponent,
    CardAppUsageComponent,
    RunningInstancesComponent,
    DialogConfirmComponent,
    CardAppUptimeComponent,
    ListComponent,
    ...listCardComponents,
    ...listTableComponents,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    LoadingPageComponent,
    DialogErrorComponent,
    PageHeaderModule,
    DisplayValueComponent,
    EditableDisplayValueComponent,
    DetailsCardComponent,
    SteppersModule,
    StatefulIconComponent,
    MbToHumanSizePipe,
    ValuesPipe,
    PercentagePipe,
    UsageBytesPipe,
    UptimePipe,
    SteppersModule,
    FocusDirective,
    UniqueDirective,
    CodeBlockComponent,
    LogViewerComponent,
    NoContentMessageComponent,
    EndpointsMissingComponent,
    ApplicationStateComponent,
    SshViewerComponent,
    PageSubheaderComponent,
    TileComponent,
    TileGroupComponent,
    TileGridComponent,
    CardStatusComponent,
    MetadataItemComponent,
    CardAppStatusComponent,
    CardAppInstancesComponent,
    UsageGaugeComponent,
    CardAppUsageComponent,
    DialogConfirmComponent,
    CardAppUptimeComponent,
    ListComponent,
  ],
  entryComponents: [
    AppEventDetailDialogComponentComponent,
    DialogConfirmComponent,
  ],
  providers: [
    ListConfig,
    ApplicationStateService,
    CfOrgSpaceDataService,
    ConfirmationDialogService,
  ]
})
export class SharedModule { }
