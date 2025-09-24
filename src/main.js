import Sentiment from 'sentiment';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

class SentimentAnalyzer {
    constructor() {
        this.sentiment = new Sentiment();
        this.history = JSON.parse(localStorage.getItem('sentimentHistory') || '[]');
        this.currentChart = null;
        this.batchChart = null;
        
        this.initializeEventListeners();
        this.initializeNavigation();
        this.loadHistory();
    }

    initializeEventListeners() {
        // Single analysis
        const textInput = document.getElementById('textInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const charCount = document.getElementById('charCount');

        textInput.addEventListener('input', (e) => {
            charCount.textContent = e.target.value.length;
            if (e.target.value.trim()) {
                this.analyzeText(e.target.value);
            }
        });

        analyzeBtn.addEventListener('click', () => {
            const text = textInput.value.trim();
            if (text) {
                this.analyzeText(text);
                this.saveToHistory(text);
            }
        });

        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            charCount.textContent = '0';
            this.clearResults();
        });

        // Batch analysis
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        const batchTextInput = document.getElementById('batchTextInput');
        const batchAnalyzeBtn = document.getElementById('batchAnalyzeBtn');

        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--primary-color)';
        });
        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.style.borderColor = 'var(--border-color)';
        });
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--border-color)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        batchAnalyzeBtn.addEventListener('click', () => {
            const text = batchTextInput.value.trim();
            if (text) {
                this.analyzeBatch(text);
            }
        });

        // History
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        const exportHistoryBtn = document.getElementById('exportHistoryBtn');

        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                this.clearHistory();
            }
        });

        exportHistoryBtn.addEventListener('click', () => {
            this.exportHistory();
        });
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show target section
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    analyzeText(text) {
        const result = this.sentiment.analyze(text);
        this.displayResults(result, text);
    }

    displayResults(result, text) {
        const resultsSection = document.getElementById('resultsSection');
        const sentimentBadge = document.getElementById('sentimentBadge');
        const scoreFill = document.getElementById('scoreFill');
        const scoreValue = document.getElementById('scoreValue');
        const positiveCount = document.getElementById('positiveCount');
        const negativeCount = document.getElementById('negativeCount');
        const totalWords = document.getElementById('totalWords');

        // Determine sentiment category
        let sentimentCategory = 'neutral';
        let sentimentText = 'Neutral';
        let sentimentIcon = 'fas fa-meh';

        if (result.score > 0) {
            sentimentCategory = 'positive';
            sentimentText = 'Positive';
            sentimentIcon = 'fas fa-smile';
        } else if (result.score < 0) {
            sentimentCategory = 'negative';
            sentimentText = 'Negative';
            sentimentIcon = 'fas fa-frown';
        }

        // Update sentiment badge
        sentimentBadge.className = `sentiment-badge ${sentimentCategory}`;
        sentimentBadge.innerHTML = `<i class="${sentimentIcon}"></i><span>${sentimentText}</span>`;

        // Update score bar
        const normalizedScore = Math.max(0, Math.min(100, (result.score + 10) * 5)); // Normalize to 0-100
        scoreFill.style.width = `${normalizedScore}%`;
        scoreValue.textContent = result.score.toFixed(1);

        // Update metrics
        positiveCount.textContent = result.positive.length;
        negativeCount.textContent = result.negative.length;
        totalWords.textContent = text.split(/\s+/).filter(word => word.length > 0).length;

        // Update chart
        this.updateChart(result);

        // Show results with animation
        resultsSection.classList.add('fade-in');
    }

    updateChart(result) {
        const ctx = document.getElementById('sentimentChart').getContext('2d');
        
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        const positiveWords = result.positive.length;
        const negativeWords = result.negative.length;
        const neutralWords = Math.max(0, result.tokens.length - positiveWords - negativeWords);

        this.currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    data: [positiveWords, negativeWords, neutralWords],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(107, 114, 128, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    title: {
                        display: true,
                        text: 'Word Sentiment Distribution'
                    }
                }
            }
        });
    }

    clearResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('fade-in');
        
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }
    }

    handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('batchTextInput').value = content;
        };
        reader.readAsText(file);
    }

    analyzeBatch(text) {
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const results = lines.map(line => ({
            text: line.trim(),
            result: this.sentiment.analyze(line.trim())
        }));

        this.displayBatchResults(results);
    }

    displayBatchResults(results) {
        const batchTotal = document.getElementById('batchTotal');
        const batchPositive = document.getElementById('batchPositive');
        const batchNegative = document.getElementById('batchNegative');
        const batchNeutral = document.getElementById('batchNeutral');

        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        results.forEach(({ result }) => {
            if (result.score > 0) positiveCount++;
            else if (result.score < 0) negativeCount++;
            else neutralCount++;
        });

        batchTotal.textContent = results.length;
        batchPositive.textContent = positiveCount;
        batchNegative.textContent = negativeCount;
        batchNeutral.textContent = neutralCount;

        this.updateBatchChart(positiveCount, negativeCount, neutralCount);

        // Save batch results to history
        results.forEach(({ text }) => {
            this.saveToHistory(text);
        });
    }

    updateBatchChart(positive, negative, neutral) {
        const ctx = document.getElementById('batchChart').getContext('2d');
        
        if (this.batchChart) {
            this.batchChart.destroy();
        }

        this.batchChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    label: 'Number of Texts',
                    data: [positive, negative, neutral],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(107, 114, 128, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Batch Analysis Results'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    saveToHistory(text) {
        const result = this.sentiment.analyze(text);
        const historyItem = {
            id: Date.now(),
            text: text,
            score: result.score,
            sentiment: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral',
            timestamp: new Date().toISOString(),
            positive: result.positive.length,
            negative: result.negative.length
        };

        this.history.unshift(historyItem);
        this.history = this.history.slice(0, 100); // Keep only last 100 items
        
        localStorage.setItem('sentimentHistory', JSON.stringify(this.history));
        this.loadHistory();
    }

    loadHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No analysis history yet</p>
                    <small>Start analyzing text to see your history here</small>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.history.map(item => {
            const date = new Date(item.timestamp).toLocaleDateString();
            const time = new Date(item.timestamp).toLocaleTimeString();
            const sentimentIcon = item.sentiment === 'positive' ? 'fas fa-smile' : 
                                 item.sentiment === 'negative' ? 'fas fa-frown' : 'fas fa-meh';
            
            return `
                <div class="history-item">
                    <div class="history-content">
                        <div class="history-text">${item.text}</div>
                        <div class="history-meta">
                            <span>${date} ${time}</span>
                            <span>Score: ${item.score.toFixed(1)}</span>
                            <span>+${item.positive} words</span>
                            <span>-${item.negative} words</span>
                        </div>
                    </div>
                    <div class="history-sentiment ${item.sentiment}">
                        <i class="${sentimentIcon}"></i>
                        <span>${item.sentiment}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('sentimentHistory');
        this.loadHistory();
    }

    exportHistory() {
        if (this.history.length === 0) {
            alert('No history to export');
            return;
        }

        const csvContent = [
            ['Text', 'Score', 'Sentiment', 'Positive Words', 'Negative Words', 'Date', 'Time'].join(','),
            ...this.history.map(item => {
                const date = new Date(item.timestamp).toLocaleDateString();
                const time = new Date(item.timestamp).toLocaleTimeString();
                return [
                    `"${item.text.replace(/"/g, '""')}"`,
                    item.score.toFixed(1),
                    item.sentiment,
                    item.positive,
                    item.negative,
                    date,
                    time
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sentiment-analysis-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SentimentAnalyzer();
});