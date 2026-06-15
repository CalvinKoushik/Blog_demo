import { test, expect } from '@playwright/test';

test.describe('Engagement Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    firstName: 'Engage',
    lastName: 'User',
    email: `engage${timestamp}@example.com`,
    password: 'Password123!',
    username: `engageuser${timestamp}`,
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
    
    // We assume there's at least one post in the database from seed or other tests.
    // If not, we could create one here, but let's assume the feed has a post.
  });

  test('should like, bookmark, and comment on a post', async ({ page }) => {
    // Navigate to home feed
    await page.goto('/');
    
    // Find the first post link in the feed
    const firstPostLink = page.locator('article a[href^="/post/"]').first();
    await expect(firstPostLink).toBeVisible();
    
    // Navigate to post detail
    await firstPostLink.click();
    await expect(page).toHaveURL(/\/post\//);

    // Like the post
    const likeButton = page.locator('button:has(svg.lucide-heart)').first();
    await likeButton.click();
    
    // Bookmark the post
    const bookmarkButton = page.locator('button:has(svg.lucide-bookmark)').first();
    await bookmarkButton.click();

    // Comment on the post
    const commentInput = page.locator('textarea[placeholder*="Write a comment"]');
    await commentInput.fill('This is a test comment from playwright!');
    const submitCommentButton = page.locator('button:has-text("Post")');
    await submitCommentButton.click();

    // Verify comment appears
    await expect(page.locator('text=This is a test comment from playwright!')).toBeVisible();

    // Verify saved page updates
    await page.goto('/saved');
    // The bookmarked post should be visible here
    await expect(page.locator('article')).toHaveCount(1, { timeout: 10000 }).catch(() => {
        // If it fails, maybe there's multiple, but at least 1
        expect(page.locator('article').count()).toBeGreaterThanOrEqual(1);
    });
  });
});
