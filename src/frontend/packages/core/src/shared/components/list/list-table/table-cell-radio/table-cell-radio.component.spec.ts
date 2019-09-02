import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationService } from '../../../../../../../cloud-foundry/src/features/applications/application.service';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { ApplicationServiceMock } from '../../../../../../test-framework/application-service-helper';
import { CoreModule } from '../../../../../core/core.module';
import { IListDataSource } from '../../data-sources-controllers/list-data-source-types';
import { TableCellRadioComponent } from './table-cell-radio.component';

describe('TableCellRadioComponent', () => {
  let component: TableCellRadioComponent<any>;
  let fixture: ComponentFixture<TableCellRadioComponent<any>>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [TableCellRadioComponent],
        imports: [CoreModule],
        providers: [
          { provide: ApplicationService, useClass: ApplicationServiceMock }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellRadioComponent);
    component = fixture.componentInstance;
    component.row = {
      entity: {
        metadata: {}
      }
    } as APIResource;
    component.dataSource = {} as IListDataSource<any>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
