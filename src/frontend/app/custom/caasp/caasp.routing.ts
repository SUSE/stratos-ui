import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CaaspSummaryComponent } from './caasp-summary/caasp-summary.component';
import { CaaspComponent } from './caasp/caasp.component';

const caasp: Routes = [{
  path: '',
  component: CaaspComponent
},
{
  path: ':caaspId',
  children: [
  {
    path: '',
    // Root for attaching CF wide actions (i.e assignments, tabs)
    component: CaaspSummaryComponent,
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(caasp)]
})
export class CaaspRoutingModule { }
