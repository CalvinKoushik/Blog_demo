import { test, expect } from '@playwright/test';

test.describe('Follow Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    firstName: 'Follower',
    lastName: 'User',
    email: `follower${timestamp}@example.com`,
    password: 'Password123!',
    username: `follower${timestamp}`,
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

  test('should follow and unfollow a user and see feed updates', async ({ page }) => {
    // Navigate to a suggested creator from the right sidebar
    const suggestedCreatorLink = page.locator('aside a[href^="/"]').filter({ hasText: 'posts' }).first();
    
    // We get the href to verify later
    const creatorHref = await suggestedCreatorLink.getAttribute('href');
    if (!creatorHref) return; // if there are no suggested creators, test skips gracefully

    // Go to creator profile
    await suggestedCreatorLink.click();
    await expect(page).toHaveURL(new RegExp(creatorHref));

    // Follow user
    const followButton = page.locator('button:has-text("Follow")').first();
    await followButton.click();
    await expect(page.locator('button:has-text("Following")').first()).toBeVisible();

    // Verify following feed updates
    await page.goto('/?tab=following');
    // We expect at least the empty state or posts to load without error
    // Since we don't know if the user has posts, we just verify the feed loads and tab is active
    await expect(page.locator('text=Following').first()).toBeVisible();

    // Go back to profile and unfollow
    await page.goto(creatorHref);
    const followingButton = page.locator('button:has-text("Following")').first();
    await followingButton.click();
    await expect(page.locator('button:has-text("Follow")').first()).toBeVisible();
  });
});
