// @ts-check
const { test, expect } = require('@playwright/test');
const { setupTestUserAndLogin } = require('../utils/auth-helpers');
const { waitForNetworkIdle, generateRandomString } = require('../utils/test-helpers');

test.describe('Comments Functionality', () => {
  let testUser;
  let postTitle;

  test.beforeEach(async ({ page }) => {
    // Setup a test user and login
    testUser = await setupTestUserAndLogin(page);
    
    // Create a test post that we'll comment on
    postTitle = `Test Post for Comments ${generateRandomString(8)}`;
    const postContent = `This post will receive comments ${generateRandomString(16)}`;
    
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

  test('should be able to open and view comments section', async ({ page }) => {
    // Find the post
    const postCard = page.locator('.MuiCard-root').filter({ hasText: postTitle }).first();
    
    // Click on comments section to expand it
    await postCard.getByText('comments', { exact: false }).click();
    
    // Verify that the comments section is now visible
    await expect(postCard.getByText('No comments yet')).toBeVisible();
  });
  
  test('should add a comment successfully', async ({ page }) => {
    // Find the post
    const postCard = page.locator('.MuiCard-root').filter({ hasText: postTitle }).first();
    
    // Click on comments section to expand it
    await postCard.getByText('comments', { exact: false }).click();
    
    // Wait for comments section to expand
    await expect(postCard.locator('input[placeholder="Add a comment..."]')).toBeVisible();
    
    // Generate random comment text
    const commentText = `This is a test comment ${generateRandomString(12)}`;
    
    // Enter the comment
    await postCard.locator('input[placeholder="Add a comment..."]').fill(commentText);
    
    // Submit the comment
    await postCard.getByRole('button', { name: 'Post' }).click();
    
    // Wait for the comment to be added
    await waitForNetworkIdle(page);
    
    // Verify the comment appears
    await expect(postCard.getByText(commentText)).toBeVisible();
    await expect(postCard.getByText(testUser.username, { exact: false })).toBeVisible();
  });
  
  test('should be able to navigate to post detail and see comments', async ({ page }) => {
    // Add a comment first
    const commentText = `Detail view comment test ${generateRandomString(12)}`;
    
    // Find the post
    const postCard = page.locator('.MuiCard-root').filter({ hasText: postTitle }).first();
    
    // Click on comments section to expand it
    await postCard.getByText('comments', { exact: false }).click();
    
    // Enter the comment
    await postCard.locator('input[placeholder="Add a comment..."]').fill(commentText);
    
    // Submit the comment
    await postCard.getByRole('button', { name: 'Post' }).click();
    
    // Wait for the comment to be added
    await waitForNetworkIdle(page);
    
    // Now click on the post title/content to navigate to post detail
    await postCard.locator(`text=${postTitle}`).click();
    
    // Wait for navigation and verify we're on the post detail page
    await expect(page).toHaveURL(/\/post\/[a-f0-9]+/);
    
    // Verify the post and comment are visible on the detail page
    await expect(page.getByText(postTitle)).toBeVisible();
    await expect(page.getByText(commentText)).toBeVisible();
  });
});
