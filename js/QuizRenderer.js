/**
 * QuizRenderer.js
 * Handles all DOM manipulation and UI updates for the quiz application
 */

export class QuizRenderer {
    /**
     * Renders the category list on the index page with Random Party option
     * @param {Array} categories - Array of category objects
     * @param {HTMLElement} container - Container element to render into
     */
    renderCategoryList(categories, container) {
        if (!categories || categories.length === 0) {
            container.innerHTML = '<div class="error">No categories available. Please check the manifest file.</div>';
            return;
        }

        // Render Random Party card first, then all category cards
        const randomPartyCard = this.renderRandomPartyCard();
        const categoryCards = categories.map(category => this.renderCategoryCard(category)).join('');

        container.innerHTML = randomPartyCard + categoryCards;
    }

    /**
     * Renders a single category card
     * @param {Object} category - Category object
     * @returns {string} HTML string for category card
     */
    renderCategoryCard(category) {
        const quizCount = category.quizzes ? category.quizzes.length : 0;
        return `
            <a href="category.html?category=${encodeURIComponent(category.id)}" class="quiz-card">
                <div class="quiz-card__icon">${category.icon || this.getIconForCategory(category.id)}</div>
                <h2 class="quiz-card__title">${this.escapeHtml(category.name)}</h2>
                <p class="quiz-card__description">${this.escapeHtml(category.description)}</p>
                <div class="quiz-card__meta">
                    <span>${quizCount} ${quizCount === 1 ? 'Quiz' : 'Quizzes'}</span>
                </div>
            </a>
        `;
    }

    /**
     * Renders the quiz list on a category page with Random Party option
     * @param {Array} quizzes - Array of quiz objects
     * @param {HTMLElement} container - Container element to render into
     * @param {string} categoryId - The category ID for category-specific random quiz
     */
    renderQuizList(quizzes, container, categoryId = null) {
        if (!quizzes || quizzes.length === 0) {
            container.innerHTML = '<div class="error">No quizzes available in this category.</div>';
            return;
        }

        // Render Random Party card first (with category context if provided), then all regular quizzes
        const randomPartyCard = this.renderRandomPartyCard(categoryId);
        const quizCards = quizzes.map(quiz => this.renderQuizCard(quiz)).join('');

        container.innerHTML = randomPartyCard + quizCards;
    }

    /**
     * Renders the special Random Party quiz card
     * @param {string} categoryId - Optional category ID for category-specific random quiz
     * @returns {string} HTML string for Random Party card
     */
    renderRandomPartyCard(categoryId = null) {
        const url = categoryId
            ? `quiz.html?mode=random&category=${encodeURIComponent(categoryId)}`
            : 'quiz.html?mode=random';

        const description = categoryId
            ? '¡10 preguntas aleatorias de esta categoría!'
            : '¡Desafíate a ti mismo con 10 preguntas aleatorias de todos los cuestionarios disponibles!';

        return `
            <a href="${url}" class="quiz-card quiz-card--random">
                <div class="quiz-card__icon">🎉</div>
                <h2 class="quiz-card__title">Random Party</h2>
                <p class="quiz-card__description">
                    ${description}
                </p>
                <div class="quiz-card__meta">
                    <span class="quiz-card__difficulty quiz-card__difficulty--medium">
                        Mixed
                    </span>
                    <span>10 Questions</span>
                </div>
            </a>
        `;
    }

    /**
     * Renders a single quiz card
     * @param {Object} quiz - Quiz object
     * @returns {string} HTML string for quiz card
     */
    renderQuizCard(quiz) {
        // Build quiz path with category if available
        const quizPath = quiz.categoryId
            ? `${quiz.categoryId}/${quiz.filename}`
            : quiz.filename;

        const hasQuickQuiz = quiz.questions.length > 30;
        const hasDiagram = !!quiz.diagramUri;

        if (hasQuickQuiz || hasDiagram) {
            const diagramBtn = hasDiagram ? `
                        <a href="${this.escapeHtml(quiz.diagramUri)}" target="_blank" rel="noopener noreferrer" class="diagram-btn">
                            <span class="diagram-btn__icon">🗺️</span>
                            <span class="diagram-btn__text">Ver Diagrama</span>
                        </a>` : '';
            const quickQuizBtn = hasQuickQuiz ? `
                        <a href="quiz.html?quiz=${encodeURIComponent(quizPath)}&sample=true" class="quick-quiz-btn">
                            <span class="quick-quiz-btn__icon">⚡</span>
                            <span class="quick-quiz-btn__text">Quick Quiz</span>
                            <span class="quick-quiz-btn__detail">10 preguntas aleatorias</span>
                        </a>` : '';
            return `
                <div class="quiz-card quiz-card--with-actions">
                    <a href="quiz.html?quiz=${encodeURIComponent(quizPath)}" class="quiz-card__main">
                        <div class="quiz-card__icon">${this.getIconForQuiz(quiz)}</div>
                        <h2 class="quiz-card__title">${this.escapeHtml(quiz.title)}</h2>
                        <p class="quiz-card__description">${this.escapeHtml(quiz.description)}</p>
                        <div class="quiz-card__meta">
                            <span class="quiz-card__difficulty quiz-card__difficulty--${quiz.difficulty}">
                                ${this.capitalizeFirst(quiz.difficulty)}
                            </span>
                            <span>${quiz.questions.length} Questions</span>
                        </div>
                    </a>
                    <div class="quiz-card__actions">${diagramBtn}${quickQuizBtn}
                    </div>
                </div>
            `;
        }

        // Regular quiz card without actions
        return `
            <a href="quiz.html?quiz=${encodeURIComponent(quizPath)}" class="quiz-card">
                <div class="quiz-card__icon">${this.getIconForQuiz(quiz)}</div>
                <h2 class="quiz-card__title">${this.escapeHtml(quiz.title)}</h2>
                <p class="quiz-card__description">${this.escapeHtml(quiz.description)}</p>
                <div class="quiz-card__meta">
                    <span class="quiz-card__difficulty quiz-card__difficulty--${quiz.difficulty}">
                        ${this.capitalizeFirst(quiz.difficulty)}
                    </span>
                    <span>${quiz.questions.length} Questions</span>
                </div>
            </a>
        `;
    }

