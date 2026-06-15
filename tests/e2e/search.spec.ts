import { test, expect } from '@playwright/test';

test.describe('Search Flow', () => {
  test('should search and filter posts', async ({ page }) => {
    await page.goto('/');

    // Navbar search
    const searchInput = page.locator('header input[placeholder*="Search"]').first();
    await searchInput.fill('test');
    await searchInput.press('Enter');

    // Should redirect to search page
    await expect(page).toHaveURL(/search\?q=test/);
    await expect(page.locator('h1', { hasText: 'Search' })).toBeVisible();

    // Filter by type (people vs posts)
    const peopleTab = page.locator('button[role="tab"]:has-text("People")');
    await peopleTab.click();
    await expect(page).toHaveURL(/type=people/);

    // Filter by category
    const postsTab = page.locator('button[role="tab"]:has-text("Posts")');
    await postsTab.click();

    // Assuming we have a category select, change it
    const categorySelect = page.locator('select').first();
    // we just select index 1 if it exists
    const options = await categorySelect.locator('option').count();
    if (options > 1) {
      await categorySelect.selectOption({ index: 1 });
      await expect(page).toHaveURL(/category=/);
    }
    
    // Open a search result if any
    const firstResult = page.locator('article a[href^="/post/"]').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await expect(page).toHaveURL(/\/post\//);
    }
  });
});
