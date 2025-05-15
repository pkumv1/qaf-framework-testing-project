// Puppeteer Test Script for Login Functionality
const puppeteer = require('puppeteer');
const { expect } = require('chai');

describe('Login Functionality Tests', function() {
  let browser;
  let page;
  
  before(async function() {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      args: ['--start-maximized']
    });
  });
  
  beforeEach(async function() {
    page = await browser.newPage();
    await page.goto('https://demo.qmetry.com/bank/');
  });
  
  afterEach(async function() {
    await page.close();
  });
  
  after(async function() {
    await browser.close();
  });
  
  // TC-UI-001: Verify successful login with valid credentials
  it('should login successfully with valid credentials', async function() {
    await page.type('#username', 'Bob');
    await page.type('#password', 'Bob');
    await page.click('#login');
    
    // Wait for navigation to complete
    await page.waitForSelector('.logout', { visible: true });
    
    // Verify login was successful
    const logoutButton = await page.$('.logout');
    expect(logoutButton).to.not.be.null;
    
    const url = page.url();
    expect(url).to.include('home');
  });
  
  // TC-UI-002: Verify error message with invalid credentials
  it('should show error message with invalid credentials', async function() {
    await page.type('#username', 'invalid');
    await page.type('#password', 'invalid');
    await page.click('#login');
    
    // Wait for error message
    await page.waitForSelector('.error-message', { visible: true });
    
    // Verify error message content
    const errorText = await page.$eval('.error-message', el => el.textContent);
    expect(errorText).to.include('Invalid credentials');
  });
  
  // TC-UI-003: Verify password masking functionality
  it('should mask password input', async function() {
    // Check password field type
    const passwordType = await page.$eval('#password', el => el.type);
    expect(passwordType).to.equal('password');
    
    // Enter password
    await page.type('#password', 'test123');
    
    // Check that value is not visible as plain text
    const value = await page.$eval('#password', el => el.value);
    expect(value).to.not.be.null;
    expect(value).to.not.equal(''); // Password field has some value
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'results/password_masking.png' });
  });
  
  // TC-UI-004: Verify "Remember Me" functionality
  it('should remember username when "Remember Me" is checked', async function() {
    // Login with "Remember Me" checked
    await page.type('#username', 'Bob');
    await page.type('#password', 'Bob');
    await page.click('#remember');
    await page.click('#login');
    
    // Verify login successful
    await page.waitForSelector('.logout', { visible: true });
    
    // Logout and navigate back to login page
    await page.click('.logout');
    await page.goto('https://demo.qmetry.com/bank/');
    
    // Verify username is remembered
    const usernameValue = await page.$eval('#username', el => el.value);
    expect(usernameValue).to.equal('Bob');
  });
});