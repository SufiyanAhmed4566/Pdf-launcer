<<<<<<< HEAD
// feedback-module.js - Reusable feedback form for all pages
class FeedbackFormManager {
    constructor() {
        this.initialized = false;
        this.currentOperation = '';
        this.currentOperationFunction = null;
    }

    init() {
        if (this.initialized) return;
        
        this.createFormHTML();
        this.bindEvents();
        this.createCelebrationConfetti();
        this.initialized = true;
        
        console.log('🎯 Feedback form manager initialized');
    }

    createFormHTML() {
        const formHTML = `
        <div class="feedback-overlay" id="feedbackOverlay">
            <div class="feedback-form">
                <div class="floating-emoji">🎉</div>
                <div class="floating-emoji">✨</div>
                <div class="floating-emoji">🚀</div>
                <div class="floating-emoji">⭐</div>
                
                <button class="close-feedback" id="closeFeedback">✕</button>
                
                <div class="feedback-header">
                    <h2>Help Us Improve! 🎊</h2>
                    <p>We're new and super excited to make PDF Nest amazing for you! Share your thoughts and make us better together! 💫</p>
                </div>

                <div class="form-progress">
                    <div class="progress-dot active"></div>
                    <div class="progress-dot"></div>
                    <div class="progress-dot"></div>
                </div>

                <form id="userFeedbackForm">
                    <div class="form-group">
                        <label class="form-label" for="userName">Your Awesome Name *</label>
                        <input type="text" id="userName" class="form-input" required placeholder="What should we call you?">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userEmail">Email Address *</label>
                        <input type="email" id="userEmail" class="form-input" required placeholder="your.awesome@email.com">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userLocation">Where in the World? *</label>
                        <input type="text" id="userLocation" class="form-input" required placeholder="City, Country 🌍">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userType">I'm a Super... *</label>
                        <select id="userType" class="form-select" required>
                            <option value="">Choose your superhero role 🦸</option>
                            <option value="student">Student 📚</option>
                            <option value="professional">Working Professional 💼</option>
                            <option value="business">Business Owner 🏢</option>
                            <option value="educator">Educator/Teacher 🍎</option>
                            <option value="other">Other 🌟</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="ageGroup">Age Group *</label>
                        <select id="ageGroup" class="form-select" required>
                            <option value="">Select your vibe age group 🎂</option>
                            <option value="under-18">Under 18 👶</option>
                            <option value="18-24">18-24 🎓</option>
                            <option value="25-34">25-34 💪</option>
                            <option value="35-44">35-44 🎯</option>
                            <option value="45-54">45-54 🚀</option>
                            <option value="55-plus">55+ 👑</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">How was your PDF experience? *</label>
                        <div class="emoji-rating-group">
                            <div class="emoji-rating-item" data-rating="1">
                                <span class="emoji-icon">😞</span>
                                <div class="emoji-label">Poor</div>
                                <div class="emoji-description">Needs work</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="2">
                                <span class="emoji-icon">😐</span>
                                <div class="emoji-label">Okay</div>
                                <div class="emoji-description">It's alright</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="3">
                                <span class="emoji-icon">😊</span>
                                <div class="emoji-label">Good</div>
                                <div class="emoji-description">Pretty good!</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="4">
                                <span class="emoji-icon">😄</span>
                                <div class="emoji-label">Great</div>
                                <div class="emoji-description">Really liked it!</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="5">
                                <span class="emoji-icon">🤩</span>
                                <div class="emoji-label">Amazing!</div>
                                <div class="emoji-description">Absolutely loved it!</div>
                            </div>
                        </div>
                        <input type="hidden" id="userRating" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userFeedback">Your Thoughts & Ideas 💭</label>
                        <textarea id="userFeedback" class="form-textarea" required placeholder="Tell us what you loved, what could be better, or any brilliant ideas you have... We're all ears! 👂"></textarea>
                    </div>

                    <div class="checkbox-group">
                        <input type="checkbox" id="agreeTerms" class="checkbox-input" required>
                        <label for="agreeTerms" class="checkbox-label">
                            🎯 I'm excited to help improve PDF Nest! I agree to share this info to make the website more awesome. My data will be used only for making your experience better! 
                            <span style="color: var(--primary); font-weight: 600;">You're helping build something great! 🚀</span>
                        </label>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="submit-btn submit-btn-emoji" id="submitFeedback">
                            <i class="fas fa-rocket"></i>
                            Launch & Download! 🚀
                        </button>
                    
                    </div>
                </form>
            </div>
        </div>

        <div class="celebration" id="celebration"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHTML);
    }

    bindEvents() {
        // Emoji rating selection
        document.querySelectorAll('.emoji-rating-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectRating(e.currentTarget);
            });
        });

        // Form submission
        document.getElementById('userFeedbackForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Close feedback
        document.getElementById('closeFeedback').addEventListener('click', () => {
            this.hideFeedbackForm();
        });
    }

    selectRating(ratingItem) {
        document.querySelectorAll('.emoji-rating-item').forEach(item => {
            item.classList.remove('selected');
        });

        ratingItem.classList.add('selected');
        document.getElementById('userRating').value = ratingItem.getAttribute('data-rating');
        this.animateRatingSelection(ratingItem);
    }

    animateRatingSelection(ratingItem) {
        const emoji = ratingItem.querySelector('.emoji-icon');
        emoji.style.animation = 'none';
        setTimeout(() => {
            emoji.style.animation = 'bounce 0.6s ease';
        }, 10);
    }

    async handleFormSubmit() {
        const rating = document.getElementById('userRating').value;
        if (!rating) {
            this.shakeRatingGroup();
            return;
        }

        const submitBtn = document.getElementById('submitFeedback');
        submitBtn.innerHTML = '<div class="spinner"></div> Launching... 🚀';
        submitBtn.disabled = true;

        try {
            const userData = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                location: document.getElementById('userLocation').value,
                user_type: document.getElementById('userType').value,
                age_group: document.getElementById('ageGroup').value,
                rating: rating,
                feedback: document.getElementById('userFeedback').value,
                feature_used: this.currentOperation
            };

            const saveResponse = await fetch('/api/save_user_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const saveResult = await saveResponse.json();
            
            if (saveResult.status === 'success') {
                this.showCelebration();
                setTimeout(() => {
                    this.currentOperationFunction();
                    this.hideFeedbackForm();
                }, 2000);
            } else {
                alert('Oops! Something went wrong: ' + saveResult.message);
            }
        } catch (error) {
            console.error('Feedback submission failed:', error);
            alert('Submission failed. Please try again.');
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Launch & Download! 🚀';
            submitBtn.disabled = false;
        }
    }

    showFeedbackForm(operationType, operationFunction) {
        this.currentOperation = operationType;
        this.currentOperationFunction = operationFunction;
        
        document.getElementById('feedbackOverlay').classList.add('show');
        document.body.style.overflow = 'hidden';
        this.resetForm();
    }

    hideFeedbackForm() {
        document.getElementById('feedbackOverlay').classList.remove('show');
        document.body.style.overflow = '';
    }

    resetForm() {
        document.getElementById('userFeedbackForm').reset();
        document.querySelectorAll('.emoji-rating-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.getElementById('userRating').value = '';
    }

    shakeRatingGroup() {
        const ratingGroup = document.querySelector('.emoji-rating-group');
        ratingGroup.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            ratingGroup.style.animation = '';
        }, 500);
    }

    createCelebrationConfetti() {
        const celebration = document.getElementById('celebration');
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4ade80', '#f59e0b', '#ef4444'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            celebration.appendChild(confetti);
        }
    }

    showCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.classList.add('show');
        
        setTimeout(() => {
            celebration.classList.remove('show');
        }, 3000);
    }
}

// Create global instance
window.FeedbackManager = new FeedbackFormManager();

// Add CSS styles dynamically
const feedbackStyles = `
<style>
    .feedback-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 2000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .feedback-overlay.show {
        display: flex;
    }

    .feedback-form {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        position: relative;
    }

    .feedback-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .feedback-header h2 {
        color: var(--dark);
        font-size: 1.75rem;
        margin-bottom: 0.5rem;
    }

    .feedback-header p {
        color: var(--gray);
        line-height: 1.5;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--dark);
    }

