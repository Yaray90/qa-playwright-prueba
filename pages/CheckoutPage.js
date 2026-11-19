// @ts-check

/**
 * Page Object del proceso de checkout de saucedemo.com.
 * Cubre los dos pasos: datos del comprador (step one) y resumen (step two).
 */
export class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    // Paso 1: información del comprador
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    // Paso 2: resumen y finalización
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  /**
   * Rellena los datos del comprador y continúa al resumen.
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} postalCode
   */
  async fillInformation(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  /**
   * Finaliza la compra desde la pantalla de resumen.
   */
  async finish() {
    await this.finishButton.click();
  }
}
