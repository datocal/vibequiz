/**
 * quiz.js
 * Entry point for the quiz taking page (quiz.html)
 */

import { QuizManager } from './QuizManager.js';
import { QuizRenderer } from './QuizRenderer.js';
import { RandomQuizGenerator } from './RandomQuizGenerator.js';

class QuizController {
    constructor() {
        this.quizManager = new QuizManager();
        this.renderer = new QuizRenderer();
        this.isAnswered = false;
        this.isRandomMode = false;
        this.init();
    }

    async init() {
        const container = document.getElementById('quizContainer');

        try {
            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const quizFile = urlParams.get('quiz');
            const mode = urlParams.get('mode');

            // Check if random mode
            if (mode === 'random') {
                await this.initRandomQuiz(container);
            } else if (quizFile) {
                await this.initRegularQuiz(container, quizFile);
            } else {
                this.renderer.showError(container, 'No quiz selected. Please return to the home page.');
                return;
            }

            // Setup event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Error initializing quiz:', error);
            this.renderer.showError(container, error.message || 'Failed to load quiz. Please try again.');
        }
    }

    /**
     * Initializes a regular quiz from a file
     * @param {HTMLElement} container - Container element
     * @param {string} quizFile - Quiz filename
     */
    async initRegularQuiz(container, quizFile) {
        this.renderer.showLoading(container, 'Loading quiz...');
        await this.quizManager.loadQuiz(quizFile);

        const metadata = this.quizManager.getQuizMetadata();
        this.renderer.updateQuizTitle(metadata.title);

        this.renderCurrentQuestion();
    }

    /**
     * Initializes a random quiz from all available quizzes
     * @param {HTMLElement} container - Container element
     */
    async initRandomQuiz(container) {
        this.isRandomMode = true;
        this.renderer.showLoading(container, 'Creating your random quiz...');

        // Load all quizzes
        const allQuizzes = await this.quizManager.loadAllQuizzes();

        if (allQuizzes.length === 0) {
            throw new Error('No quizzes available to create random quiz');
        }

        // Generate random quiz
        const randomQuiz = RandomQuizGenerator.createRandomQuiz(allQuizzes, {
            count: 10,
            title: 'Random Party Quiz',
            description: 'A random selection of questions from all available quizzes'
        });

        // Initialize the quiz manager with the random quiz
        this.quizManager.initializeQuiz(randomQuiz);

        // Update UI
        this.renderer.updateQuizTitle('🎉 ' + randomQuiz.title);

        this.renderCurrentQuestion();
    }

    setupEventListeners() {
        // Handle retry button
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }
    }

    renderCurrentQuestion() {
        const container = document.getElementById('quizContainer');
        const question = this.quizManager.getCurrentQuestion();

        if (!question) {
            this.showResults();
            return;
        }

        // Render the question
        this.renderer.renderQuestion(
            question,
            this.quizManager.getCurrentQuestionNumber(),
            container
        );

        // Update progress
        this.renderer.updateProgress(
            this.quizManager.getProgress(),
            this.quizManager.getCurrentQuestionNumber(),
            this.quizManager.getTotalQuestions()
        );

        // Reset answered state
        this.isAnswered = false;

        // Add event listeners to option buttons
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleOptionClick(e));
        });

        // Add event listener to next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.handleNextQuestion());
        }
    }

    handleOptionClick(event) {
        // Prevent multiple submissions
        if (this.isAnswered) {
            return;
        }

        const button = event.currentTarget;
        const selectedIndex = parseInt(button.dataset.optionIndex, 10);

        // Mark as selected visually
        button.classList.add('selected');

        // Submit the answer
        const result = this.quizManager.submitAnswer(selectedIndex);

        // Show feedback
        this.renderer.showFeedback(
            selectedIndex,
            result.correctAnswer,
            result.isCorrect,
            result.explanation
        );

        this.isAnswered = true;
    }

    handleNextQuestion() {
        const hasNext = this.quizManager.nextQuestion();

        if (hasNext) {
            this.renderCurrentQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        const results = this.quizManager.getResults();
        this.renderer.renderResults(results);

        // Hide progress bar
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        if (progressBar && progressBar.parentElement) {
            progressBar.parentElement.style.display = 'none';
        }
        if (progressText) {
            progressText.style.display = 'none';
        }
    }

    async retryQuiz() {
        const quizContainer = document.getElementById('quizContainer');
        const resultsContainer = document.getElementById('resultsContainer');

        // Hide results, show quiz
        if (quizContainer) {
            quizContainer.style.display = 'block';
        }
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }

        // Show progress bar again
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        if (progressBar && progressBar.parentElement) {
            progressBar.parentElement.style.display = 'block';
        }
        if (progressText) {
            progressText.style.display = 'block';
        }

        // If random mode, generate a NEW random quiz
        if (this.isRandomMode) {
            try {
                await this.initRandomQuiz(quizContainer);
            } catch (error) {
                console.error('Error retrying random quiz:', error);
                this.renderer.showError(quizContainer, 'Failed to generate new random quiz');
            }
        } else {
            // For regular quizzes, just reset
            this.quizManager.reset();
            this.renderCurrentQuestion();
        }
    }
}

// Initialize the controller when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new QuizController();
    });
} else {
    new QuizController();
}
