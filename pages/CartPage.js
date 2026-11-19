// @ts-check

/**
 * Page Object del carrito de compra de saucedemo.com.
 */
export class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  /**
   * Avanza al proceso de checkout.
   */
  async checkout() {
    await this.checkoutButton.click();
  }
}
