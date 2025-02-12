// Loading quotes with more variety
const quotes = [
    "The secret ingredient is always love...",
    "In the kitchen, we create memories that last a lifetime...",
    "Food is the ingredient that binds us together...",
    "Cooking is like love - it should be entered into with abandon or not at all...",
    "Life is uncertain. Eat dessert first...",
    "Good food is good mood...",
    "Cooking with love provides food for the soul...",
    "A recipe has no soul. You, as the cook, must bring soul to the recipe...",
    "People who love to eat are always the best people...",
    "Cooking is an art, but all art requires knowing something about the techniques and materials..."
];

// Global recipes array
let recipes = [];

// Initialize app
async function initializeApp() {
    try {
        recipes = await dbOperations.getAllRecipes();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load recipes. Please refresh the page.');
    }
}

// Get random quote
function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Navigation Functions
function startApp() {
    const getStartedSection = document.getElementById('get-started');
    const loadingSection = document.getElementById('loading');
    
    // Hide get started section with fade out
    getStartedSection.style.opacity = '0';
    setTimeout(() => {
        getStartedSection.classList.remove('active');
        
        // Show loading section
        loadingSection.classList.add('active');
        loadingSection.style.opacity = '1';
        
        // Start quote rotation with random quotes
        const loadingText = document.querySelector('.loading-text');
        loadingText.textContent = getRandomQuote();
        
        const quoteRotation = setInterval(() => {
            loadingText.style.opacity = '0';
            setTimeout(() => {
                loadingText.textContent = getRandomQuote();
                loadingText.style.opacity = '1';
            }, 500);
        }, 2000);
        
        // After loading duration, transition to dashboard
        setTimeout(() => {
            clearInterval(quoteRotation);
            loadingSection.style.opacity = '0';
            
            setTimeout(() => {
                loadingSection.classList.remove('active');
                document.getElementById('dashboard').classList.add('active');
                initializeApp();
            }, 500);
        }, 6000);
    }, 500);
}

// Enhanced Search Function with Location
let searchTimeout;
function searchRecipes() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const searchTerm = document.getElementById('search-input').value;
        const locationTerm = document.getElementById('location-input').value;
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        try {
            const results = await dbOperations.searchRecipes(searchTerm, activeFilter, locationTerm);
            displayRecipes(results);
        } catch (error) {
            console.error('Error searching recipes:', error);
            showError('Failed to search recipes. Please try again.');
        }
    }, 300);
}

