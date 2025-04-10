// Jest setup file
// Add any test setup code here (mocks, global configuration, etc.)

// Enable fake timers for all tests
// This allows jest.advanceTimersByTime() to work properly
jest.useFakeTimers();

// Silence console.error only
const originalConsoleError = console.error;
console.error = (...args) => {
  // Optional: Puedes decidir si quieres mostrar ciertos errores
  // Si el mensaje contiene 'esto es importante', mostrarlo de todos modos
  // if (args[0] && typeof args[0] === 'string' && args[0].includes('esto es importante')) {
  //   originalConsoleError(...args);
  // }
};

// Proper way to restore console in Jest setup files
// This uses Jest's built-in handling for setup/teardown
if (typeof global.afterAll === 'function') {
  global.afterAll(() => {
    console.error = originalConsoleError;
  });
} else {
  // Fallback to ensure console.error is restored if afterAll isn't available
  // This is less ideal but prevents the error
  process.on('exit', () => {
    console.error = originalConsoleError;
  });
}