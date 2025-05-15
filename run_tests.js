#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const config = {
  playwright: {
    command: 'npx playwright test test_scripts/playwright/',
    outputDir: 'results/playwright'
  },
  selenium: {
    command: 'npx mocha test_scripts/selenium/ --timeout 30000',
    outputDir: 'results/selenium'
  },
  puppeteer: {
    command: 'npx mocha test_scripts/puppeteer/ --timeout 30000',
    outputDir: 'results/puppeteer'
  }
};

// Create results directories if they don't exist
Object.values(config).forEach(({ outputDir }) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
});

// Run all tests and collect results
async function runTests() {
  const results = {};
  
  // Run tests for each framework
  for (const [framework, { command, outputDir }] of Object.entries(config)) {
    console.log(`Running ${framework} tests...`);
    try {
      const output = execSync(command, { encoding: 'utf8' });
      results[framework] = { success: true, output };
      fs.writeFileSync(path.join(outputDir, 'test_output.txt'), output);
      console.log(`${framework} tests completed successfully.`);
    } catch (error) {
      results[framework] = { success: false, output: error.stdout };
      fs.writeFileSync(path.join(outputDir, 'test_output.txt'), error.stdout);
      console.error(`${framework} tests failed.`);
    }
  }
  
  return results;
}

// Generate PDF report
async function generatePdfReport(results) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Create HTML content
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>QAF Testing Project - Test Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .framework { margin-bottom: 30px; }
          .framework h2 { color: #555; }
          .success { color: green; }
          .failure { color: red; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>QAF Testing Project - Test Results</h1>
        <div class="summary">
          <h2>Summary</h2>
          <ul>
            ${Object.entries(results).map(([framework, { success }]) => 
              `<li>${framework}: <span class="${success ? 'success' : 'failure'}">${success ? 'PASSED' : 'FAILED'}</span></li>`
            ).join('')}
          </ul>
        </div>
        ${Object.entries(results).map(([framework, { success, output }]) => `
          <div class="framework">
            <h2>${framework} Results</h2>
            <div class="status">Status: <span class="${success ? 'success' : 'failure'}">${success ? 'PASSED' : 'FAILED'}</span></div>
            <h3>Output:</h3>
            <pre>${output}</pre>
          </div>
        `).join('')}
      </body>
    </html>
  `;
  
  // Write HTML file
  fs.writeFileSync('results/test_report.html', html);
  
  // Generate PDF
  await page.setContent(html);
  await page.pdf({ path: 'results/test_report.pdf', format: 'A4' });
  
  await browser.close();
  
  console.log('Test report generated: results/test_report.pdf');
}

// Main execution
async function main() {
  console.log('Starting QAF framework tests...');
  const results = await runTests();
  await generatePdfReport(results);
  console.log('All tests completed. Check results folder for outputs.');
}

main().catch(console.error);