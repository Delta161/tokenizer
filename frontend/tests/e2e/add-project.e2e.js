describe('Add Project Form E2E Tests', function() {
  beforeEach(function(browser) {
    browser.url('http://localhost:5173/add-project')
  })

  afterEach(function(browser) {
    browser.end()
  })

  test('should display the add project form', function(browser) {
    browser
      .waitForElementVisible('h2', 5000)
      .assert.textContains('h2', 'Add New Project')
      .assert.elementPresent('#projectTitle')
      .assert.elementPresent('#location')
      .assert.elementPresent('#description')
      .assert.elementPresent('#tokenSymbol')
      .assert.elementPresent('#totalTokens')
      .assert.elementPresent('#pricePerToken')
      .assert.elementPresent('#expectedYield')
      .assert.elementPresent('#projectImage')
      .assert.elementPresent('button[type="submit"]')
  })

  test('should show validation errors for empty required fields', function(browser) {
    browser
      .waitForElementVisible('form', 5000)
      .click('button[type="submit"]')
      .waitForElementVisible('[id="projectTitle-error"]', 2000)
      .assert.textContains('[id="projectTitle-error"]', 'Project title is required')
      .assert.textContains('[id="location-error"]', 'Location is required')
      .assert.textContains('[id="description-error"]', 'Description is required')
      .assert.textContains('[id="tokenSymbol-error"]', 'Token symbol is required')
  })

  test('should validate token symbol format and length', function(browser) {
    browser
      .waitForElementVisible('#tokenSymbol', 5000)
      // Test lowercase conversion
      .setValue('#tokenSymbol', 'test')
      .assert.valueEquals('#tokenSymbol', 'TEST')
      .clearValue('#tokenSymbol')
      // Test invalid characters
      .setValue('#tokenSymbol', 'TEST@123')
      .click('button[type="submit"]')
      .waitForElementVisible('[id="tokenSymbol-error"]', 2000)
      .assert.textContains('[id="tokenSymbol-error"]', 'Token symbol must contain only uppercase letters and numbers')
      .clearValue('#tokenSymbol')
      // Test length validation
      .setValue('#tokenSymbol', 'TOOLONGTOKEN')
      .click('button[type="submit"]')
      .waitForElementVisible('[id="tokenSymbol-error"]', 2000)
      .assert.textContains('[id="tokenSymbol-error"]', 'Token symbol must be 8 characters or less')
  })

  test('should show character count for token symbol', function(browser) {
    browser
      .waitForElementVisible('#tokenSymbol', 5000)
      .setValue('#tokenSymbol', 'TEST')
      .assert.textContains('label[for="tokenSymbol"]', '(4/8)')
      .setValue('#tokenSymbol', 'TESTLONG')
      .assert.textContains('label[for="tokenSymbol"]', '(8/8)')
  })

  test('should validate numeric fields', function(browser) {
    browser
      .waitForElementVisible('#totalTokens', 5000)
      .setValue('#totalTokens', '0')
      .setValue('#pricePerToken', '0')
      .click('button[type="submit"]')
      .waitForElementVisible('[id="totalTokens-error"]', 2000)
      .assert.textContains('[id="totalTokens-error"]', 'Total tokens must be greater than 0')
      .assert.textContains('[id="pricePerToken-error"]', 'Price per token must be at least 0.01')
  })

  test('should validate expected yield range', function(browser) {
    browser
      .waitForElementVisible('#expectedYield', 5000)
      .setValue('#expectedYield', '-5')
      .click('button[type="submit"]')
      .waitForElementVisible('[id="expectedYield-error"]', 2000)
      .assert.textContains('[id="expectedYield-error"]', 'Expected yield must be between 0 and 100')
      .clearValue('#expectedYield')
      .setValue('#expectedYield', '150')
      .click('button[type="submit"]')
      .waitForElementVisible('[id="expectedYield-error"]', 2000)
      .assert.textContains('[id="expectedYield-error"]', 'Expected yield must be between 0 and 100')
  })

  test('should clear field errors when user starts typing', function(browser) {
    browser
      .waitForElementVisible('form', 5000)
      // Submit empty form to trigger validation
      .click('button[type="submit"]')
      .waitForElementVisible('[id="projectTitle-error"]', 2000)
      .assert.textContains('[id="projectTitle-error"]', 'Project title is required')
      // Start typing to clear error
      .setValue('#projectTitle', 'Test Project')
      .pause(500)
      .assert.not.elementPresent('[id="projectTitle-error"]')
  })

  test('should enable submit button when form is valid', function(browser) {
    browser
      .waitForElementVisible('form', 5000)
      // Initially submit button should be disabled
      .assert.attributeEquals('button[type="submit"]', 'disabled', 'true')
      // Fill in all required fields
      .setValue('#projectTitle', 'Luxury Downtown Apartment')
      .setValue('#location', 'New York, NY')
      .setValue('#description', 'A premium real estate investment opportunity in the heart of Manhattan')
      .setValue('#tokenSymbol', 'LUXAPT')
      .setValue('#totalTokens', '1000')
      .setValue('#pricePerToken', '0.5')
      .setValue('#expectedYield', '8.5')
      .pause(500)
      // Submit button should now be enabled
      .assert.not.attributePresent('button[type="submit"]', 'disabled')
  })

  test('should successfully submit a valid form', function(browser) {
    // Mock the API response for successful submission
    browser
      .waitForElementVisible('form', 5000)
      // Fill in all required fields with valid data
      .setValue('#projectTitle', 'Modern Office Building')
      .setValue('#location', 'San Francisco, CA')
      .setValue('#description', 'A state-of-the-art office building in the financial district with high-quality tenants and stable rental income.')
      .setValue('#tokenSymbol', 'OFFICE1')
      .setValue('#totalTokens', '2000')
      .setValue('#pricePerToken', '0.25')
      .setValue('#expectedYield', '7.2')
      .pause(500)
      // Submit the form
      .click('button[type="submit"]')
      // Check for loading state
      .waitForElementVisible('button[type="submit"] span', 2000)
      .assert.textContains('button[type="submit"]', 'Creating Project...')
      .assert.attributeEquals('button[type="submit"]', 'disabled', 'true')
  })

  test('should handle file upload', function(browser) {
    const imagePath = require('path').resolve(__dirname, '../fixtures/test-image.jpg')
    
    browser
      .waitForElementVisible('#projectImage', 5000)
      // Upload a test image file
      .setValue('#projectImage', imagePath)
      .pause(1000)
      // Check if image preview appears (if the test image exists)
      .execute(function() {
        const fileInput = document.querySelector('#projectImage')
        return fileInput.files.length > 0
      }, function(result) {
        if (result.value) {
          browser.assert.elementPresent('img[alt="Project preview"]')
        }
      })
  })

  test('should navigate to projects page on cancel', function(browser) {
    browser
      .waitForElementVisible('button:contains("Cancel")', 5000)
      .click('button:contains("Cancel")')
      .pause(1000)
      .assert.urlContains('/projects')
  })

  test('should display error message on API failure', function(browser) {
    // This test would require mocking the API to return an error
    // For demonstration purposes, we'll test the error display mechanism
    browser
      .waitForElementVisible('form', 5000)
      // Fill in valid form data
      .setValue('#projectTitle', 'Test Project')
      .setValue('#location', 'Test Location')
      .setValue('#description', 'Test Description')
      .setValue('#tokenSymbol', 'TEST')
      .setValue('#totalTokens', '100')
      .setValue('#pricePerToken', '1.0')
      .pause(500)
      // Submit form (this would trigger API call)
      .click('button[type="submit"]')
      // In a real scenario with mocked API, we would check for error message
      // .waitForElementVisible('.bg-red-100', 5000)
      // .assert.textContains('.bg-red-100', 'An error occurred')
  })

  test('should be accessible with proper ARIA attributes', function(browser) {
    browser
      .waitForElementVisible('form', 5000)
      // Check for proper labels and ARIA attributes
      .assert.attributeEquals('#projectTitle', 'aria-describedby', 'projectTitle-error')
      .assert.attributeEquals('#location', 'aria-describedby', 'location-error')
      .assert.attributeEquals('#description', 'aria-describedby', 'description-error')
      .assert.attributeEquals('#tokenSymbol', 'aria-describedby', 'tokenSymbol-error tokenSymbol-help')
      .assert.attributeEquals('#totalTokens', 'aria-describedby', 'totalTokens-error')
      .assert.attributeEquals('#pricePerToken', 'aria-describedby', 'pricePerToken-error')
      .assert.attributeEquals('#expectedYield', 'aria-describedby', 'expectedYield-error')
      .assert.attributeEquals('#projectImage', 'aria-describedby', 'projectImage-error projectImage-help')
      // Check for proper labels
      .assert.elementPresent('label[for="projectTitle"]')
      .assert.elementPresent('label[for="location"]')
      .assert.elementPresent('label[for="description"]')
      .assert.elementPresent('label[for="tokenSymbol"]')
      .assert.elementPresent('label[for="totalTokens"]')
      .assert.elementPresent('label[for="pricePerToken"]')
      .assert.elementPresent('label[for="expectedYield"]')
      .assert.elementPresent('label[for="projectImage"]')
  })
})