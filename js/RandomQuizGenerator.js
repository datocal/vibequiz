/**
 * RandomQuizGenerator.js
 * Utility class for generating random quizzes from multiple sources
 * Follows Single Responsibility Principle - only handles random quiz generation
 */

export class RandomQuizGenerator {
    /**
     * Shuffles an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled copy of the array
     */
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Selects N random elements from an array
     * @param {Array} array - Source array
     * @param {number} count - Number of elements to select
     * @returns {Array} Array of random elements
     */
    static selectRandom(array, count) {
        const shuffled = this.shuffle(array);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * Shuffles the options of a question while updating the correctAnswer index
     * @param {Object} question - Question object with options and correctAnswer
     * @returns {Object} New question object with shuffled options
     */
    static shuffleQuestionOptions(question) {
        const { options, correctAnswer, ...rest } = question;

        // Create array of indices to track original positions
        const indices = options.map((_, index) => index);
        const shuffledIndices = this.shuffle(indices);

        // Shuffle options based on shuffled indices
        const shuffledOptions = shuffledIndices.map(index => options[index]);

        // Find where the correct answer moved to
        const newCorrectAnswer = shuffledIndices.indexOf(correctAnswer);

        return {
            ...rest,
            options: shuffledOptions,
            correctAnswer: newCorrectAnswer
        };
    }

    /**
     * Shuffles all questions in a quiz and their options
     * @param {Object} quiz - Quiz object
     * @returns {Object} New quiz object with shuffled questions and options
     */
    static shuffleQuiz(quiz) {
        if (!quiz || !quiz.questions) {
            return quiz;
        }

        // Shuffle the order of questions
        const shuffledQuestions = this.shuffle(quiz.questions);

        // Shuffle options within each question
        const questionsWithShuffledOptions = shuffledQuestions.map(q =>
            this.shuffleQuestionOptions(q)
        );

        return {
            ...quiz,
            questions: questionsWithShuffledOptions
        };
    }

    /**
     * Extracts all questions from multiple quizzes
     * @param {Array} quizzes - Array of quiz objects
     * @returns {Array} Array of all questions with source metadata
     */
    static extractAllQuestions(quizzes) {
        const allQuestions = [];

        quizzes.forEach(quiz => {
            if (!quiz.questions || !Array.isArray(quiz.questions)) {
                return;
            }

            quiz.questions.forEach(question => {
                allQuestions.push({
                    ...question,
                    sourceQuiz: quiz.title,
                    sourceCategory: quiz.category,
                    sourceDifficulty: quiz.difficulty
                });
            });
        });

        return allQuestions;
    }

    /**
     * Creates a random quiz from multiple quizzes
     * @param {Array} quizzes - Array of source quiz objects
     * @param {Object} options - Configuration options
     * @param {number} options.count - Number of questions to select (default: 10)
     * @param {string} options.title - Title for the random quiz
     * @param {string} options.description - Description for the random quiz
     * @returns {Object} A new quiz object with random questions
     */
    static createRandomQuiz(quizzes, options = {}) {
        const {
            count = 20,
            title = 'Random Party Quiz',
            description = 'A random selection of questions from all available quizzes'
        } = options;

        // Extract all questions from all quizzes
        const allQuestions = this.extractAllQuestions(quizzes);

        if (allQuestions.length === 0) {
            throw new Error('No questions available to create random quiz');
        }

        // Select random questions
        const selectedQuestions = this.selectRandom(allQuestions, count);

        // Determine overall difficulty based on question distribution
        const difficulty = this.calculateOverallDifficulty(selectedQuestions);

        // Determine most common category
        const category = this.determinePrimaryCategory(selectedQuestions);

        // Create the random quiz object
        return {
            title,
            description,
            category,
            difficulty,
            questions: selectedQuestions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation
            })),
            isRandomQuiz: true,
            sourceQuizzes: this.getUniqueSourceQuizzes(selectedQuestions)
        };
    }

    /**
     * Calculates overall difficulty based on question distribution
     * @param {Array} questions - Array of questions with difficulty metadata
     * @returns {string} Overall difficulty level
     */
    static calculateOverallDifficulty(questions) {
        const difficultyCounts = {
            easy: 0,
            medium: 0,
            hard: 0
        };

        questions.forEach(q => {
            const diff = q.sourceDifficulty?.toLowerCase();
            if (difficultyCounts.hasOwnProperty(diff)) {
                difficultyCounts[diff]++;
            }
        });

        // Determine overall difficulty
        const total = questions.length;
        const hardRatio = difficultyCounts.hard / total;
        const easyRatio = difficultyCounts.easy / total;

        if (hardRatio >= 0.5) return 'hard';
        if (easyRatio >= 0.5) return 'easy';
        return 'medium';
    }

    /**
     * Determines the primary category based on question distribution
     * @param {Array} questions - Array of questions with category metadata
     * @returns {string} Primary category
     */
    static determinePrimaryCategory(questions) {
        const categoryCounts = {};

        questions.forEach(q => {
            const category = q.sourceCategory || 'general';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // Find the most common category
        let maxCount = 0;
        let primaryCategory = 'general';

        Object.entries(categoryCounts).forEach(([category, count]) => {
            if (count > maxCount) {
                maxCount = count;
                primaryCategory = category;
            }
        });

        return primaryCategory;
    }

    /**
     * Gets unique source quiz titles
     * @param {Array} questions - Array of questions with source metadata
     * @returns {Array} Array of unique quiz titles
     */
    static getUniqueSourceQuizzes(questions) {
        const sources = new Set();
        questions.forEach(q => {
            if (q.sourceQuiz) {
                sources.add(q.sourceQuiz);
            }
        });
        return Array.from(sources);
    }

    /**
     * Validates if a quiz object is valid
     * @param {Object} quiz - Quiz object to validate
     * @returns {boolean} True if valid
     */
    static isValidQuiz(quiz) {
        return quiz &&
               typeof quiz === 'object' &&
               quiz.questions &&
               Array.isArray(quiz.questions) &&
               quiz.questions.length > 0;
    }
}
