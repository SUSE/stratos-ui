import { AfterContentInit, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { filter, first, map, share, switchMap, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { IService } from '../../../../core/cf-api-svc.types';
import { EntityServiceFactory } from '../../../../core/entity-service-factory.service';
import { PaginationMonitorFactory } from '../../../../shared/monitors/pagination-monitor.factory';
import { SetCreateServiceInstanceServiceGuid } from '../../../../store/actions/create-service-instance.actions';
import { AppState } from '../../../../store/app-state';
import { selectCreateServiceInstance } from '../../../../store/selectors/create-service-instance.selectors';
import { APIResource } from '../../../../store/types/api.types';
import { ServicesWallService } from '../../../services/services/services-wall.service';
import { ServicesService } from '../../services.service';
import { CreateServiceInstanceState } from '../../../../store/types/create-service-instance.types';
import { CreateServiceInstanceHelperService, Mode } from '../create-service-instance-helper.service';
import { ActivatedRoute } from '@angular/router';
import { getIdFromRoute } from '../../../cloud-foundry/cf.helpers';

@Component({
  selector: 'app-select-service',
  templateUrl: './select-service.component.html',
  styleUrls: ['./select-service.component.scss'],
  providers: [
    ServicesWallService
  ]
})
export class SelectServiceComponent implements OnDestroy, AfterContentInit {
  cfGuid: string;
  serviceSubscription: Subscription;
  services$: Observable<APIResource<IService>[]>;
  stepperForm: FormGroup;
  validate: Observable<boolean>;


  constructor(
    private store: Store<AppState>,
    private paginationMonitorFactory: PaginationMonitorFactory,
    private servicesWallService: ServicesWallService,
    private entityServiceFactory: EntityServiceFactory,
    private cSIHelperService: CreateServiceInstanceHelperService,
    private activatedRoute: ActivatedRoute
  ) {
    this.stepperForm = new FormGroup({
      service: new FormControl(''),
    });

    this.services$ = this.store.select(selectCreateServiceInstance).pipe(
      filter(p => !!p && !!p.cfGuid),
      tap((p: CreateServiceInstanceState) => this.cfGuid = p.cfGuid),
      switchMap(p => servicesWallService.getServicesInCf(p.cfGuid)),
      filter(p => !!p),
      first(),
      share()
    );

  }

  onNext = () => {

    const serviceGuid = this.stepperForm.controls.service.value;
    this.store.dispatch(new SetCreateServiceInstanceServiceGuid(serviceGuid));

    const appId = getIdFromRoute(this.activatedRoute, 'id');
    this.cSIHelperService.initService(this.cfGuid, serviceGuid, appId ? Mode.APPSERVICE : Mode.DEFAULT);
    return Observable.of({ success: true });
  }

  ngAfterContentInit() {

    this.validate = this.stepperForm.statusChanges.pipe(
      map(() => this.stepperForm.valid)
    );

    this.serviceSubscription = this.services$.pipe(
      tap(services => {
        const guid = services[0].metadata.guid;
        this.stepperForm.controls.service.setValue(guid);
        this.store.dispatch(new SetCreateServiceInstanceServiceGuid(guid));
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.serviceSubscription.unsubscribe();
  }
}
