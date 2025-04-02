/* eslint-disable @typescript-eslint/no-explicit-any -- ok*/
/* eslint-disable @typescript-eslint/no-empty-interface -- ok*/
import '@testing-library/jest-dom';

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T> {}
  interface AsymmetricMatchersContaining extends jest.Matchers<void, unknown> {}
}
