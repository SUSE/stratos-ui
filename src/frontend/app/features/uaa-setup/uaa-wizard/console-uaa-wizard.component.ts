import { AfterContentInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { any } from 'codelyzer/util/function';
import { Observable } from 'rxjs/Rx';

import { environment } from '../../../../environments/environment';
import { StepOnNextFunction } from '../../../shared/components/stepper/step/step.component';
import { VerifySession } from '../../../store/actions/auth.actions';
import { SetUAAScope, SetupUAA } from '../../../store/actions/setup.actions';
import { AppState } from '../../../store/app-state';
import { AuthState } from '../../../store/reducers/auth.reducer';
import { UAASetupState } from '../../../store/types/uaa-setup.types';

@Component({
  selector: 'app-console-uaa-wizard',
  templateUrl: './console-uaa-wizard.component.html',
  styleUrls: ['./console-uaa-wizard.component.scss']
})
export class ConsoleUaaWizardComponent implements OnInit, AfterContentInit {

  constructor(private store: Store<AppState>, private router: Router) { }

  uaaForm: FormGroup;
  validateUAAForm: Observable<boolean>;
  uaaScopes = [];
  selectedScope = '';

  uaaFormNext: StepOnNextFunction = () => {
    this.store.dispatch(new SetupUAA({
      uaa_endpoint: this.uaaForm.get('apiUrl').value,
      console_client: this.uaaForm.get('clientId').value,
      password: this.uaaForm.get('adminPassword').value,
      skip_ssl_validation: true,
      username: this.uaaForm.get('adminUsername').value,
      console_client_secret: this.uaaForm.get('clientSecret').value,
    }));
    return this.store.select('uaaSetup')
      .skipWhile((state: UAASetupState) => {
        return state.settingUp;
      })
      .map((state: UAASetupState) => {
        this.uaaScopes = state.payload.scope;
        this.selectedScope = 'stratos.admin';
        return {
          success: !state.error,
          message: state.message
        };
      });
  }

  uaaScopeNext: StepOnNextFunction = () => {
    this.store.dispatch(new SetUAAScope(this.selectedScope));
    return this.store.select(s => [s.uaaSetup, s.auth])
      .filter(([uaa, auth]: [UAASetupState, AuthState]) => {
        return !(uaa.settingUp || auth.verifying);
      })
      .delay(1000)
      .take(5)
      .filter(([uaa, auth]: [UAASetupState, AuthState]) => {
        const validUAASessionData = auth.sessionData && !auth.sessionData.uaaError;
        if (!validUAASessionData) {
          this.store.dispatch(new VerifySession());
        }
        return validUAASessionData;
      })
      .map((state: [UAASetupState, AuthState]) => {
        if (!state[0].error) {
          this.router.navigateByUrl('');
        }
        return {
          success: !state[0].error,
          message: state[0].message
        };
      });
  }
  ngOnInit() {
    this.uaaForm = new FormGroup({
      apiUrl: new FormControl('', [<any>Validators.required]),
      clientId: new FormControl('', [<any>Validators.required]),
      clientSecret: new FormControl(''),
      adminUsername: new FormControl('', [<any>Validators.required]),
      adminPassword: new FormControl('', [<any>Validators.required]),
    });

    let observer;
    this.validateUAAForm = Observable.create((_observer) => {
      observer = _observer;
      observer.next(false);
    });

    this.uaaForm.valueChanges.subscribe(() => {
      observer.next(this.uaaForm.valid);
    });

  }

  ngAfterContentInit() {
  }

}
