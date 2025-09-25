import { test, expect } from '@playwright/test'

test.describe('Sentiment Analysis Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Single Text Analysis', () => {
    test('should analyze positive text correctly', async ({ page }) => {
      // Navigate to analyzer section
      await page.click('text=Analyzer')
      
      // Enter positive text
      await page.fill('#textInput', 'I love this amazing wonderful product!')
      
      // Click analyze button
      await page.click('#analyzeBtn')
      
      // Wait for results to appear
      await page.waitForSelector('#resultsSection.fade-in', { timeout: 5000 })
      
      // Check sentiment badge
      const sentimentBadge = page.locator('#sentimentBadge')
      await expect(sentimentBadge).toContainText('Positive')
      await expect(sentimentBadge).toHaveClass(/positive/)
      
      // Check score
      const scoreValue = page.locator('#scoreValue')
      await expect(scoreValue).not.toHaveText('0.0')
      
      // Check metrics
      const positiveCount = page.locator('#positiveCount')
      await expect(positiveCount).not.toHaveText('0')
      
      // Check chart is rendered
      const chart = page.locator('#sentimentChart')
      await expect(chart).toBeVisible()
    })

    test('should analyze negative text correctly', async ({ page }) => {
      await page.click('text=Analyzer')
      
      await page.fill('#textInput', 'I hate this terrible awful product!')
      await page.click('#analyzeBtn')
      
      await page.waitForSelector('#resultsSection.fade-in', { timeout: 5000 })
      
      const sentimentBadge = page.locator('#sentimentBadge')
      await expect(sentimentBadge).toContainText('Negative')
      await expect(sentimentBadge).toHaveClass(/negative/)
      
      const scoreValue = page.locator('#scoreValue')
      await expect(scoreValue).not.toHaveText('0.0')
      
      const negativeCount = page.locator('#negativeCount')
      await expect(negativeCount).not.toHaveText('0')
    })

    test('should update character count in real-time', async ({ page }) => {
      await page.click('text=Analyzer')
      
      const textInput = page.locator('#textInput')
      const charCount = page.locator('#charCount')
      
      await expect(charCount).toHaveText('0')
      
      await textInput.fill('Hello')
      await expect(charCount).toHaveText('5')
      
      await textInput.fill('Hello World!')
      await expect(charCount).toHaveText('12')
    })

    test('should clear input and results', async ({ page }) => {
      await page.click('text=Analyzer')
      
      // Enter text and analyze
      await page.fill('#textInput', 'I love this product!')
      await page.click('#analyzeBtn')
      await page.waitForSelector('#resultsSection.fade-in', { timeout: 5000 })
      
      // Clear results
      await page.click('#clearBtn')
      
      // Check input is cleared
      await expect(page.locator('#textInput')).toHaveValue('')
      await expect(page.locator('#charCount')).toHaveText('0')
      
      // Check results are hidden
      await expect(page.locator('#resultsSection')).not.toHaveClass(/fade-in/)
    })
  })

  test.describe('Batch Analysis', () => {
    test('should analyze multiple texts', async ({ page }) => {
      await page.click('text=Batch Analysis')
      
      const batchTextInput = page.locator('#batchTextInput')
      await batchTextInput.fill('I love this!\nI hate that!\nThis is neutral.')
      
      await page.click('#batchAnalyzeBtn')
      
      // Wait for batch results
      await page.waitForSelector('#batchTotal', { timeout: 5000 })
      
      // Check summary stats
      await expect(page.locator('#batchTotal')).toHaveText('3')
      await expect(page.locator('#batchPositive')).toHaveText('1')
      await expect(page.locator('#batchNegative')).toHaveText('1')
      await expect(page.locator('#batchNeutral')).toHaveText('1')
      
      // Check chart is rendered
      const batchChart = page.locator('#batchChart')
      await expect(batchChart).toBeVisible()
    })
  })

  test.describe('History Management', () => {
    test('should save analysis to history', async ({ page }) => {
      await page.click('text=Analyzer')
      
      // Perform analysis
      await page.fill('#textInput', 'I love this product!')
      await page.click('#analyzeBtn')
      await page.waitForSelector('#resultsSection.fade-in', { timeout: 5000 })
      
      // Navigate to history
      await page.click('text=History')
      
      // Check history contains the analysis
      const historyList = page.locator('#historyList')
      await expect(historyList).toContainText('I love this product!')
      await expect(historyList).toContainText('positive')
    })

    test('should show empty state when no history', async ({ page }) => {
      await page.click('text=History')
      
      const emptyState = page.locator('.empty-state')
      await expect(emptyState).toBeVisible()
      await expect(emptyState).toContainText('No analysis history yet')
      await expect(emptyState).toContainText('Start analyzing text to see your history here')
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between sections', async ({ page }) => {
      // Start on analyzer section
      await expect(page.locator('#analyzer')).toHaveClass(/active/)
      
      // Navigate to batch analysis
      await page.click('text=Batch Analysis')
      await expect(page.locator('#batch')).toHaveClass(/active/)
      await expect(page.locator('#analyzer')).not.toHaveClass(/active/)
      
      // Navigate to history
      await page.click('text=History')
      await expect(page.locator('#history')).toHaveClass(/active/)
      await expect(page.locator('#batch')).not.toHaveClass(/active/)
      
      // Navigate back to analyzer
      await page.click('text=Analyzer')
      await expect(page.locator('#analyzer')).toHaveClass(/active/)
      await expect(page.locator('#history')).not.toHaveClass(/active/)
    })
  })

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })
  })
})