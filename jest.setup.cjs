// This file runs before Jest loads any tests
// We can set up global mocks here

// Mock execa globally
jest.mock('execa', () => ({
  execa: jest.fn()
}));
