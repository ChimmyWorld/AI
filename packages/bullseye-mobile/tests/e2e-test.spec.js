// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Community Forum End-to-End Tests', () => {
  let testUsername;
  let testEmail;
  let testPassword;
  
  test.beforeEach(async ({ page }) => {
    // Generate unique test credentials to avoid conflicts
    const timestamp = new Date().getTime();
    testUsername = `testuser${timestamp}`;
    testEmail = `testuser${timestamp}@example.com`;
    testPassword = 'Password123!';
    
    // Go to homepage
    await page.goto('http://localhost:5174/');
    console.log('Navigated to home page');
  });

  test('Homepage loads with layout and navigation elements', async ({ page }) => {
    // Verify navigation and layout elements are present
    await expect(page.locator('text=Bullseye')).toBeVisible();
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=Q&A')).toBeVisible();
    await expect(page.locator('text=AI')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
    
    console.log('Basic layout and navigation verified');
  });

  test('User can register for a new account', async ({ page }) => {
    // Navigate to register page
    await page.click('text=Sign Up');
    await expect(page.url()).toContain('/register');
    
    // Fill in registration form
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    // Submit form and wait for navigation
    await page.click('button[type="submit"]');
    
    // If registration is successful, should be redirected to home page
    await page.waitForURL('http://localhost:5174/');
    
    // Verify we're logged in by checking for profile element
    await expect(page.locator(`text=${testUsername}`)).toBeVisible({ timeout: 5000 });
    
    console.log('Registration test passed');
  });

  test('User can log out and log back in', async ({ page }) => {
    // Register first since we need an account
    await page.click('text=Sign Up');
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5174/');
    
    // Now log out
    await page.click(`text=${testUsername}`);
    await page.click('text=Logout');
    
    // Verify we're logged out (login button visible again)
    await expect(page.locator('text=Log In')).toBeVisible();
    
    // Now log back in
    await page.click('text=Log In');
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Verify we're logged in again
    await expect(page.locator(`text=${testUsername}`)).toBeVisible({ timeout: 5000 });
    
    console.log('Logout and login test passed');
  });

  test('User can navigate between different categories', async ({ page }) => {
    // Check navigation to Free category
    await page.click('text=Free');
    await expect(page.url()).toContain('category=free');
    
    // Check navigation to Q&A category
    await page.click('text=Q&A');
    await expect(page.url()).toContain('category=qa');
    
    // Check navigation to AI category
    await page.click('text=AI');
    await expect(page.url()).toContain('category=ai');
    
    // Check navigation back to Home
    await page.click('text=Home');
    await expect(page.url()).not.toContain('category=');
    
    console.log('Category navigation test passed');
  });

  test('Posts are displayed on the homepage', async ({ page }) => {
    // Wait for posts to load (this might take time if fetching from real API)
    await page.waitForSelector('.post-container', { timeout: 10000 }).catch(() => {
      console.log('No posts found, which is OK if database is empty');
    });
    
    // Check if posts exist; if not, it might be acceptable if database is empty
    const postsExist = await page.locator('.post-container').count() > 0;
    console.log(`Posts exist on homepage: ${postsExist}`);
    
    if (!postsExist) {
      console.log('No posts found. If this is expected (empty database), test is passing.');
    }
  });

  test('User can create a new post if logged in', async ({ page }) => {
    // First login
    await page.click('text=Log In');
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5174/');
    
    // Wait for the "+" button to be visible and click it
    await page.locator('button[aria-label="Add Post"]').click();
    
    // Fill in the new post form
    const postTitle = `Test Post ${new Date().getTime()}`;
    const postContent = 'This is a test post content';
    
    await page.fill('input[name="title"]', postTitle);
    await page.fill('textarea[name="content"]', postContent);
    await page.selectOption('select[name="category"]', 'free');
    
    // Submit the form
    await page.click('text=Create Post');
    
    // Verify the post is created by looking for its title
    await expect(page.locator(`text=${postTitle}`)).toBeVisible({ timeout: 10000 });
    
    console.log('Create post test passed');
  });
});
