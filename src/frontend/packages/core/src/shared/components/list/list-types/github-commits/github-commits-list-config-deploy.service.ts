import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { GithubCommitsListConfigServiceBase } from './github-commits-list-config-base.service';
import { first, filter, map } from 'rxjs/operators';
import { GithubCommitsDataSource } from './github-commits-data-source';
import { TableCellRadioComponent } from '../../list-table/table-cell-radio/table-cell-radio.component';
import { AppState } from '../../../../../../../store/src/app-state';
import { DeployApplicationSource } from '../../../../../../../store/src/types/deploy-application.types';
import { selectApplicationSource } from '../../../../../../../store/src/selectors/deploy-application.selector';
import { GitSCMType, GitSCMService } from '../../../../data-services/scm/scm.service';

@Injectable()
export class GithubCommitsListConfigServiceDeploy extends GithubCommitsListConfigServiceBase {
  constructor(
    store: Store<AppState>,
    datePipe: DatePipe,
    scmService: GitSCMService
  ) {
    super(store, datePipe);
    this.text.title = 'Select a commit';
    this.columns.unshift({
      columnId: 'radio',
      headerCell: () => '',
      cellComponent: TableCellRadioComponent,
      class: 'table-column-select',
      cellFlex: '1'
    });

    this.store.select<DeployApplicationSource>(selectApplicationSource).pipe(
      map((appSource: DeployApplicationSource) => {
        return (appSource.type.id === 'github' || appSource.type.id === 'gitlab') ? {
          scm: appSource.type.id as GitSCMType,
          projectName: appSource.projectName,
          sha: appSource.branch.name,
          commitSha: appSource.commit ? appSource.commit.sha : null
        } : null;
      }),
      filter(fetchDetails => !!fetchDetails && !!fetchDetails.projectName && !!fetchDetails.sha),
      first()
    ).subscribe(fetchDetails => {
      const scm = scmService.getSCM(fetchDetails.scm);
      this.dataSource = new GithubCommitsDataSource(this.store,
        this, scm, fetchDetails.projectName, fetchDetails.sha, fetchDetails.commitSha);
      this.initialised.next(true);
    });
  }
}
