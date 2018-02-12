import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudFoundryStacksComponent } from './cloud-foundry-stacks.component';

describe('CloudFoundryStacksComponent', () => {
  let component: CloudFoundryStacksComponent;
  let fixture: ComponentFixture<CloudFoundryStacksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudFoundryStacksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudFoundryStacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