    .form-input, .form-select, .form-textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
        outline: none;
        border-color: var(--primary);
    }

    .form-textarea {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
    }

    .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .checkbox-input {
        margin-top: 0.25rem;
    }

    .checkbox-label {
        font-size: 0.9rem;
        color: var(--gray);
        line-height: 1.4;
    }

    .form-actions {
        display: flex;
        gap: 1rem;
    }

    .submit-btn {
        flex: 1;
        background: var(--gradient);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
    }

    .submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .close-feedback {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--gray);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 6px;
        transition: all 0.3s ease;
    }

    .close-feedback:hover {
        background: #f1f5f9;
        color: var(--dark);
    }

    /* Enhanced Emoji Rating System - Mobile Optimized */
    .emoji-rating-group {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        margin: 1.5rem 0;
        flex-wrap: wrap;
    }

    .emoji-rating-item {
        flex: 1;
        text-align: center;
        padding: 0.75rem 0.25rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        background: white;
        position: relative;
        overflow: hidden;
        min-width: 0;
    }

    .emoji-rating-item:hover {
        transform: translateY(-3px) scale(1.03);
        border-color: var(--primary);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    }

    .emoji-rating-item.selected {
        border-color: var(--primary);
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 6px 15px rgba(102, 126, 234, 0.1);
    }

    .emoji-rating-item.selected::before {
        content: '✓';
        position: absolute;
        top: 3px;
        right: 3px;
        width: 16px;
        height: 16px;
        background: var(--success);
        color: white;
        border-radius: 50%;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: bounceIn 0.6s ease;
    }

    .emoji-icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
        display: block;
        transition: all 0.3s ease;
        filter: grayscale(0.3);
    }

    .emoji-rating-item:hover .emoji-icon {
        transform: scale(1.1) rotate(3deg);
        filter: grayscale(0);
    }

    .emoji-rating-item.selected .emoji-icon {
        transform: scale(1.2);
        filter: grayscale(0);
        animation: bounce 0.6s ease;
    }

    .emoji-label {
        font-weight: 600;
        color: var(--dark);
        font-size: 0.8rem;
        transition: color 0.3s ease;
        line-height: 1.2;
    }

    .emoji-rating-item.selected .emoji-label {
        color: var(--primary);
    }

    .emoji-description {
        font-size: 0.7rem;
        color: var(--gray);
        margin-top: 0.125rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        height: 0;
        line-height: 1.1;
    }

    .emoji-rating-item:hover .emoji-description,
    .emoji-rating-item.selected .emoji-description {
        opacity: 1;
        height: auto;
    }

    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: scale(1.2); }
        40% { transform: scale(1.3); }
        80% { transform: scale(1.25); }
    }

    @keyframes bounceIn {
        0% { transform: scale(0); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }

    .floating-emoji {
        position: absolute;
        font-size: 1.5rem;
        opacity: 0.1;
        animation: float 6s ease-in-out infinite;
        z-index: -1;
    }

    .floating-emoji:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
    .floating-emoji:nth-child(2) { top: 20%; right: 10%; animation-delay: 1s; }
    .floating-emoji:nth-child(3) { bottom: 30%; left: 15%; animation-delay: 2s; }
    .floating-emoji:nth-child(4) { bottom: 20%; right: 5%; animation-delay: 3s; }

    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(10deg); }
    }

    .form-progress {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .progress-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #e2e8f0;
        transition: all 0.3s ease;
    }

    .progress-dot.active {
        background: var(--primary);
        transform: scale(1.3);
    }

    .submit-btn-emoji {
        position: relative;
        overflow: hidden;
    }

    .submit-btn-emoji::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: left 0.5s;
    }

    .submit-btn-emoji:hover::before {
        left: 100%;
    }

    .celebration {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3000;
        display: none;
    }

    .celebration.show {
        display: block;
    }

    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background: var(--primary);
        animation: confettiFall 3s ease-in-out forwards;
    }

    @keyframes confettiFall {
        0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }

    /* Mobile-specific optimizations */
    @media (max-width: 768px) {
        .feedback-form {
            padding: 1.5rem;
            margin: 1rem;
        }
        
        .form-actions {
            flex-direction: column;
        }
        
        .emoji-rating-group {
            gap: 0.25rem;
            margin: 1rem 0;
        }
        
        .emoji-rating-item {
            padding: 0.5rem 0.125rem;
            border-radius: 8px;
            min-width: 55px;
        }
        
        .emoji-icon {
            font-size: 1.25rem;
            margin-bottom: 0.125rem;
        }
        
        .emoji-label {
            font-size: 0.7rem;
        }
        
        .emoji-description {
            font-size: 0.6rem;
        }
        
        .emoji-rating-item.selected::before {
            width: 14px;
            height: 14px;
            font-size: 0.6rem;
            top: 2px;
            right: 2px;
        }
    }

    @media (max-width: 480px) {
        .emoji-rating-group {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }
        
        .emoji-rating-item {
            min-width: auto;
            padding: 0.75rem 0.25rem;
        }
        
        .emoji-icon {
            font-size: 1.5rem;
        }
        
        .emoji-label {
            font-size: 0.75rem;
        }
        
        /* Make the last row centered if we have 5 items */
        .emoji-rating-item:nth-child(4) {
            grid-column: 1 / 2;
        }
        
        .emoji-rating-item:nth-child(5) {
            grid-column: 2 / 3;
        }
    }

    /* For very small screens */
    @media (max-width: 360px) {
        .emoji-rating-group {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.375rem;
        }
        
        .emoji-rating-item {
            padding: 0.5rem 0.125rem;
        }
        
        .emoji-icon {
            font-size: 1.25rem;
        }
        
        .emoji-label {
            font-size: 0.7rem;
        }
        
        .emoji-description {
            font-size: 0.6rem;
        }
        
        /* Adjust grid for 5 items in 2 columns */
        .emoji-rating-item:nth-child(4) {
            grid-column: 1 / 2;
        }
        
        .emoji-rating-item:nth-child(5) {
            grid-column: 2 / 3;
        }
    }
