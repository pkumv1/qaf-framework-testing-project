// Selenium Test Script for Login Functionality
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Login Functionality Tests', function() {
  let driver;
  
  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: 10000 });
  });
  
  afterEach(async function() {
    await driver.quit();
  });
  
  // TC-UI-001: Verify successful login with valid credentials
  it('should login successfully with valid credentials', async function() {
    await driver.get('https://demo.qmetry.com/bank/');
    
    await driver.findElement(By.id('username')).sendKeys('Bob');
    await driver.findElement(By.id('password')).sendKeys('Bob');
    await driver.findElement(By.id('login')).click();
    
    const logoutElement = await driver.wait(until.elementLocated(By.className('logout')), 10000);
    const isLogoutDisplayed = await logoutElement.isDisplayed();
    assert.strictEqual(isLogoutDisplayed, true, 'Logout button should be visible after login');
    
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes('home'), 'URL should contain "home" after successful login');
  });
  
  // TC-UI-002: Verify error message with invalid credentials
  it('should show error message with invalid credentials', async function() {
    await driver.get('https://demo.qmetry.com/bank/');
    
    await driver.findElement(By.id('username')).sendKeys('invalid');
    await driver.findElement(By.id('password')).sendKeys('invalid');
    await driver.findElement(By.id('login')).click();
    
    const errorElement = await driver.wait(until.elementLocated(By.className('error-message')), 10000);
    const errorMessage = await errorElement.getText();
    assert.ok(errorMessage.includes('Invalid credentials'), 'Error message should indicate invalid credentials');
  });
  
  // TC-UI-003: Verify password masking functionality
  it('should mask password input', async function() {
    await driver.get('https://demo.qmetry.com/bank/');
    
    const passwordField = await driver.findElement(By.id('password'));
    const fieldType = await passwordField.getAttribute('type');
    assert.strictEqual(fieldType, 'password', 'Password field should have type="password"');
    
    await passwordField.sendKeys('test123');
    const fieldValue = await passwordField.getAttribute('value');
    assert.notStrictEqual(fieldValue, 'test123', 'Password should be masked');
  });
  
  // TC-UI-004: Verify "Remember Me" functionality
  it('should remember username when "Remember Me" is checked', async function() {
    await driver.get('https://demo.qmetry.com/bank/');
    
    await driver.findElement(By.id('username')).sendKeys('Bob');
    await driver.findElement(By.id('password')).sendKeys('Bob');
    await driver.findElement(By.id('remember')).click();
    await driver.findElement(By.id('login')).click();
    
    // Verify login successful
    const logoutElement = await driver.wait(until.elementLocated(By.className('logout')), 10000);
    assert.ok(await logoutElement.isDisplayed(), 'Should be logged in');
    
    // Logout and navigate back to login page
    await logoutElement.click();
    await driver.navigate().to('https://demo.qmetry.com/bank/');
    
    // Verify username is remembered
    const usernameValue = await driver.findElement(By.id('username')).getAttribute('value');
    assert.strictEqual(usernameValue, 'Bob', 'Username should be remembered');
  });
});