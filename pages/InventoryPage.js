// @ts-check

/**
 * Page Object del listado de productos (inventory) de saucedemo.com.
 */
export class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.inventoryList = page.locator('[data-test="inventory-list"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  /**
   * Añade un producto al carrito localizando su tarjeta por el nombre visible
   * y pulsando el botón de esa tarjeta.
   * @param {string} item
   */
  async addToCart(item) {
    const card = this.page.locator('[data-test="inventory-item"]').filter({ hasText: item });
    await card.locator('button').click();
  }

  /**
   * Abre el carrito.
   */
  async goToCart() {
    await this.cartLink.click();
  }
}
