import { protractor, ElementFinder } from 'protractor/built';
import { browser, element, by } from 'protractor';
import { E2EHelpers } from '../helpers/e2e-helpers';
import { MenuComponent } from '../po/menu.po';
import { FormComponent } from '../po/form.po';
import { Component } from '../po/component.po';
import { SnackBarComponent } from '../po/snackbar.po';

/**
 * Connect Dialog Page Object
 */
export class ConnectDialogComponent extends Component {

  public form: FormComponent;

  public buttons: MenuComponent;

  public snackBar = new SnackBarComponent();

  constructor() {
    super(element(by.tagName('app-connect-endpoint-dialog')));
    this.form = new FormComponent(this.locator.element(by.tagName('form')));
    this.buttons = new MenuComponent(this.locator.element(by.tagName('form')));
  }

  close() {
    return this.buttons.getItemMap().then(btns => btns['cancel'].click());
  }

  connect() {
    return this.buttons.getItemMap().then(btns => btns['connect'].click());
  }

  canConnect() {
    return this.buttons.getItemMap().then(btns => !btns['connect'].disabled);
  }


}
