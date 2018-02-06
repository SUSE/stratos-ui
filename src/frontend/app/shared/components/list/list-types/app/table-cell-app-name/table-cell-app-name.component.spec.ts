import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellAppNameComponent } from './table-cell-app-name.component';
import { CoreModule } from '../../../../../../core/core.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('TableCellAppNameComponent', () => {
  let component: TableCellAppNameComponent<any>;
  let fixture: ComponentFixture<TableCellAppNameComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableCellAppNameComponent],
      imports: [
        CoreModule,
        RouterTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellAppNameComponent);
    component = fixture.componentInstance;
    component.row = { entity: {} };
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