// Enhanced Recipe Display
function displayRecipes(recipesToShow = recipes) {
    const container = document.getElementById('recipes-container');
    container.innerHTML = '';
    
    recipesToShow.forEach(recipe => {
        const card = document.createElement('div');
        card.className = `recipe-card ${recipe.isVeg ? 'veg' : 'non-veg'}`;
        card.onclick = () => showRecipeModal(recipe);
        
        card.innerHTML = `
            <div class="recipe-type-badge ${recipe.isVeg ? 'veg' : 'non-veg'}">
                ${recipe.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
            </div>
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3>${recipe.title}</h3>
                <div class="recipe-info">
                    <span>⭐ ${recipe.rating.toFixed(1)}</span>
                    <span>⏰ ${recipe.totalTime || 'Time not specified'}</span>
                </div>
                <div class="recipe-details">
                    <div class="recipe-timing">
                        <span>🔪 Prep: ${recipe.prepTime || 'Not specified'}</span>
                        <span>👨‍🍳 Cook: ${recipe.cookTime || 'Not specified'}</span>
                    </div>
                    <div class="recipe-location">📍 ${recipe.location || 'Location not specified'}</div>
                </div>
                <div class="review-count">${recipe.reviews?.length || 0} reviews</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Filter Function
async function filterRecipes(type) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const searchTerm = document.getElementById('search-input').value;
    try {
        const results = await dbOperations.searchRecipes(searchTerm, type);
        displayRecipes(results);
    } catch (error) {
        console.error('Error filtering recipes:', error);
        showError('Failed to filter recipes. Please try again.');
    }
}

// Modal Functions
function showUploadModal() {
    document.getElementById('upload-modal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
}

// Enhanced Recipe Modal
function showRecipeModal(recipe) {
    const modal = document.getElementById('recipe-modal');
    const details = document.getElementById('recipe-details');
    
    const ingredientsList = recipe.ingredients ? recipe.ingredients.map(ing => 
        `<li class="ingredient-item">• ${ing}</li>`
    ).join('') : '<li class="ingredient-item">No ingredients listed</li>';
    
    const instructionsList = recipe.instructions ? recipe.instructions.map((step, index) => 
        `<li class="instruction-item">${index + 1}. ${step}</li>`
    ).join('') : '<li class="instruction-item">No instructions available</li>';
    
    const reviewsHtml = recipe.reviews?.map(review => `
        <div class="review">
            <div class="review-header">
                <span class="review-user">${review.user}</span>
                <span class="review-rating">⭐ ${review.rating}</span>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('') || '<p>No reviews yet</p>';
    
    details.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" class="modal-image">
        <h2>${recipe.title}</h2>
        
        <div class="recipe-meta">
            <div class="recipe-timing-details">
                <h3>⏰ Timing</h3>
                <p>🔪 Prep Time: ${recipe.prepTime || 'Not specified'}</p>
                <p>👨‍🍳 Cook Time: ${recipe.cookTime || 'Not specified'}</p>
                <p>⌛ Total Time: ${recipe.totalTime || 'Not specified'}</p>
            </div>
            <div class="recipe-basic-info">
                <p>📍 ${recipe.location || 'Location not specified'}</p>
                <p class="${recipe.isVeg ? 'veg-text' : 'non-veg-text'}">
                    ${recipe.isVeg ? '🥬 Vegetarian' : '🍖 Non-Vegetarian'}
                </p>
                <p>⭐ ${recipe.rating.toFixed(1)} Rating</p>
            </div>
        </div>

        <div class="recipe-ingredients">
            <h3>📝 Ingredients</h3>
            <ul class="ingredients-list">
                ${ingredientsList}
            </ul>
        </div>

        <div class="recipe-instructions">
            <h3>👩‍🍳 Instructions</h3>
            <ol class="instructions-list">
                ${instructionsList}
            </ol>
        </div>

        <div class="reviews-section">
            <h3>Reviews</h3>
            ${reviewsHtml}
            <form onsubmit="handleReviewSubmit(event, ${recipe.id})" class="review-form">
                <input type="text" name="user" placeholder="Your Name" required>
                <textarea name="text" placeholder="Your Review" required></textarea>
                <div class="rating-input">
                    <label>Rating:</label>
                    <select name="rating" required>
                        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                        <option value="4">⭐⭐⭐⭐ (4)</option>
                        <option value="3">⭐⭐⭐ (3)</option>
                        <option value="2">⭐⭐ (2)</option>
                        <option value="1">⭐ (1)</option>
                    </select>
                </div>
                <button type="submit" class="primary-btn">Submit Review</button>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeRecipeModal() {
    document.getElementById('recipe-modal').style.display = 'none';
}

// Enhanced Upload Function
async function handleUpload(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const newRecipe = {
        title: formData.get('title'),
        image: formData.get('image'),
        rating: 0,
        prepTime: formData.get('prepTime'),
        cookTime: formData.get('cookTime'),
        totalTime: formData.get('totalTime'),
        isVeg: formData.get('isVeg') === 'true',
        location: formData.get('location'),
        ingredients: [],
        instructions: []
    };
    
    try {
        await dbOperations.addRecipe(newRecipe);
        recipes = await dbOperations.getAllRecipes();
        displayRecipes();
        closeUploadModal();
        form.reset();
        showSuccess('Recipe uploaded successfully!');
    } catch (error) {
        console.error('Error uploading recipe:', error);
        showError('Failed to upload recipe. Please try again.');
    }
}

// Handle Review Submission
async function handleReviewSubmit(event, recipeId) {
    event.preventDefault();
    const form = event.target;
    const review = {
        user: form.user.value,
        text: form.text.value,
        rating: Number(form.rating.value)
    };
    
    try {
        await dbOperations.addReview(recipeId, review);
        recipes = await dbOperations.getAllRecipes();
        showRecipeModal(recipes.find(r => r.id === recipeId));
        showSuccess('Review added successfully!');
        form.reset();
    } catch (error) {
        console.error('Error adding review:', error);
        showError('Failed to add review. Please try again.');
    }
}

// Utility Functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}
