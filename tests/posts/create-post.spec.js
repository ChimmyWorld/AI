// @ts-check
const { test, expect } = require('@playwright/test');
const { setupTestUserAndLogin } = require('../utils/auth-helpers');
const { waitForNetworkIdle, generateRandomString } = require('../utils/test-helpers');
const path = require('path');

test.describe('Create Post', () => {
  let testUser;

  test.beforeEach(async ({ page }) => {
    // Setup a test user and login
    testUser = await setupTestUserAndLogin(page);
  });

  test('should create a text post successfully', async ({ page }) => {
    // Generate random test data
    const postTitle = `Test Post ${generateRandomString(8)}`;
    const postContent = `This is a test post content ${generateRandomString(16)}`;

    // Click on new post button
    await page.getByRole('button', { name: 'New Post' }).click();
    
    // Fill in post form
    await page.getByLabel('Title').fill(postTitle);
    await page.getByLabel('Content').fill(postContent);
    
    // Submit form
    await page.getByRole('button', { name: 'Post' }).click();
    
    // Wait for post to be created
    await waitForNetworkIdle(page);
    
    // Verify post appears in the feed
    await expect(page.getByText(postTitle)).toBeVisible();
    await expect(page.getByText(postContent)).toBeVisible();
  });

  test('should create a post with image', async ({ page }) => {
    // Generate random test data
    const postTitle = `Image Post ${generateRandomString(8)}`;
    const postContent = `This is a test post with image ${generateRandomString(16)}`;
    
    // Click on new post button
    await page.getByRole('button', { name: 'New Post' }).click();
    
    // Fill in post form
    await page.getByLabel('Title').fill(postTitle);
    await page.getByLabel('Content').fill(postContent);
    
    // Upload image
    // Note: You'll need to have a test image file available
    const testImagePath = path.join(__dirname, '..', 'fixtures', 'test-image.jpg');
    await page.getByLabel('Upload Media', { exact: false }).setInputFiles(testImagePath);
    
    // Submit form
    await page.getByRole('button', { name: 'Post' }).click();
    
    // Wait for post to be created
    await waitForNetworkIdle(page);
    
    // Verify post appears in the feed
    await expect(page.getByText(postTitle)).toBeVisible();
    await expect(page.getByText(postContent)).toBeVisible();
    // Check for image element
    await expect(page.locator('img[alt="Post media"]')).toBeVisible();
  });
});
