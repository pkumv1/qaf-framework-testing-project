// Playwright Test Script for Login Functionality
const { test, expect } = require('@playwright/test');

// TC-UI-001: Verify successful login with valid credentials
test('successful login with valid credentials', async ({ page }) => {
  await page.goto('https://demo.qmetry.com/bank/');
  
  // Fill login form
  await page.fill('#username', 'Bob');
  await page.fill('#password', 'Bob');
  
  // Submit form
  await page.click('#login');
  
  // Verify successful login
  await expect(page.locator('.logout')).toBeVisible();
  await expect(page).toHaveURL(/.*home/);
});

// TC-UI-002: Verify error message with invalid credentials
test('error message with invalid credentials', async ({ page }) => {
  await page.goto('https://demo.qmetry.com/bank/');
  
  // Fill login form with invalid credentials
  await page.fill('#username', 'invalid');
  await page.fill('#password', 'invalid');
  
  // Submit form
  await page.click('#login');
  
  // Verify error message
  await expect(page.locator('.error-message')).toBeVisible();
  await expect(page.locator('.error-message')).toContainText('Invalid credentials');
});

// TC-UI-003: Verify password masking functionality
test('password masking functionality', async ({ page }) => {
  await page.goto('https://demo.qmetry.com/bank/');
  
  // Check password field type
  const passwordField = page.locator('#password');
  await expect(passwordField).toHaveAttribute('type', 'password');
  
  // Enter password and verify it's masked
  await passwordField.fill('test123');
  await expect(passwordField).not.toHaveAttribute('value', 'test123');
});

// TC-UI-004: Verify "Remember Me" functionality
test('remember me functionality', async ({ page, context }) => {
  await page.goto('https://demo.qmetry.com/bank/');
  
  // Fill login form
  await page.fill('#username', 'Bob');
  await page.fill('#password', 'Bob');
  
  // Check remember me
  await page.check('#remember');
  
  // Submit form
  await page.click('#login');
  
  // Verify successful login
  await expect(page.locator('.logout')).toBeVisible();
  
  // Store cookies
  const cookies = await context.cookies();
  
  // Create a new page/session
  const newPage = await context.newPage();
  await newPage.goto('https://demo.qmetry.com/bank/');
  
  // Verify username is remembered
  await expect(newPage.locator('#username')).toHaveValue('Bob');
});