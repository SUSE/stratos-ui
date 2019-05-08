import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CliInfoComponent } from './cli-info.component';
import { CoreModule } from '../../../core/core.module';
import { MDAppModule } from '../../../core/md.module';
import { CodeBlockComponent } from '../code-block/code-block.component';

describe('CliInfoComponent', () => {
  let component: CliInfoComponent;
  let fixture: ComponentFixture<CliInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CliInfoComponent, CodeBlockComponent ],
      imports: [
        CoreModule,
        MDAppModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CliInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
