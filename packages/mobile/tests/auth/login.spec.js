// @ts-check
const { test, expect } = require('@playwright/test');
const { registerTestUser } = require('../utils/auth-helpers');
const { waitForNetworkIdle } = require('../utils/test-helpers');

test.describe('User Login', () => {
  let testUser;

  test.beforeEach(async ({ page }) => {
    // Register a test user before each test
    testUser = await registerTestUser(page);
    // Navigate back to login page
    await page.goto('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.getByLabel('Username or Email').fill(testUser.username);
    await page.getByLabel('Password').fill(testUser.password);
    
    // Submit login form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation and API calls to complete
    await waitForNetworkIdle(page);
    
    // Verify successful login by checking for elements on the home page
    await expect(page.getByText(`Welcome back, ${testUser.username}`)).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in login form with incorrect password
    await page.getByLabel('Username or Email').fill(testUser.username);
    await page.getByLabel('Password').fill('WrongPassword123!');
    
    // Submit login form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for API call to complete
    await waitForNetworkIdle(page);
    
    // Verify error message is displayed
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should navigate to register page from login page', async ({ page }) => {
    // Click on register link
    await page.getByRole('link', { name: 'Register' }).click();
    
    // Verify navigation to register page
    await expect(page).toHaveURL('/register');
  });
});
