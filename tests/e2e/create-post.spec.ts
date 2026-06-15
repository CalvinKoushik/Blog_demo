import { test, expect } from '@playwright/test';

test.describe('Create Post Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    firstName: 'Author',
    lastName: 'One',
    email: `author${timestamp}@example.com`,
    password: 'Password123!',
    username: `author${timestamp}`,
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

  test('should create and publish a post', async ({ page }) => {
    await page.goto('/post/new');

    const postTitle = `My E2E Test Post ${timestamp}`;
    
    // Fill title
    await page.fill('input[placeholder="Post Title..."]', postTitle);
    
    // Select category (assuming 'Web Development' is the first or accessible)
    // We can select by option index if value isn't known, or just pick the first valid option.
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption({ index: 1 }); // Pick first actual category

    // Type content in Tiptap editor (contenteditable)
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill(`This is the content of the E2E test post ${timestamp}. It has enough characters to pass validation.`);

    // Click publish
    await page.click('button:has-text("Publish")');

    // Should redirect to post detail page
    await expect(page).toHaveURL(/\/post\/my-e2e-test-post/);
    await expect(page.locator(`text=${postTitle}`)).toBeVisible();

    // Verify it appears in the home feed
    await page.goto('/');
    await expect(page.locator(`text=${postTitle}`).first()).toBeVisible();
  });
});
