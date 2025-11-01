/**
 * index.js
 * Entry point for the quiz selection page (index.html)
 * Displays categories instead of individual quizzes
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
            this.renderer.showLoading(container, 'Loading categories...');
            const categories = await this.quizManager.loadCategories();
            this.renderer.renderCategoryList(categories, container);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.renderer.showError(container, 'Failed to load categories. Please refresh the page.');
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
