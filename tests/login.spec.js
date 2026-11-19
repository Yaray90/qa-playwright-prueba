// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';

test.describe('Login', () => {
  test('login correcto con standard_user muestra el listado de productos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(inventoryPage.inventoryList).toBeVisible();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('login fallido con contraseña incorrecta muestra mensaje de error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('login fallido con locked_out_user muestra mensaje de usuario bloqueado', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.'
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('login con usuario vacío muestra mensaje de usuario requerido', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('', 'secret_sauce');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username is required'
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('login con contraseña vacía muestra mensaje de contraseña requerida', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', '');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Password is required'
    );
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
