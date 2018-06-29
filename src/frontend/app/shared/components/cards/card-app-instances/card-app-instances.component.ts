import { CardStatus } from './../../application-state/application-state.service';
import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { ApplicationService } from '../../../../features/applications/application.service';
import { AppMetadataTypes } from '../../../../store/actions/app-metadata.actions';
import { AppState } from '../../../../store/app-state';
import { ConfirmationDialogService } from '../../confirmation-dialog.service';
import { map } from 'rxjs/operators';
import { ConfirmationDialogConfig } from '../../confirmation-dialog.config';

const appInstanceScaleToZeroConfirmation = new ConfirmationDialogConfig('Set Instance count to 0',
  'Are you sure you want to set the instance count to 0?', 'Confirm', true);

@Component({
  selector: 'app-card-app-instances',
  templateUrl: './card-app-instances.component.html',
  styleUrls: ['./card-app-instances.component.scss']
})
export class CardAppInstancesComponent implements OnInit, OnDestroy {

  // Should the card show the actions to scale/down the number of instances?
  @Input('showActions') showActions = false;

  @Input('busy') busy: any;

  @ViewChild('instanceField') instanceField: ElementRef;

  status$: Observable<CardStatus>;

  constructor(
    private store: Store<AppState>,
    public appService: ApplicationService,
    private renderer: Renderer,
    private confirmDialog: ConfirmationDialogService) {
    this.status$ = this.appService.applicationState$.pipe(
      map(state => state.indicator)
    );
  }

  private currentCount: 0;
  public editCount: 0;

  private sub: Subscription;

  public isEditing = false;

  public editValue: any;

  // Observable on the running instances count for the application
  public runningInstances$: Observable<number>;

  private app: any;

  ngOnInit() {
    this.sub = this.appService.application$.subscribe(app => {
      if (app.app.entity) {
        this.currentCount = app.app.entity.instances;
        this.app = app.app.entity;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  scaleUp(current: number) {
    this.setInstanceCount(this.currentCount + 1);
  }

  scaleDown(current: number) {
    this.setInstanceCount(this.currentCount - 1);
  }

  edit() {
    this.editValue = this.currentCount;
    this.isEditing = true;
    setTimeout(() => {
      this.renderer.invokeElementMethod(this.instanceField.nativeElement, 'focus', []);
    }, 0);
  }

  finishEdit(ok: boolean) {
    this.isEditing = false;
    if (ok) {
      this.setInstanceCount(parseInt(this.editValue, 10));
    }
  }

  // Set instance count. Ask for confirmation if setting count to 0
  private setInstanceCount(value: number) {
    const doUpdate = () => this.appService.updateApplication({ instances: value }, [AppMetadataTypes.STATS], this.app);
    if (value === 0) {
      this.confirmDialog.open(appInstanceScaleToZeroConfirmation, doUpdate);
    } else {
      doUpdate();
    }
  }
}
