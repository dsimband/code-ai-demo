import { vi } from 'vitest'

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
      update: vi.fn()
    }))
  },
  registerables: []
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock window.URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsText: vi.fn(),
  onload: null,
  result: 'mocked file content'
}))

// Mock document.createElement for download functionality
const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn()
}
global.document.createElement = vi.fn().mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockAnchor
  }
  return document.createElement(tagName)
})

// Mock document.body methods
global.document.body.appendChild = vi.fn()
global.document.body.removeChild = vi.fn()

// Mock window.confirm
global.confirm = vi.fn(() => true)

// Mock window.alert
global.alert = vi.fn()

// Setup DOM environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})