import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${timestamp}@example.com`,
    password: 'Password123!',
    nickname: `testuser${timestamp}`,
    collegeName: 'Playwright University',
    department: 'CS',
    year: '1',
    linkedinUrl: 'https://linkedin.com/in/test'
  };

  test('should sign up successfully', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.fill('input[name="nickname"]', testUser.nickname);
    await page.fill('input[name="collegeName"]', testUser.collegeName);
    await page.fill('input[name="department"]', testUser.department);
    await page.selectOption('select[name="year"]', testUser.year);
    await page.fill('input[name="linkedinUrl"]', testUser.linkedinUrl);

    await page.click('button[type="submit"]');

    // Verify successful signup redirects to home (feed)
    await expect(page).toHaveURL('/');
    // Check if user is logged in (e.g., avatar trigger exists)
    await expect(page.locator('button:has-text("TU")')).toBeVisible();
  });

  test('should login and logout successfully', async ({ page }) => {
    // We assume the user from the previous test or a seeded user exists
    // For reliability in a fresh run, we'll try to signup first if we want, or just rely on a seeded user.
    // For this test, let's just use the seeded test user from prisma/seed.ts if it exists, or create a new one.
    
    // Actually, tests in Playwright run in parallel by default, so state sharing requires care.
    // Let's create a fresh user for this test.
    const loginUser = {
      ...testUser,
      email: `login${timestamp}@example.com`,
      nickname: `loginuser${timestamp}`,
    };

    // Signup
    await page.goto('/signup');
    await page.fill('input[name="firstName"]', loginUser.firstName);
    await page.fill('input[name="lastName"]', loginUser.lastName);
    await page.fill('input[name="email"]', loginUser.email);
    await page.fill('input[name="password"]', loginUser.password);
    await page.fill('input[name="confirmPassword"]', loginUser.password);
    await page.fill('input[name="nickname"]', loginUser.nickname);
    await page.fill('input[name="collegeName"]', loginUser.collegeName);
    await page.fill('input[name="department"]', loginUser.department);
    await page.selectOption('select[name="year"]', loginUser.year);
    await page.fill('input[name="linkedinUrl"]', loginUser.linkedinUrl);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // User is automatically logged in after signup. Log out first to test login.
    await page.locator('button:has-text("TU")').click(); // Avatar trigger
    await page.click('text=Log out');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', loginUser.email);
    await page.fill('input[name="password"]', loginUser.password);
    await page.click('button[type="submit"]');

    // Verify login success redirects to home
    await expect(page).toHaveURL('/');
    
    // Open profile dropdown and logout
    await page.locator('button:has-text("TU")').click(); // Avatar trigger
    await page.click('text=Log out');

    // Verify logout
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should redirect to login for protected routes', async ({ page }) => {
    await page.goto('/post/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});
