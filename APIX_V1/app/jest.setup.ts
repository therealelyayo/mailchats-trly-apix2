// This file contains setup code that will be run before each test
import '@testing-library/jest-dom';
import { server } from './client/src/__tests__/setup/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock console errors to keep tests clean
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out React-specific warnings for cleaner test output
  if (typeof args[0] === 'string' && 
      (args[0].includes('Warning: ReactDOM.render') || 
       args[0].includes('Warning: React.createElement'))) {
    return;
  }
  originalConsoleError(...args);
};

// Reset all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});