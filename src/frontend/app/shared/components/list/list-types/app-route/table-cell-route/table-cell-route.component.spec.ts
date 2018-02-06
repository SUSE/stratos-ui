import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellRouteComponent } from './table-cell-route.component';
import { EntityInfo } from '../../../../../../store/types/api.types';

describe('TableCellRouteComponent', () => {
  let component: TableCellRouteComponent<any>;
  let fixture: ComponentFixture<TableCellRouteComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellRouteComponent);
    component = fixture.componentInstance;
    component.row = {
      entity: {}
    } as EntityInfo;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