</style>
`;

=======
// feedback-module.js - Reusable feedback form for all pages
class FeedbackFormManager {
    constructor() {
        this.initialized = false;
        this.currentOperation = '';
        this.currentOperationFunction = null;
    }

    init() {
        if (this.initialized) return;
        
        this.createFormHTML();
        this.bindEvents();
        this.createCelebrationConfetti();
        this.initialized = true;
        
        console.log('🎯 Feedback form manager initialized');
    }

    createFormHTML() {
        const formHTML = `
        <div class="feedback-overlay" id="feedbackOverlay">
            <div class="feedback-form">
                <div class="floating-emoji">🎉</div>
                <div class="floating-emoji">✨</div>
                <div class="floating-emoji">🚀</div>
                <div class="floating-emoji">⭐</div>
                
                <button class="close-feedback" id="closeFeedback">✕</button>
                
                <div class="feedback-header">
                    <h2>Help Us Improve! 🎊</h2>
                    <p>We're new and super excited to make PDF Nest amazing for you! Share your thoughts and make us better together! 💫</p>
                </div>

                <div class="form-progress">
                    <div class="progress-dot active"></div>
                    <div class="progress-dot"></div>
                    <div class="progress-dot"></div>
                </div>

                <form id="userFeedbackForm">
                    <div class="form-group">
                        <label class="form-label" for="userName">Your Awesome Name *</label>
                        <input type="text" id="userName" class="form-input" required placeholder="What should we call you?">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userEmail">Email Address *</label>
                        <input type="email" id="userEmail" class="form-input" required placeholder="your.awesome@email.com">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userLocation">Where in the World? *</label>
                        <input type="text" id="userLocation" class="form-input" required placeholder="City, Country 🌍">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userType">I'm a Super... *</label>
                        <select id="userType" class="form-select" required>
                            <option value="">Choose your superhero role 🦸</option>
                            <option value="student">Student 📚</option>
                            <option value="professional">Working Professional 💼</option>
                            <option value="business">Business Owner 🏢</option>
                            <option value="educator">Educator/Teacher 🍎</option>
                            <option value="other">Other 🌟</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="ageGroup">Age Group *</label>
                        <select id="ageGroup" class="form-select" required>
                            <option value="">Select your vibe age group 🎂</option>
                            <option value="under-18">Under 18 👶</option>
                            <option value="18-24">18-24 🎓</option>
                            <option value="25-34">25-34 💪</option>
                            <option value="35-44">35-44 🎯</option>
                            <option value="45-54">45-54 🚀</option>
                            <option value="55-plus">55+ 👑</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">How was your PDF experience? *</label>
                        <div class="emoji-rating-group">
                            <div class="emoji-rating-item" data-rating="1">
                                <span class="emoji-icon">😞</span>
                                <div class="emoji-label">Poor</div>
                                <div class="emoji-description">Needs work</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="2">
                                <span class="emoji-icon">😐</span>
                                <div class="emoji-label">Okay</div>
                                <div class="emoji-description">It's alright</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="3">
                                <span class="emoji-icon">😊</span>
                                <div class="emoji-label">Good</div>
                                <div class="emoji-description">Pretty good!</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="4">
                                <span class="emoji-icon">😄</span>
                                <div class="emoji-label">Great</div>
                                <div class="emoji-description">Really liked it!</div>
                            </div>
                            <div class="emoji-rating-item" data-rating="5">
                                <span class="emoji-icon">🤩</span>
                                <div class="emoji-label">Amazing!</div>
                                <div class="emoji-description">Absolutely loved it!</div>
                            </div>
                        </div>
                        <input type="hidden" id="userRating" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="userFeedback">Your Thoughts & Ideas 💭</label>
                        <textarea id="userFeedback" class="form-textarea" required placeholder="Tell us what you loved, what could be better, or any brilliant ideas you have... We're all ears! 👂"></textarea>
                    </div>

                    <div class="checkbox-group">
                        <input type="checkbox" id="agreeTerms" class="checkbox-input" required>
                        <label for="agreeTerms" class="checkbox-label">
                            🎯 I'm excited to help improve PDF Nest! I agree to share this info to make the website more awesome. My data will be used only for making your experience better! 
                            <span style="color: var(--primary); font-weight: 600;">You're helping build something great! 🚀</span>
                        </label>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="submit-btn submit-btn-emoji" id="submitFeedback">
                            <i class="fas fa-rocket"></i>
                            Launch & Download! 🚀
                        </button>
                    
                    </div>
                </form>
            </div>
        </div>

        <div class="celebration" id="celebration"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHTML);
    }

    bindEvents() {
        // Emoji rating selection
        document.querySelectorAll('.emoji-rating-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectRating(e.currentTarget);
            });
        });

        // Form submission
        document.getElementById('userFeedbackForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Close feedback
        document.getElementById('closeFeedback').addEventListener('click', () => {
            this.hideFeedbackForm();
        });
    }

    selectRating(ratingItem) {
        document.querySelectorAll('.emoji-rating-item').forEach(item => {
            item.classList.remove('selected');
        });

        ratingItem.classList.add('selected');
        document.getElementById('userRating').value = ratingItem.getAttribute('data-rating');
        this.animateRatingSelection(ratingItem);
    }

    animateRatingSelection(ratingItem) {
        const emoji = ratingItem.querySelector('.emoji-icon');
        emoji.style.animation = 'none';
        setTimeout(() => {
            emoji.style.animation = 'bounce 0.6s ease';
        }, 10);
    }

    async handleFormSubmit() {
        const rating = document.getElementById('userRating').value;
        if (!rating) {
            this.shakeRatingGroup();
            return;
        }

        const submitBtn = document.getElementById('submitFeedback');
        submitBtn.innerHTML = '<div class="spinner"></div> Launching... 🚀';
        submitBtn.disabled = true;

        try {
            const userData = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                location: document.getElementById('userLocation').value,
                user_type: document.getElementById('userType').value,
                age_group: document.getElementById('ageGroup').value,
                rating: rating,
                feedback: document.getElementById('userFeedback').value,
                feature_used: this.currentOperation
            };

            const saveResponse = await fetch('/api/save_user_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const saveResult = await saveResponse.json();
            
            if (saveResult.status === 'success') {
                this.showCelebration();
                setTimeout(() => {
                    this.currentOperationFunction();
                    this.hideFeedbackForm();
                }, 2000);
            } else {
                alert('Oops! Something went wrong: ' + saveResult.message);
            }
        } catch (error) {
            console.error('Feedback submission failed:', error);
            alert('Submission failed. Please try again.');
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Launch & Download! 🚀';
            submitBtn.disabled = false;
        }
    }

    showFeedbackForm(operationType, operationFunction) {
        this.currentOperation = operationType;
        this.currentOperationFunction = operationFunction;
        
        document.getElementById('feedbackOverlay').classList.add('show');
        document.body.style.overflow = 'hidden';
        this.resetForm();
    }

    hideFeedbackForm() {
        document.getElementById('feedbackOverlay').classList.remove('show');
        document.body.style.overflow = '';
    }

    resetForm() {
        document.getElementById('userFeedbackForm').reset();
        document.querySelectorAll('.emoji-rating-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.getElementById('userRating').value = '';
    }

    shakeRatingGroup() {
        const ratingGroup = document.querySelector('.emoji-rating-group');
        ratingGroup.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            ratingGroup.style.animation = '';
        }, 500);
    }

    createCelebrationConfetti() {
        const celebration = document.getElementById('celebration');
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4ade80', '#f59e0b', '#ef4444'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            celebration.appendChild(confetti);
        }
    }

    showCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.classList.add('show');
        
        setTimeout(() => {
            celebration.classList.remove('show');
        }, 3000);
    }
}

