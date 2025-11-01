/**
 * category.js
 * Entry point for the category page (category.html)
 * Displays quizzes for a specific category
 */

import { QuizManager } from './QuizManager.js';
import { QuizRenderer } from './QuizRenderer.js';

class CategoryApp {
    constructor() {
        this.quizManager = new QuizManager();
        this.renderer = new QuizRenderer();
        this.init();
    }

    async init() {
        const container = document.getElementById('quizGrid');
        const categoryTitle = document.getElementById('categoryTitle');
        const categoryDescription = document.getElementById('categoryDescription');

        // Get category ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');

        if (!categoryId) {
            this.renderer.showError(container, 'No category specified. Please select a category from the home page.');
            return;
        }

        try {
            this.renderer.showLoading(container, 'Loading quizzes...');
            const data = await this.quizManager.loadCategoryQuizzes(categoryId);

            // Update page title and description
            if (categoryTitle) {
                categoryTitle.textContent = data.category.name;
            }
            if (categoryDescription) {
                categoryDescription.textContent = data.category.description;
            }

            // Update page title
            document.title = `Fast Quiz - ${data.category.name}`;

            // Render quizzes with category context for Random Party
            this.renderer.renderQuizList(data.quizzes, container, categoryId);
        } catch (error) {
            console.error('Error initializing category app:', error);
            this.renderer.showError(container, 'Failed to load quizzes. Please refresh the page or go back to the home page.');
        }
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CategoryApp();
    });
} else {
    new CategoryApp();
}
