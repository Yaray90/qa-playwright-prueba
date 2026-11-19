// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';

// Prueba de compra E2E que muestra el mensaje de agradecimiento
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
});
