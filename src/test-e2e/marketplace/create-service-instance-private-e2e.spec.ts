import { ConsoleUserType } from '../helpers/e2e-helpers';
import { e2e } from '../e2e';
import { ElementFinder, promise } from 'protractor';
import { CreateServiceInstance } from './create-service-instance.po';
import { ServicesWallPage } from './services-wall.po';
import { MetaCard } from '../po/meta-card.po';
import { ServicesHelperE2E } from './services-helper-e2e';

describe('Create Service Instance of Private Service', () => {
  const createServiceInstance = new CreateServiceInstance();
  const servicesWall = new ServicesWallPage();
  let servicesHelperE2E: ServicesHelperE2E;
  beforeAll(() => {
    const e2eSetup = e2e.setup(ConsoleUserType.user)
      .clearAllEndpoints()
      .registerDefaultCloudFoundry()
      .connectAllEndpoints(ConsoleUserType.user)
      .connectAllEndpoints(ConsoleUserType.admin);
    servicesHelperE2E = new ServicesHelperE2E(e2eSetup, createServiceInstance);
  });

  beforeEach(() => {
    createServiceInstance.navigateTo();
    createServiceInstance.waitForPage();
  });

  it('- should reach create service instance page', () => {
    expect(createServiceInstance.isActivePage()).toBeTruthy();
  });

  it('- should be able to to create a service instance', () => {

    servicesHelperE2E.createService(e2e.secrets.getDefaultCFEndpoint().services.privateService.name);

    servicesWall.isActivePage();

    const serviceName = servicesHelperE2E.serviceInstanceName;

    servicesWall.serviceInstancesList.cards.getCards().then(
      (cards: ElementFinder[]) => {
        return cards.map(card => {
          const metaCard = new MetaCard(card);
          return metaCard.getTitle();
        });
      }).then(cardTitles => {
        promise.all(cardTitles).then(titles => {
          expect(titles.filter(t => t === serviceName).length).toBe(1);
        });
      }).catch(e => fail(e));


  });

  it('- should return user to Service summary when cancelled on CFOrgSpace selection', () => {

    // Select CF/Org/Space
    servicesHelperE2E.setCfOrgSpace();
    createServiceInstance.stepper.cancel();

    servicesWall.isActivePage();

  });

  it('- should return user to Service summary when cancelled on Service selection', () => {

    // Select CF/Org/Space
    servicesHelperE2E.setCfOrgSpace();
    createServiceInstance.stepper.next();

    // Select Service
    servicesHelperE2E.setServiceSelection(e2e.secrets.getDefaultCFEndpoint().services.privateService.name);
    createServiceInstance.stepper.next();

    createServiceInstance.stepper.cancel();

    servicesWall.isActivePage();

  });

  it('- should not show service plan if wrong org/space are selected', () => {

    // Select CF/Org/Space
    servicesHelperE2E.setCfOrgSpace(e2e.secrets.getDefaultCFEndpoint().services.privateService.invalidOrgName,
      e2e.secrets.getDefaultCFEndpoint().services.privateService.invalidSpaceName);
    createServiceInstance.stepper.next();

    // Select Service
    servicesHelperE2E.setServiceSelection(e2e.secrets.getDefaultCFEndpoint().services.privateService.name, true);

  });


  afterAll((done) => {
    servicesHelperE2E.cleanUpServiceInstance(servicesHelperE2E.serviceInstanceName).then(() => done());
  });
});


