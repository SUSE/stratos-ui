import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BaseTestModulesNoShared } from '../../../../test-framework/core-test.helper';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { EnvVarViewComponent } from './env-var-view.component';

describe('EnvVarViewComponent', () => {
  let component: EnvVarViewComponent;
  let fixture: ComponentFixture<EnvVarViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EnvVarViewComponent, CodeBlockComponent],
      imports: [...BaseTestModulesNoShared],
      providers: [
        { provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: { key: '', value: '' } }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvVarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
