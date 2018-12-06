import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellEndpointNameComponent } from './table-cell-endpoint-name.component';
import { CoreModule } from '../../../../../../core/core.module';
import { EndpointModel } from '../../../../../../store/types/endpoint.types';

describe('TableCellEndpointNameComponent', () => {
  let component: TableCellEndpointNameComponent<{}>;
  let fixture: ComponentFixture<TableCellEndpointNameComponent<{}>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellEndpointNameComponent ],
      imports: [
        CoreModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellEndpointNameComponent);
    component = fixture.componentInstance;
    component.row = {} as EndpointModel;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
