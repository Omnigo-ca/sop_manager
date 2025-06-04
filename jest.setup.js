require('@testing-library/jest-dom')

// Supprime les warnings de React concernant useEffect dans les tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning: useLayoutEffect/.test(args[0])) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 