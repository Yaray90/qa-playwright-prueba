// @ts-check

/**
 * Page Object de la pantalla de login de saucedemo.com.
 */
export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Navega a la página de login.
   */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  /**
   * Rellena credenciales y envía el formulario.
   * @param {string} user
   * @param {string} pass
   */
  async login(user, pass) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}
