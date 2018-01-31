import { Component, OnInit, OnDestroy, ViewChild, AfterContentInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app-state';
import { selectNewAppState } from '../../../../store/effects/create-app-effects';
import {
  SetAppSourceDetails,
  SetAppSourceSubType,
  FetchBranchesForProject,
  SaveAppDetails,
  FetchCommit
} from '../../../../store/actions/deploy-applications.actions';
import { filter, mergeMap, tap, skipWhile, switchMap, merge, map, take } from 'rxjs/operators';
import {
  SourceType,
  Commit,
  GitBranch,
  BranchesSchema,
  BranchSchema,
  GITHUB_BRANCHES_ENTITY_KEY,
  GITHUB_COMMIT_ENTITY_KEY
} from '../../../../store/types/deploy-application.types';
import {
  selectSourceType,
  selectSourceSubType,
  selectProjectExists,
  selectProjectBranches,
  selectNewProjectCommit
} from '../../../../store/selectors/deploy-application.selector';
import { Subscription } from 'rxjs/Subscription';
import { NgForm } from '@angular/forms';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { selectPaginationState } from '../../../../store/selectors/pagination.selectors';
import { getPaginationPages } from '../../../../store/reducers/pagination-reducer/pagination-reducer.helper';
import { PaginatedAction } from '../../../../store/types/pagination.types';
import { selectEntity } from '../../../../store/selectors/api.selectors';
import { APIResource } from '../../../../store/types/api.types';
import { combineLatest } from 'rxjs/observable/combineLatest';
@Component({
  selector: 'app-deploy-application-step2',
  templateUrl: './deploy-application-step2.component.html',
  styleUrls: ['./deploy-application-step2.component.scss']
})

export class DeployApplicationStep2Component implements OnInit, OnDestroy, AfterContentInit {
  sourceTypes: SourceType[] = [{ name: 'Git', id: 'git' }];
  sourceType$: Observable<SourceType>;
  sourceType: SourceType;
  sourceSubTypes: SourceType[] = [{ id: 'github', name: 'Public Github' }, { id: 'giturl', name: 'Public Git URL' }];
  sourceSubType$: Observable<string>;
  sourceSubType: SourceType;
  gitSection: string;
  repositoryBranch: GitBranch = { name: null, commit: null };
  defaultBranch: string;
  repositoryBranches$: Observable<any>;
  fetchBranches$: Subscription;
  repository: any;
  validate: Observable<boolean>;
  projectInfo$: Observable<any>;
  commitInfo$: Observable<Commit>;

  @ViewChild('sourceSelectionForm')
  sourceSelectionForm: NgForm;


  ngOnDestroy(): void {
    this.fetchBranches$.unsubscribe();
  }

  constructor(
    private store: Store<AppState>
  ) { }

  onNext = () => {
    this.store.dispatch(new SaveAppDetails({
      projectName: this.repository,
      branch: this.repositoryBranch
    }));
    return Observable.of({ success: true });
  }

  ngOnInit() {
    this.sourceType$ = this.store.select(selectSourceType);
    this.sourceSubType$ = this.store.select(selectSourceSubType);
    this.fetchBranches$ = this.store.select(selectProjectExists).pipe(
      filter(state => state && !state.checking && state.exists),
      tap(p => {
        this.store.dispatch(new FetchBranchesForProject(p.name));
      })
    ).subscribe();

    const action = {
      entityKey: GITHUB_BRANCHES_ENTITY_KEY,
      paginationKey: 'branches'
    } as PaginatedAction;
    const repositoryBranches$ = getPaginationPages(this.store, action, BranchesSchema).pipe(
      filter(p => {
        return !!p[0] && !!Object.keys(p[0]).length;
      }),
      map(p => p[0])
    );

    this.projectInfo$ = this.store.select(selectProjectExists).pipe(
      filter(p => {
        return p && !!p.data;
      }),
      map(p => p.data),
      tap(p => {
        this.defaultBranch = p.default_branch;
      })
    );

    // Fetch the commit, but only when we have a valid project and it's default_branch
    this.repositoryBranches$ = combineLatest(repositoryBranches$, this.projectInfo$)
      .map(([branches, projectInfo]) => branches)
      .do(p => {
        this.repositoryBranch = p.find(branch => branch.name === this.defaultBranch);
        this.fetchCommit(this.repositoryBranch);
      });

    // Auto select `git` type
    this.sourceType = this.sourceTypes[0];
    this.sourceSubType = this.sourceSubTypes[0];
    this.setSourceType(this.sourceType);
    this.setSourceSubType(this.sourceSubType);
  }

  setSourceType = (event) => this.store.dispatch(new SetAppSourceDetails({ type: event }));

  fetchCommit = (branch) => {
    if (!branch) {
      return;
    }
    this.store.dispatch(new FetchCommit(branch.commit));
    this.commitInfo$ = combineLatest(
      this.store.select<Commit>(selectEntity(GITHUB_COMMIT_ENTITY_KEY, this.repositoryBranch.commit.sha)),
      this.sourceSelectionForm.controls.projectName.statusChanges.startWith('VALID')
    ).map(([commit, projectValid]: [Commit, string]) => {
      if (projectValid === 'VALID') {
        return commit;
      }
      return null;
    });
  }

  setSourceSubType = (event) => this.store.dispatch(new SetAppSourceSubType(event));


  ngAfterContentInit() {
    this.validate = this.sourceSelectionForm.statusChanges
      .map(() => {
        return this.sourceSelectionForm.valid;
      });
  }

}
