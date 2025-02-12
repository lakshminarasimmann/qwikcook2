// Database configuration
const DB_NAME = 'QwikCookDB';
const DB_VERSION = 4; // Increased version for new fields
const STORE_NAME = 'recipes';

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('location', 'location', { unique: false });
                store.createIndex('isVeg', 'isVeg', { unique: false });
                store.createIndex('rating', 'rating', { unique: false });
                store.createIndex('category', 'category', { unique: false }); // New index for category
                
                // Add sample data
                store.transaction.oncomplete = () => {
                    const recipeStore = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME);
                    initialRecipes.forEach(recipe => recipeStore.add(recipe));
                };
            } else {
                // Add new fields to existing store if upgrading
                const store = event.target.result.transaction.objectStore(STORE_NAME);
                if (!store.indexNames.contains('category')) {
                    store.createIndex('category', 'category', { unique: false });
                }
            }
        };
    });
}

// Sample initial data with ingredients and detailed timing
const initialRecipes = [
    {
        title: "Masala Dosa",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.8,
        prepTime: "20 mins",
        cookTime: "10 mins",
        totalTime: "30 mins",
        isVeg: true,
        location: "South India",
        category: "Main Course",
        youtubeUrl: "https://www.youtube.com/watch?v=CCab5oh0ZOc",
        ingredients: [
            "2 cups dosa batter (fermented rice and urad dal)",
            "3 medium potatoes, boiled and mashed",
            "1 large onion, finely chopped",
            "2 green chilies, finely chopped",
            "1 inch ginger, grated",
            "10-12 curry leaves",
            "1/2 tsp mustard seeds",
            "1/2 tsp cumin seeds",
            "1/4 tsp turmeric powder",
            "1/2 tsp red chili powder",
            "Salt to taste",
            "Oil for cooking",
            "Butter for serving",
            "Coconut chutney for serving",
            "Sambar for serving"
        ],
        instructions: [
            "Heat oil in a pan. Add mustard seeds and let them splutter.",
            "Add cumin seeds, curry leaves, and green chilies. Sauté for 30 seconds.",
            "Add chopped onions and ginger. Sauté until onions turn golden brown.",
            "Add turmeric powder, red chili powder, and salt. Mix well.",
            "Add mashed potatoes and mix thoroughly. Cook for 2-3 minutes. Keep aside.",
            "Heat a dosa tawa or flat griddle. Once hot, reduce heat to medium.",
            "Pour a ladleful of dosa batter and spread in a circular motion.",
            "Drizzle oil around the edges and on top of the dosa.",
            "When the bottom turns golden brown, add the potato filling in the center.",
            "Fold the dosa over the filling to form a semi-circle.",
            "Serve hot with coconut chutney and sambar.",
            "Optional: Add a small piece of butter on top before serving."
        ],
        reviews: [
            { user: "Chef Ravi", text: "Authentic and crispy! Perfect balance of spices in the potato filling.", rating: 5 },
            { user: "Maya", text: "Perfect breakfast recipe. The detailed instructions helped me make it perfectly.", rating: 4.5 }
        ]
    },
    {
        title: "Butter Chicken",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.9,
        prepTime: "30 mins",
        cookTime: "45 mins",
        totalTime: "1 hour 15 mins",
        isVeg: false,
        location: "North India",
        category: "Main Course",
        youtubeUrl: "https://www.youtube.com/watch?v=a03U45jFxOI",
        ingredients: [
            "500g chicken, cut into pieces",
            "2 cups tomato puree",
            "1/2 cup cream",
            "2 tbsp butter",
            "2 tbsp oil",
            "2 tbsp ginger-garlic paste",
            "1 large onion, finely chopped",
            "2 tsp red chili powder",
            "1 tsp garam masala",
            "1 tsp cumin powder",
            "1 tsp coriander powder",
            "2 tbsp kasuri methi (dried fenugreek leaves)",
            "Salt to taste",
            "Fresh cream for garnishing",
            "Coriander leaves for garnishing"
        ],
        instructions: [
            "Marinate chicken with ginger-garlic paste, red chili powder, and salt for 30 minutes.",
            "Heat oil in a pan. Add chopped onions and sauté until golden brown.",
            "Add marinated chicken and cook until it turns white.",
            "Add tomato puree and cook until oil separates.",
            "Add all the spices and cook for 5 minutes.",
            "Add cream and butter. Simmer for 10 minutes.",
            "Crush kasuri methi and add to the gravy.",
            "Garnish with cream and coriander leaves.",
            "Serve hot with naan or rice."
        ],
        reviews: [
            { user: "Chef Sanjeev", text: "Rich and creamy texture! Restaurant quality recipe.", rating: 5 },
            { user: "Rahul", text: "Perfect balance of spices. My family loved it!", rating: 5 }
        ]
    }
];

// Database operations
const dbOperations = {
    // Get all recipes
    getAllRecipes: async () => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Add new recipe
    addRecipe: async (recipe) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            recipe.reviews = [];
            recipe.rating = 0;
            const request = store.add(recipe);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Add review to recipe
    addReview: async (recipeId, review) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(recipeId);

            request.onsuccess = () => {
                const recipe = request.result;
                if (!recipe.reviews) recipe.reviews = [];
                recipe.reviews.push(review);
                
                // Update average rating
                const totalRating = recipe.reviews.reduce((sum, r) => sum + r.rating, 0);
                recipe.rating = totalRating / recipe.reviews.length;

                const updateRequest = store.put(recipe);
                updateRequest.onsuccess = () => resolve(recipe);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            request.onerror = () => reject(request.error);
        });
    },

    // Search recipes with enhanced filtering
    searchRecipes: async (query, filter = 'all', location = '', category = 'all') => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result.filter(recipe => {
                    const matchesQuery = recipe.title.toLowerCase().includes(query.toLowerCase());
                    const matchesFilter = filter === 'all' ? true :
                                        filter === 'veg' ? recipe.isVeg :
                                        !recipe.isVeg;
                    const matchesLocation = !location || 
                                         recipe.location.toLowerCase().includes(location.toLowerCase());
                    const matchesCategory = category === 'all' ? true :
                                          recipe.category === category;
                    
                    return matchesQuery && matchesFilter && matchesLocation && matchesCategory;
                });
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }
};
