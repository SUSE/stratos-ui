import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationMonitorFactory } from '../../../../shared/monitors/pagination-monitor.factory';
import { SpaceQuotaDefinitionFormComponent } from '../../space-quota-definition-form/space-quota-definition-form.component';
import { EditSpaceQuotaStepComponent } from './edit-space-quota-step.component';
import { CFBaseTestModules } from '../../../../../../cloud-foundry/test-framework/cf-test-helper';

describe('EditSpaceQuotaStepComponent', () => {
  let component: EditSpaceQuotaStepComponent;
  let fixture: ComponentFixture<EditSpaceQuotaStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSpaceQuotaStepComponent, SpaceQuotaDefinitionFormComponent],
      imports: [
        ...CFBaseTestModules
      ],
      providers: [PaginationMonitorFactory]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSpaceQuotaStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
