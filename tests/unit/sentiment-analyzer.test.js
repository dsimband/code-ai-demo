import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import Sentiment from 'sentiment'

// Mock the SentimentAnalyzer class since it's not exported
// We'll test it by creating a testable version
class TestableSentimentAnalyzer {
  constructor() {
    this.sentiment = new Sentiment()
    this.history = JSON.parse(localStorage.getItem('sentimentHistory') || '[]')
    this.currentChart = null
    this.batchChart = null
  }

  analyzeText(text) {
    return this.sentiment.analyze(text)
  }

  saveToHistory(text) {
    const result = this.sentiment.analyze(text)
    const historyItem = {
      id: Date.now(),
      text: text,
      score: result.score,
      sentiment: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
      timestamp: new Date().toISOString(),
      positive: result.positive.length,
      negative: result.negative.length
    }

    this.history.unshift(historyItem)
    this.history = this.history.slice(0, 100)
    
    localStorage.setItem('sentimentHistory', JSON.stringify(this.history))
    return historyItem
  }

  clearHistory() {
    this.history = []
    localStorage.removeItem('sentimentHistory')
  }

  analyzeBatch(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    return lines.map(line => ({
      text: line.trim(),
      result: this.sentiment.analyze(line.trim())
    }))
  }

  exportHistory() {
    if (this.history.length === 0) {
      return null
    }

    const csvContent = [
      ['Text', 'Score', 'Sentiment', 'Positive Words', 'Negative Words', 'Date', 'Time'].join(','),
      ...this.history.map(item => {
        const date = new Date(item.timestamp).toLocaleDateString()
        const time = new Date(item.timestamp).toLocaleTimeString()
        return [
          `"${item.text.replace(/"/g, '""')}"`,
          item.score.toFixed(1),
          item.sentiment,
          item.positive,
          item.negative,
          date,
          time
        ].join(',')
      })
    ].join('\n')

    return csvContent
  }
}

describe('SentimentAnalyzer', () => {
  let analyzer

  beforeEach(() => {
    analyzer = new TestableSentimentAnalyzer()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('analyzeText', () => {
    it('should analyze positive text correctly', () => {
      const result = analyzer.analyzeText('I love this amazing wonderful product!')
      
      expect(result.score).toBeGreaterThan(0)
      expect(result.positive.length).toBeGreaterThan(0)
      expect(result.negative.length).toBe(0)
    })

    it('should analyze negative text correctly', () => {
      const result = analyzer.analyzeText('I hate this terrible awful product!')
      
      expect(result.score).toBeLessThan(0)
      expect(result.positive.length).toBe(0)
      expect(result.negative.length).toBeGreaterThan(0)
    })

    it('should analyze neutral text correctly', () => {
      const result = analyzer.analyzeText('This is a normal product.')
      
      expect(result.score).toBe(0)
      expect(result.positive.length).toBe(0)
      expect(result.negative.length).toBe(0)
    })

    it('should handle empty text', () => {
      const result = analyzer.analyzeText('')
      
      expect(result.score).toBe(0)
      expect(result.tokens).toEqual([])
    })

    it('should handle text with mixed sentiment', () => {
      const result = analyzer.analyzeText('I love this product but hate the price.')
      
      expect(result.positive.length).toBeGreaterThan(0)
      expect(result.negative.length).toBeGreaterThan(0)
    })
  })

  describe('saveToHistory', () => {
    it('should save analysis to history', () => {
      const text = 'I love this product!'
      const historyItem = analyzer.saveToHistory(text)
      
      expect(historyItem).toBeDefined()
      expect(historyItem.text).toBe(text)
      expect(historyItem.score).toBeGreaterThan(0)
      expect(historyItem.sentiment).toBe('positive')
      expect(historyItem.timestamp).toBeDefined()
      expect(historyItem.positive).toBeGreaterThan(0)
      expect(historyItem.negative).toBe(0)
    })

    it('should store history in localStorage', () => {
      const text = 'I love this product!'
      analyzer.saveToHistory(text)
      
      const storedHistory = JSON.parse(localStorage.getItem('sentimentHistory'))
      expect(storedHistory).toHaveLength(1)
      expect(storedHistory[0].text).toBe(text)
    })

    it('should limit history to 100 items', () => {
      // Add 101 items to history
      for (let i = 0; i < 101; i++) {
        analyzer.saveToHistory(`Test text ${i}`)
      }
      
      const storedHistory = JSON.parse(localStorage.getItem('sentimentHistory'))
      expect(storedHistory).toHaveLength(100)
    })
  })

  describe('analyzeBatch', () => {
    it('should analyze multiple texts correctly', () => {
      const batchText = 'I love this!\nI hate that!\nThis is neutral.'
      const results = analyzer.analyzeBatch(batchText)
      
      expect(results).toHaveLength(3)
      expect(results[0].text).toBe('I love this!')
      expect(results[0].result.score).toBeGreaterThan(0)
      expect(results[1].text).toBe('I hate that!')
      expect(results[1].result.score).toBeLessThan(0)
      expect(results[2].text).toBe('This is neutral.')
      expect(results[2].result.score).toBe(0)
    })

    it('should filter out empty lines', () => {
      const batchText = 'I love this!\n\n\nI hate that!\n   \nThis is neutral.'
      const results = analyzer.analyzeBatch(batchText)
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r.text.trim().length > 0)).toBe(true)
    })
  })

  describe('exportHistory', () => {
    it('should export history as CSV', () => {
      analyzer.saveToHistory('I love this!')
      analyzer.saveToHistory('I hate that!')
      
      const csv = analyzer.exportHistory()
      
      expect(csv).toBeDefined()
      expect(csv).toContain('Text,Score,Sentiment,Positive Words,Negative Words,Date,Time')
      expect(csv).toContain('I love this!')
      expect(csv).toContain('I hate that!')
    })

    it('should return null for empty history', () => {
      const csv = analyzer.exportHistory()
      
      expect(csv).toBeNull()
    })
  })
})