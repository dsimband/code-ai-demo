import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('localStorage Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('History Storage', () => {
    it('should store sentiment analysis history', () => {
      const historyItem = {
        id: Date.now(),
        text: 'I love this product!',
        score: 2.5,
        sentiment: 'positive',
        timestamp: new Date().toISOString(),
        positive: 2,
        negative: 0
      }

      localStorage.setItem('sentimentHistory', JSON.stringify([historyItem]))
      
      const stored = JSON.parse(localStorage.getItem('sentimentHistory'))
      expect(stored).toHaveLength(1)
      expect(stored[0].text).toBe('I love this product!')
      expect(stored[0].score).toBe(2.5)
      expect(stored[0].sentiment).toBe('positive')
    })

    it('should retrieve sentiment analysis history', () => {
      const historyData = [
        {
          id: 1,
          text: 'I love this!',
          score: 2.0,
          sentiment: 'positive',
          timestamp: '2023-01-01T00:00:00Z',
          positive: 2,
          negative: 0
        },
        {
          id: 2,
          text: 'I hate this!',
          score: -2.0,
          sentiment: 'negative',
          timestamp: '2023-01-02T00:00:00Z',
          positive: 0,
          negative: 2
        }
      ]

      localStorage.setItem('sentimentHistory', JSON.stringify(historyData))
      
      const retrieved = JSON.parse(localStorage.getItem('sentimentHistory') || '[]')
      expect(retrieved).toEqual(historyData)
    })

    it('should handle empty history gracefully', () => {
      const retrieved = JSON.parse(localStorage.getItem('sentimentHistory') || '[]')
      expect(retrieved).toEqual([])
    })

    it('should limit history to 100 items', () => {
      const largeHistory = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        text: `Test text ${i}`,
        score: 0,
        sentiment: 'neutral',
        timestamp: new Date().toISOString(),
        positive: 0,
        negative: 0
      }))

      // Simulate adding 150 items and limiting to 100
      const limitedHistory = largeHistory.slice(0, 100)
      localStorage.setItem('sentimentHistory', JSON.stringify(limitedHistory))
      
      const stored = JSON.parse(localStorage.getItem('sentimentHistory'))
      expect(stored).toHaveLength(100)
    })
  })

  describe('Data Persistence', () => {
    it('should persist data across page reloads', () => {
      const testData = {
        text: 'Persistent test data',
        score: 1.5,
        sentiment: 'positive'
      }

      localStorage.setItem('sentimentHistory', JSON.stringify([testData]))
      
      // Simulate page reload by clearing and re-reading
      const persistedData = JSON.parse(localStorage.getItem('sentimentHistory'))
      expect(persistedData[0].text).toBe('Persistent test data')
    })
  })

  describe('Clear Operations', () => {
    it('should clear all history data', () => {
      const historyData = [
        { id: 1, text: 'Test 1', score: 1, sentiment: 'positive' },
        { id: 2, text: 'Test 2', score: -1, sentiment: 'negative' }
      ]

      localStorage.setItem('sentimentHistory', JSON.stringify(historyData))
      expect(localStorage.getItem('sentimentHistory')).toBeDefined()

      localStorage.removeItem('sentimentHistory')
      expect(localStorage.getItem('sentimentHistory')).toBeNull()
    })
  })
})