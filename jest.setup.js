// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}

// Mock window.location
delete window.location
window.location = { href: '' }

// Setup API_URL globally
global.API_URL = 'http://localhost:3000'