import { browser, by, element } from 'protractor';

import { ListComponent } from '../../po/list.po';
import { MetaDataItemComponent } from '../../po/meta-data-time.po';
import { CFPage } from '../../po/cf-page.po';


export class CfSpaceLevelPage extends CFPage {

  static forEndpoint(guid: string, orgGuid: string, spaceGuid: string): CfSpaceLevelPage {
    const page = new CfSpaceLevelPage();
    page.navLink = `/cloud-foundry/${guid}/organizations/${orgGuid}/spaces/${spaceGuid}`;
    return page;
  }

  goToSummaryTab() {
    return this.goToTab('Summary', 'summary');
  }

  goToAppsTab() {
    return this.goToTab('Applications', 'apps');
  }

  goToSITab() {
    return this.goToTab('Service Instances', 'service-instances');
  }

  goToRoutesTab() {
    return this.goToTab('Routes', 'routes');
  }

  goToUsersTab() {
    return this.goToTab('Users', 'users');
  }

  private goToTab(label: string, urlSuffix: string) {
    return this.subHeader.goToItemAndWait(label, this.navLink, urlSuffix);
  }

}
