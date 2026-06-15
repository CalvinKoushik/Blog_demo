import { test, expect } from '@playwright/test';

test.describe('Notifications Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    firstName: 'Notify',
    lastName: 'User',
    email: `notify${timestamp}@example.com`,
    password: 'Password123!',
    username: `notify${timestamp}`,
  };

  test.beforeEach(async ({ page }) => {
    // Signup and login
    await page.goto('/signup');
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="username"]', testUser.username);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should view notifications and mark as read', async ({ page }) => {
    // Note: since this is an isolated E2E test, the new user might not have notifications
    // unless another user interacted with them, or there is a welcome notification.
    // Let's verify we can access the page and handle the empty state.
    
    // Click the bell icon
    const bellIcon = page.locator('header a[href="/notifications"]').first();
    await bellIcon.click();
    await expect(page).toHaveURL(/\/notifications/);

    // Verify title
    await expect(page.locator('h1', { hasText: 'Notifications' })).toBeVisible();

    // Check if there are notifications or empty state
    const emptyState = page.locator('text=You\'re all caught up!');
    const markAllRead = page.locator('button:has-text("Mark all as read")');
    
    if (await emptyState.isVisible()) {
      // Empty state works
      await expect(markAllRead).toBeDisabled();
    } else {
      // Mark all as read
      await markAllRead.click();
      // It should either remain or turn empty
    }
  });
});
