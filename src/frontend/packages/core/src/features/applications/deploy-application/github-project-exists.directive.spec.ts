import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';

import { AppState } from '../../../../../store/src/app-state';
import { createBasicStoreModule } from '../../../../test-framework/store-test-helper';
import { CoreModule } from '../../../core/core.module';
import { getGitHubAPIURL, GITHUB_API_URL } from '../../../core/github.helpers';
import { GitSCMService } from '../../../shared/data-services/scm/scm.service';
import { SharedModule } from '../../../shared/shared.module';
import { GithubProjectExistsDirective } from './github-project-exists.directive';

describe('GithubProjectExistsDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        CoreModule,
        SharedModule,
        createBasicStoreModule(),
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: GITHUB_API_URL, useFactory: getGitHubAPIURL }
      ]
    });
  });
  it('should create an instance', inject([Store, GitSCMService], (store: Store<AppState>, scmService: GitSCMService) => {
    const directive = new GithubProjectExistsDirective(store, scmService);
    expect(directive).toBeTruthy();
  }));
});
