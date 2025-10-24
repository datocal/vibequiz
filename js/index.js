/**
 * index.js
 * Entry point for the quiz selection page (index.html)
 */

import { QuizManager } from './QuizManager.js';
import { QuizRenderer } from './QuizRenderer.js';

class QuizApp {
    constructor() {
        this.quizManager = new QuizManager();
        this.renderer = new QuizRenderer();
        this.init();
    }

    async init() {
        const container = document.getElementById('quizGrid');

        try {
            this.renderer.showLoading(container, 'Loading quizzes...');
            const quizzes = await this.quizManager.loadQuizList();
            this.renderer.renderQuizList(quizzes, container);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.renderer.showError(container, 'Failed to load quizzes. Please refresh the page.');
        }
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new QuizApp();
    });
} else {
    new QuizApp();
}
