// @ts-check
const { test, expect } = require('@playwright/test');
const { setupTestUserAndLogin, loginUser } = require('../utils/auth-helpers');
const { waitForNetworkIdle, generateRandomString } = require('../utils/test-helpers');

test.describe('Post Voting Functionality', () => {
  let testUser;
  let postTitle;

  test.beforeEach(async ({ page }) => {
    // Setup a test user and login
    testUser = await setupTestUserAndLogin(page);
    
    // Create a test post that we'll vote on
    postTitle = `Test Post for Voting ${generateRandomString(8)}`;
    const postContent = `This post will be voted on ${generateRandomString(16)}`;
    
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

  test('should upvote a post successfully', async ({ page }) => {
    // Find the post
    const postCard = page.locator('.MuiCard-root').filter({ hasText: postTitle }).first();
    
    // Initial vote count should be 0
    await expect(postCard.locator('text=0')).toBeVisible();
    
    // Click the upvote button
    await postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowUpwardIcon"]') }).click();
    
    // Wait for vote to be registered
    await waitForNetworkIdle(page);
    
    // Verify vote count increased to 1
    await expect(postCard.locator('text=1')).toBeVisible();
    
    // Verify upvote button is highlighted (primary color)
    const upvoteButton = postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowUpwardIcon"]') });
    await expect(upvoteButton).toHaveClass(/primary/);
  });
  
  test('should downvote a post successfully', async ({ page }) => {
    // Find the post
    const postCard = page.locator('.MuiCard-root').filter({ hasText: postTitle }).first();
    
    // Initial vote count should be 0
    await expect(postCard.locator('text=0')).toBeVisible();
    
    // Click the downvote button
    await postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowDownwardIcon"]') }).click();
    
    // Wait for vote to be registered
    await waitForNetworkIdle(page);
    
    // Verify vote count decreased to -1
    await expect(postCard.locator('text=-1')).toBeVisible();
    
    // Verify downvote button is highlighted (primary color)
    const downvoteButton = postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowDownwardIcon"]') });
    await expect(downvoteButton).toHaveClass(/primary/);
  });

  test('should toggle votes when clicking different vote buttons', async ({ page }) => {
    // Find the post
    const postCard = page.locator('.MuiCard-root').filter({ hasText: postTitle }).first();
    
    // Initial vote count should be 0
    await expect(postCard.locator('text=0')).toBeVisible();
    
    // Click the upvote button
    await postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowUpwardIcon"]') }).click();
    await waitForNetworkIdle(page);
    
    // Verify vote count increased to 1
    await expect(postCard.locator('text=1')).toBeVisible();
    
    // Now click the downvote button
    await postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowDownwardIcon"]') }).click();
    await waitForNetworkIdle(page);
    
    // Verify vote count changed to -1 (removed upvote and added downvote)
    await expect(postCard.locator('text=-1')).toBeVisible();
    
    // Verify upvote button is no longer highlighted
    const upvoteButton = postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowUpwardIcon"]') });
    await expect(upvoteButton).not.toHaveClass(/primary/);
    
    // Verify downvote button is highlighted
    const downvoteButton = postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowDownwardIcon"]') });
    await expect(downvoteButton).toHaveClass(/primary/);
  });
  
  test('should persist vote state in post detail view', async ({ page }) => {
    // Find the post
    const postCard = page.locator('.MuiCard-root').filter({ hasText: postTitle }).first();
    
    // Click the upvote button
    await postCard.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowUpwardIcon"]') }).click();
    await waitForNetworkIdle(page);
    
    // Navigate to post detail view
    await postCard.locator(`text=${postTitle}`).click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/\/post\/[a-f0-9]+/);
    
    // Verify vote count is still 1
    await expect(page.locator('text=1')).toBeVisible();
    
    // Verify upvote button is still highlighted
    const detailUpvoteButton = page.getByRole('button').filter({ has: page.locator('svg[data-testid="ArrowUpwardIcon"]') });
    await expect(detailUpvoteButton).toHaveClass(/primary/);
  });
});