    /**
     * Renders a quiz question
     * @param {Object} question - The question object
     * @param {number} questionNumber - The question number (1-indexed)
     * @param {HTMLElement} container - Container element to render into
     */
    renderQuestion(question, questionNumber, container) {
        const questionHtml = `
            <div class="question-card">
                <div class="question-card__number">Question ${questionNumber}</div>
                <h2 class="question-card__text">${this.escapeHtml(question.question)}</h2>
                <ul class="options-list">
                    ${question.options.map((option, index) => `
                        <li class="option-item">
                            <button
                                class="option-button"
                                data-option-index="${index}"
                                aria-label="Option ${index + 1}: ${this.escapeHtml(option)}"
                            >
                                ${this.escapeHtml(option)}
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="navigation">
                <button id="nextBtn" class="btn btn--primary" style="display: none;">
                    Next Question
                </button>
            </div>
        `;

        container.innerHTML = questionHtml;
    }

    /**
     * Updates the question display with feedback after answer submission
     * @param {number} selectedIndex - Index of selected option
     * @param {number} correctIndex - Index of correct option
     * @param {boolean} isCorrect - Whether the answer was correct
     * @param {string|null} explanation - Optional explanation text
     */
    showFeedback(selectedIndex, correctIndex, isCorrect, explanation = null) {
        const optionButtons = document.querySelectorAll('.option-button');

        // Disable all buttons
        optionButtons.forEach(button => {
            button.disabled = true;
        });

        // Apply styling to selected and correct answers
        optionButtons.forEach((button, index) => {
            if (index === correctIndex) {
                button.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                button.classList.add('incorrect');
            } else if (index !== correctIndex) {
                button.classList.add('dimmed');
            }
        });

        // Show feedback message
        const questionCard = document.querySelector('.question-card');
        const feedbackHtml = `
            <div class="feedback feedback--${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback__title">
                    ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                ${explanation ? `<div class="feedback__explanation">${this.escapeHtml(explanation)}</div>` : ''}
            </div>
        `;
        questionCard.insertAdjacentHTML('beforeend', feedbackHtml);

        // Show next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.style.display = 'block';
        }
    }

    /**
     * Updates the progress bar
     * @param {number} progress - Progress percentage (0-100)
     * @param {number} currentQuestion - Current question number
     * @param {number} totalQuestions - Total number of questions
     */
    updateProgress(progress, currentQuestion, totalQuestions) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
        }
    }

    /**
     * Updates the quiz title in the header
     * @param {string} title - Quiz title
     */
    updateQuizTitle(title) {
        const titleElement = document.getElementById('quizTitle');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    /**
     * Renders the results screen
     * @param {Object} results - Results object from QuizManager
     */
    renderResults(results) {
        const quizContainer = document.getElementById('quizContainer');
        const resultsContainer = document.getElementById('resultsContainer');
        const finalScore = document.getElementById('finalScore');
        const scorePercentage = document.getElementById('scorePercentage');
        const resultsMessage = document.getElementById('resultsMessage');

        if (quizContainer) {
            quizContainer.style.display = 'none';
        }

        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }

        if (finalScore) {
            finalScore.textContent = `${results.score}/${results.total}`;
        }

        if (scorePercentage) {
            scorePercentage.textContent = `${results.percentage}%`;
        }

        if (resultsMessage) {
            resultsMessage.textContent = results.message;
        }
    }

    /**
     * Shows a loading state
     * @param {HTMLElement} container - Container element
     * @param {string} message - Loading message
     */
    showLoading(container, message = 'Loading...') {
        container.innerHTML = `<div class="loading">${this.escapeHtml(message)}</div>`;
    }

    /**
     * Shows an error message
     * @param {HTMLElement} container - Container element
     * @param {string} message - Error message
     */
    showError(container, message) {
        container.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
    }

    /**
     * Gets an icon emoji for a quiz
     * If the quiz has a custom icon property, use it. Otherwise, fall back to category-based icon.
     * @param {Object} quiz - Quiz object with optional icon property
     * @returns {string} Emoji icon
     */
    getIconForQuiz(quiz) {
        // If quiz has a custom icon, use it
        if (quiz.icon) {
            return quiz.icon;
        }

        // Otherwise, fall back to category-based icons
        return this.getIconForCategory(quiz.category);
    }

    /**
     * Gets an icon emoji for a quiz category (fallback method)
     * @param {string} category - Quiz category
     * @returns {string} Emoji icon
     */
    getIconForCategory(category) {
        const icons = {
            'general': '📚',
            'geography': '🌍',
            'history': '📜',
            'science': '🔬',
            'music': '🎵',
            'sports': '⚽',
            'literature': '📖',
            'art': '🎨',
            'javascript': '💻',
            'html': '🌐',
            'css': '🎨',
            'security': '🔒',
            'frontend': '🖥️',
            'backend': '⚙️',
            'database': '🗄️',
            'educacion': '🎓'
        };

        return icons[category?.toLowerCase()] || '📝';
    }

    /**
     * Escapes HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Capitalizes the first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
