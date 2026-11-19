// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';
import { CartPage } from '../pages/CartPage.js';

test.describe('Carrito', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('añadir un producto actualiza el contador y lo muestra en el carrito', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addToCart('Sauce Labs Backpack');

    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItems).toContainText('Sauce Labs Backpack');
  });
});
