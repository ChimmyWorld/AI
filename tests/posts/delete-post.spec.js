// @ts-check
const { test, expect } = require('@playwright/test');
const { setupTestUserAndLogin } = require('../utils/auth-helpers');
const { waitForNetworkIdle, generateRandomString } = require('../utils/test-helpers');

test.describe('Delete Post', () => {
  let testUser;

  test.beforeEach(async ({ page }) => {
    // Setup a test user and login
    testUser = await setupTestUserAndLogin(page);
    
    // Create a test post that we'll delete in the test
    const postTitle = `Test Post to Delete ${generateRandomString(8)}`;
    const postContent = `This post will be deleted ${generateRandomString(16)}`;
    
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
  });

  test('should delete a post successfully', async ({ page }) => {
    // Find the post and access the menu
    const postCard = page.locator('.MuiCard-root').first();
    
    // Click the more options icon (vertical dots)
    await postCard.getByRole('button', { name: /more/i }).click();
    
    // Click on delete option
    await page.getByText('Delete Post').click();
    
    // Wait for deletion to complete
    await waitForNetworkIdle(page);
    
    // Verify that the post is no longer visible
    // We need to check for the specific post content that was in our test post
    await expect(page.getByText('Test Post to Delete')).not.toBeVisible();
  });
  
  test('should only show delete option for own posts', async ({ page, browser }) => {
    // Create a new browser context for a second user
    const secondContext = await browser.newContext();
    const secondUserPage = await secondContext.newPage();
    
    // Register and login with a second user
    const secondUser = await setupTestUserAndLogin(secondUserPage);
    
    // Have the second user navigate to the home page to see the first user's post
    await secondUserPage.goto('/');
    await waitForNetworkIdle(secondUserPage);
    
    // Find the post card
    const postCard = secondUserPage.locator('.MuiCard-root').first();
    
    // Verify the post is by the first user
    await expect(postCard.getByText(`Posted by ${testUser.username}`)).toBeVisible();
    
    // Verify the more options button is NOT visible for this user
    await expect(postCard.getByRole('button', { name: /more/i })).not.toBeVisible();
    
    // Clean up
    await secondContext.close();
  });
});
