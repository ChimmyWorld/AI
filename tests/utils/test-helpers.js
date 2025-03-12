// @ts-check
const { expect } = require('@playwright/test');

/**
 * Generate random string for test data
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
function generateRandomString(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Get unique username for test
 * @returns {string} - Unique username
 */
function getUniqueUsername() {
  return `test_user_${generateRandomString(8)}`;
}

/**
 * Get unique email for test
 * @returns {string} - Unique email
 */
function getUniqueEmail() {
  return `test_${generateRandomString(8)}@example.com`;
}

/**
 * Wait for network idle (useful after actions that trigger API calls)
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (error) {
    console.warn('Network did not reach idle state in time, continuing anyway');
  }
}

/**
 * Assert toast notification appears with specific text
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} text - Text to look for in toast
 * @param {number} timeout - Timeout in milliseconds
 */
async function assertToastMessage(page, text, timeout = 5000) {
  const toastLocator = page.getByText(text, { exact: false });
  await expect(toastLocator).toBeVisible({ timeout });
}

module.exports = {
  generateRandomString,
  getUniqueUsername,
  getUniqueEmail,
  waitForNetworkIdle,
  assertToastMessage,
};
