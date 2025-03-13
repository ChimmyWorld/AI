// @ts-check
const { expect } = require('@playwright/test');
const { getUniqueUsername, getUniqueEmail, waitForNetworkIdle } = require('./test-helpers');

/**
 * Register a new test user
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} options - Registration options
 * @param {string} [options.username] - Username for registration
 * @param {string} [options.email] - Email for registration
 * @param {string} [options.password] - Password for registration
 * @returns {Promise<{username: string, email: string, password: string}>} - Registered user credentials
 */
async function registerTestUser(page, options = {}) {
  const username = options.username || getUniqueUsername();
  const email = options.email || getUniqueEmail();
  const password = options.password || 'Password123!';

  // Navigate to register page
  await page.goto('/register');
  
  // Fill registration form
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password').fill(password);
  
  // Submit form
  await page.getByRole('button', { name: 'Register' }).click();
  
  // Wait for registration to complete
  await waitForNetworkIdle(page);
  
  return { username, email, password };
}

/**
 * Login a user
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} usernameOrEmail - Username or email for login
 * @param {string} password - Password for login
 */
async function loginUser(page, usernameOrEmail, password) {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form
  await page.getByLabel('Username or Email').fill(usernameOrEmail);
  await page.getByLabel('Password').fill(password);
  
  // Submit form
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Wait for login to complete
  await waitForNetworkIdle(page);
  
  // Verify navigation to home or dashboard after login
  await expect(page).toHaveURL(/^\/(home|profile|$)/);
}

/**
 * Logout current user
 * @param {import('@playwright/test').Page} page - Playwright page
 */
async function logoutUser(page) {
  // Click on user menu to show logout option
  await page.getByRole('button', { name: 'User Menu' }).click();
  
  // Click logout
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  
  // Wait for logout to complete
  await waitForNetworkIdle(page);
  
  // Verify navigation to home or login page
  await expect(page).toHaveURL(/^\/(login|$)/);
}

/**
 * Setup a test user and login
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {Object} [options] - Options for test user
 * @returns {Promise<{username: string, email: string, password: string}>} - Test user credentials
 */
async function setupTestUserAndLogin(page, options = {}) {
  const user = await registerTestUser(page, options);
  await loginUser(page, user.username, user.password);
  return user;
}

module.exports = {
  registerTestUser,
  loginUser,
  logoutUser,
  setupTestUserAndLogin,
};
