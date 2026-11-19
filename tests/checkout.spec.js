// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('compra completa de principio a fin muestra el mensaje de agradecimiento', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.fillInformation('Test', 'User', '28001');
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  // Casos data-driven: cada objeto describe un escenario de campo obligatorio
  // vacío junto al mensaje de error que debe mostrar el checkout.
  const requiredFieldCases = [
    { nombre: 'nombre vacío', firstName: '', lastName: 'User', postalCode: '28001', error: 'Error: First Name is required' },
    { nombre: 'apellido vacío', firstName: 'Test', lastName: '', postalCode: '28001', error: 'Error: Last Name is required' },
    { nombre: 'código postal vacío', firstName: 'Test', lastName: 'User', postalCode: '', error: 'Error: Postal Code is required' },
  ];

  for (const caso of requiredFieldCases) {
    test(`validación de campo obligatorio: ${caso.nombre}`, async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.goToCart();
      await cartPage.checkout();

      await checkoutPage.fillInformation(caso.firstName, caso.lastName, caso.postalCode);

      await expect(checkoutPage.errorMessage).toHaveText(caso.error);
    });
  }
});
