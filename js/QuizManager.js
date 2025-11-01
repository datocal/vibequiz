/**
 * QuizManager.js
 * Handles quiz data loading, state management, and business logic
 */

import { RandomQuizGenerator } from './RandomQuizGenerator.js';

export class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
    }

    /**
     * Loads all categories from the manifest file
     * @returns {Promise<Array>} Array of category objects
     */
    async loadCategories() {
        try {
            const manifestResponse = await fetch('quizzes/manifest.json');
            if (!manifestResponse.ok) {
                throw new Error('Failed to load quiz manifest');
            }

            const manifest = await manifestResponse.json();
            const categories = manifest.categories || [];

            if (categories.length === 0) {
                console.warn('No categories found in manifest');
                return [];
            }

            return categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            throw new Error('Failed to load categories');
        }
    }

    /**
     * Loads quizzes for a specific category
     * @param {string} categoryId - The category ID
     * @returns {Promise<Object>} Object with category info and quizzes
     */
    async loadCategoryQuizzes(categoryId) {
        try {
            const manifestResponse = await fetch('quizzes/manifest.json');
            if (!manifestResponse.ok) {
                throw new Error('Failed to load quiz manifest');
            }

            const manifest = await manifestResponse.json();
            const category = manifest.categories.find(cat => cat.id === categoryId);

            if (!category) {
                throw new Error(`Category ${categoryId} not found`);
            }

            // Load all quiz metadata for this category in parallel
            const quizzes = await Promise.all(
                category.quizzes.map(async (filename) => {
                    try {
                        const response = await fetch(`quizzes/${categoryId}/${filename}`);
                        if (!response.ok) {
                            console.warn(`Failed to load ${filename}`);
                            return null;
                        }
                        const quiz = await response.json();
                        return {
                            ...quiz,
                            filename,
                            categoryId
                        };
                    } catch (error) {
                        console.error(`Error loading ${filename}:`, error);
                        return null;
                    }
                })
            );

            return {
                category,
                quizzes: quizzes.filter(quiz => quiz !== null)
            };
        } catch (error) {
            console.error('Error loading category quizzes:', error);
            throw new Error('Failed to load category quizzes');
        }
    }

    /**
     * Loads all available quizzes dynamically from the manifest file
     * @returns {Promise<Array>} Array of quiz metadata
     */
    async loadQuizList() {
        try {
            // Load the manifest file to get the list of available quizzes
            const manifestResponse = await fetch('quizzes/manifest.json');
            if (!manifestResponse.ok) {
                throw new Error('Failed to load quiz manifest');
            }

            const manifest = await manifestResponse.json();
            const categories = manifest.categories || [];

            if (categories.length === 0) {
                console.warn('No categories found in manifest');
                return [];
            }

            // Load all quizzes from all categories in parallel
            const allQuizzes = [];
            for (const category of categories) {
                const quizzes = await Promise.all(
                    category.quizzes.map(async (filename) => {
                        try {
                            const response = await fetch(`quizzes/${category.id}/${filename}`);
                            if (!response.ok) {
                                console.warn(`Failed to load ${filename}`);
                                return null;
                            }
                            const quiz = await response.json();
                            return {
                                ...quiz,
                                filename,
                                categoryId: category.id
                            };
                        } catch (error) {
                            console.error(`Error loading ${filename}:`, error);
                            return null;
                        }
                    })
                );
                allQuizzes.push(...quizzes.filter(quiz => quiz !== null));
            }

            return allQuizzes;
        } catch (error) {
            console.error('Error loading quiz list:', error);
            throw new Error('Failed to load quiz list');
        }
    }

    /**
     * Loads a specific quiz by filename (with category path support)
     * @param {string} filename - The quiz filename (can include category path like "lomloe/lomloe.json")
     * @param {boolean} sampleMode - If true, creates a 10-question sample from quizzes with >30 questions
     * @returns {Promise<Object>} The quiz data
     */
    async loadQuiz(filename, sampleMode = false) {
        try {
            // Support both old format (filename.json) and new format (category/filename.json)
            const quizPath = filename.includes('/') ? `quizzes/${filename}` : `quizzes/${filename}`;
            console.log('Loading quiz from:', quizPath, 'sampleMode:', sampleMode);
            const response = await fetch(quizPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let quiz = await response.json();
            console.log('Quiz loaded, questions:', quiz.questions?.length);

            // Validate quiz structure
            this.validateQuiz(quiz);

            // If sample mode is requested and quiz has more than 30 questions, create a sample
            if (sampleMode && quiz.questions.length > 30) {
                console.log('Creating sample quiz...');
                quiz = RandomQuizGenerator.createSampleQuiz(quiz, 10);
                console.log('Sample quiz created, questions:', quiz.questions?.length);
            }

            // Shuffle questions and options for variety
            quiz = RandomQuizGenerator.shuffleQuiz(quiz);

            this.currentQuiz = quiz;
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.answers = new Array(quiz.questions.length).fill(null);

            return quiz;
        } catch (error) {
            console.error('Error loading quiz (detailed):', error);
            throw error; // Re-throw original error instead of generic message
        }
    }

    /**
     * Loads all quizzes and returns them (for random quiz generation)
     * @param {string} categoryId - Optional category ID to load quizzes only from that category
     * @returns {Promise<Array>} Array of all quiz objects
     */
    async loadAllQuizzes(categoryId = null) {
        try {
            const manifestResponse = await fetch('quizzes/manifest.json');
            if (!manifestResponse.ok) {
                throw new Error('Failed to load quiz manifest');
            }

            const manifest = await manifestResponse.json();
            const categories = manifest.categories || [];

            // Filter categories if categoryId is provided
            const categoriesToLoad = categoryId
                ? categories.filter(cat => cat.id === categoryId)
                : categories;

            if (categoriesToLoad.length === 0) {
                console.warn('No categories found to load');
                return [];
            }

            // Load all quizzes from selected categories
            const allQuizzes = [];
            for (const category of categoriesToLoad) {
                const quizzes = await Promise.all(
                    category.quizzes.map(async (filename) => {
                        try {
                            const response = await fetch(`quizzes/${category.id}/${filename}`);
                            if (!response.ok) {
                                console.warn(`Failed to load ${filename}`);
                                return null;
                            }
                            return await response.json();
                        } catch (error) {
                            console.error(`Error loading ${filename}:`, error);
                            return null;
                        }
                    })
                );
                allQuizzes.push(...quizzes.filter(quiz => quiz !== null));
            }

            return allQuizzes;
        } catch (error) {
            console.error('Error loading all quizzes:', error);
            throw new Error('Failed to load quizzes');
        }
    }

    /**
     * Initializes a quiz from a quiz object (used for random quizzes)
     * @param {Object} quiz - The quiz object
     */
    initializeQuiz(quiz) {
        this.validateQuiz(quiz);

        // Shuffle questions and options (random quizzes are already somewhat random,
        // but this adds variety in question order and option order)
        const shuffledQuiz = RandomQuizGenerator.shuffleQuiz(quiz);

        this.currentQuiz = shuffledQuiz;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = new Array(shuffledQuiz.questions.length).fill(null);
    }

    /**
     * Validates the quiz structure
     * @param {Object} quiz - The quiz object to validate
     * @throws {Error} If quiz structure is invalid
     */
    validateQuiz(quiz) {
        if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
            throw new Error('Invalid quiz structure');
        }

        quiz.questions.forEach((question, index) => {
            if (!question.question || !question.options || !Array.isArray(question.options)) {
                throw new Error(`Invalid question structure at index ${index}`);
            }
            if (typeof question.correctAnswer !== 'number') {
                throw new Error(`Missing or invalid correctAnswer at index ${index}`);
            }
        });
    }

    /**
     * Gets the current question
     * @returns {Object|null} The current question object
     */
    getCurrentQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.currentQuiz.questions.length) {
            return null;
        }
        return this.currentQuiz.questions[this.currentQuestionIndex];
    }

    /**
     * Submits an answer for the current question
     * @param {number} answerIndex - The index of the selected answer
     * @returns {Object} Result object with isCorrect, correctAnswer, and explanation
     */
    submitAnswer(answerIndex) {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) {
            throw new Error('No current question available');
        }

        const isCorrect = answerIndex === currentQuestion.correctAnswer;

        if (isCorrect) {
            this.score++;
        }

        this.answers[this.currentQuestionIndex] = {
            questionIndex: this.currentQuestionIndex,
            selectedAnswer: answerIndex,
            isCorrect,
            timestamp: new Date().toISOString()
        };

        return {
            isCorrect,
            correctAnswer: currentQuestion.correctAnswer,
            explanation: currentQuestion.explanation || null
        };
    }

    /**
     * Moves to the next question
     * @returns {boolean} True if there are more questions, false if quiz is complete
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }

    /**
     * Checks if there are more questions
     * @returns {boolean} True if there are more questions
     */
    hasNextQuestion() {
        return this.currentQuestionIndex < this.currentQuiz.questions.length - 1;
    }

    /**
     * Gets the current question number (1-indexed)
     * @returns {number} The current question number
     */
    getCurrentQuestionNumber() {
        return this.currentQuestionIndex + 1;
    }

    /**
     * Gets the total number of questions
     * @returns {number} Total number of questions
     */
    getTotalQuestions() {
        return this.currentQuiz ? this.currentQuiz.questions.length : 0;
    }

    /**
     * Gets the progress percentage
     * @returns {number} Progress as a percentage (0-100)
     */
    getProgress() {
        if (!this.currentQuiz) return 0;
        return Math.round(((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100);
    }

    /**
     * Gets the final results
     * @returns {Object} Results object with score, percentage, and message
     */
    getResults() {
        const total = this.getTotalQuestions();
        const percentage = Math.round((this.score / total) * 100);

        let message = '';
        if (percentage === 100) {
            message = 'Perfect! You\'re a true expert!';
        } else if (percentage >= 80) {
            message = 'Excellent work! You really know your stuff!';
        } else if (percentage >= 60) {
            message = 'Good job! Keep learning and you\'ll master this!';
        } else if (percentage >= 40) {
            message = 'Not bad! Review the material and try again!';
        } else {
            message = 'Keep studying! Practice makes perfect!';
        }

        return {
            score: this.score,
            total,
            percentage,
            message,
            answers: this.answers
        };
    }

    /**
     * Resets the quiz to start over
     */
    reset() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = new Array(this.currentQuiz.questions.length).fill(null);
    }

    /**
     * Gets quiz metadata (title, description, etc.)
     * @returns {Object} Quiz metadata
     */
    getQuizMetadata() {
        if (!this.currentQuiz) return null;

        return {
            title: this.currentQuiz.title,
            description: this.currentQuiz.description,
            difficulty: this.currentQuiz.difficulty,
            category: this.currentQuiz.category
        };
    }
}