// Create global instance
window.FeedbackManager = new FeedbackFormManager();

// Add CSS styles dynamically
const feedbackStyles = `
<style>
    .feedback-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 2000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .feedback-overlay.show {
        display: flex;
    }

    .feedback-form {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        position: relative;
    }

    .feedback-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .feedback-header h2 {
        color: var(--dark);
        font-size: 1.75rem;
        margin-bottom: 0.5rem;
    }

    .feedback-header p {
        color: var(--gray);
        line-height: 1.5;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--dark);
    }

    .form-input, .form-select, .form-textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
        outline: none;
        border-color: var(--primary);
    }

    .form-textarea {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
    }

    .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .checkbox-input {
        margin-top: 0.25rem;
    }

    .checkbox-label {
        font-size: 0.9rem;
        color: var(--gray);
        line-height: 1.4;
    }

    .form-actions {
        display: flex;
        gap: 1rem;
    }

    .submit-btn {
        flex: 1;
        background: var(--gradient);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
    }

    .submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .close-feedback {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--gray);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 6px;
        transition: all 0.3s ease;
    }

    .close-feedback:hover {
        background: #f1f5f9;
        color: var(--dark);
    }

    /* Enhanced Emoji Rating System - Mobile Optimized */
    .emoji-rating-group {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        margin: 1.5rem 0;
        flex-wrap: wrap;
    }

    .emoji-rating-item {
        flex: 1;
        text-align: center;
        padding: 0.75rem 0.25rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        background: white;
        position: relative;
        overflow: hidden;
        min-width: 0;
    }

    .emoji-rating-item:hover {
        transform: translateY(-3px) scale(1.03);
        border-color: var(--primary);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    }

    .emoji-rating-item.selected {
        border-color: var(--primary);
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 6px 15px rgba(102, 126, 234, 0.1);
    }

    .emoji-rating-item.selected::before {
        content: '✓';
        position: absolute;
        top: 3px;
        right: 3px;
        width: 16px;
        height: 16px;
        background: var(--success);
        color: white;
        border-radius: 50%;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: bounceIn 0.6s ease;
    }

    .emoji-icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
        display: block;
        transition: all 0.3s ease;
        filter: grayscale(0.3);
    }

    .emoji-rating-item:hover .emoji-icon {
        transform: scale(1.1) rotate(3deg);
        filter: grayscale(0);
    }

    .emoji-rating-item.selected .emoji-icon {
        transform: scale(1.2);
        filter: grayscale(0);
        animation: bounce 0.6s ease;
    }

    .emoji-label {
        font-weight: 600;
        color: var(--dark);
        font-size: 0.8rem;
        transition: color 0.3s ease;
        line-height: 1.2;
    }

    .emoji-rating-item.selected .emoji-label {
        color: var(--primary);
    }

    .emoji-description {
        font-size: 0.7rem;
        color: var(--gray);
        margin-top: 0.125rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        height: 0;
        line-height: 1.1;
    }

    .emoji-rating-item:hover .emoji-description,
    .emoji-rating-item.selected .emoji-description {
        opacity: 1;
        height: auto;
    }

    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: scale(1.2); }
        40% { transform: scale(1.3); }
        80% { transform: scale(1.25); }
    }

    @keyframes bounceIn {
        0% { transform: scale(0); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }

    .floating-emoji {
        position: absolute;
        font-size: 1.5rem;
        opacity: 0.1;
        animation: float 6s ease-in-out infinite;
        z-index: -1;
    }

    .floating-emoji:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
    .floating-emoji:nth-child(2) { top: 20%; right: 10%; animation-delay: 1s; }
    .floating-emoji:nth-child(3) { bottom: 30%; left: 15%; animation-delay: 2s; }
    .floating-emoji:nth-child(4) { bottom: 20%; right: 5%; animation-delay: 3s; }

    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(10deg); }
    }

    .form-progress {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .progress-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #e2e8f0;
        transition: all 0.3s ease;
    }

    .progress-dot.active {
        background: var(--primary);
        transform: scale(1.3);
    }

    .submit-btn-emoji {
        position: relative;
        overflow: hidden;
    }

    .submit-btn-emoji::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: left 0.5s;
    }

    .submit-btn-emoji:hover::before {
        left: 100%;
    }

    .celebration {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3000;
        display: none;
    }

    .celebration.show {
        display: block;
    }

    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background: var(--primary);
        animation: confettiFall 3s ease-in-out forwards;
    }

    @keyframes confettiFall {
        0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }

    /* Mobile-specific optimizations */
    @media (max-width: 768px) {
        .feedback-form {
            padding: 1.5rem;
            margin: 1rem;
        }
        
        .form-actions {
            flex-direction: column;
        }
        
        .emoji-rating-group {
            gap: 0.25rem;
            margin: 1rem 0;
        }
        
        .emoji-rating-item {
            padding: 0.5rem 0.125rem;
            border-radius: 8px;
            min-width: 55px;
        }
        
        .emoji-icon {
            font-size: 1.25rem;
            margin-bottom: 0.125rem;
        }
        
        .emoji-label {
            font-size: 0.7rem;
        }
        
        .emoji-description {
            font-size: 0.6rem;
        }
        
        .emoji-rating-item.selected::before {
            width: 14px;
            height: 14px;
            font-size: 0.6rem;
            top: 2px;
            right: 2px;
        }
    }

    @media (max-width: 480px) {
        .emoji-rating-group {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }
        
        .emoji-rating-item {
            min-width: auto;
            padding: 0.75rem 0.25rem;
        }
        
        .emoji-icon {
            font-size: 1.5rem;
        }
        
        .emoji-label {
            font-size: 0.75rem;
        }
        
        /* Make the last row centered if we have 5 items */
        .emoji-rating-item:nth-child(4) {
            grid-column: 1 / 2;
        }
        
        .emoji-rating-item:nth-child(5) {
            grid-column: 2 / 3;
        }
    }

    /* For very small screens */
    @media (max-width: 360px) {
        .emoji-rating-group {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.375rem;
        }
        
        .emoji-rating-item {
            padding: 0.5rem 0.125rem;
        }
        
        .emoji-icon {
            font-size: 1.25rem;
        }
        
        .emoji-label {
            font-size: 0.7rem;
        }
        
        .emoji-description {
            font-size: 0.6rem;
        }
        
        /* Adjust grid for 5 items in 2 columns */
        .emoji-rating-item:nth-child(4) {
            grid-column: 1 / 2;
        }
        
        .emoji-rating-item:nth-child(5) {
            grid-column: 2 / 3;
        }
    }
</style>
`;

>>>>>>> 3a75e8643aecff5b3c89fd60d368ac665591022d
document.head.insertAdjacentHTML('beforeend', feedbackStyles);