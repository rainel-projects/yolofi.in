// Add this JavaScript to the search page to enable food search

// Update performSearch function
const originalPerformSearch = window.performSearch;
window.performSearch = async function () {
    const query = searchInput.value.trim();
    if (!query) return;

    currentQuery = query;
    const provider = providers[activeProvider];

    providerName.textContent = provider.name;
    footerProvider.textContent = provider.name;
    queryDisplay.textContent = `"${query}"`;
    window.history.pushState({}, '', `?q=${encodeURIComponent(query)}`);
    resultsContainer.classList.add('active');

    if (provider.type === 'native') {
        resultsFrame.style.display = 'none';
        nativeResults.classList.add('active');
        foodSearch.classList.remove('active');
        await performNativeSearch(query);
    } else if (provider.type === 'food') {
        resultsFrame.style.display = 'none';
        nativeResults.classList.remove('active');
        foodSearch.classList.add('active');
        await performFoodSearch(query);
    } else {
        nativeResults.classList.remove('active');
        foodSearch.classList.remove('active');
        resultsFrame.style.display = 'block';
        resultsFrame.src = provider.url.replace('{}', encodeURIComponent(query));
    }
};

// Add performFoodSearch function
window.performFoodSearch = async function (query) {
    foodImageWrapper.innerHTML = '<div class="loading-image"></div>';
    foodNameDisplay.textContent = 'Generating...';
    foodIngredients.innerHTML = '';
    foodInstructions.innerHTML = '';

    setTimeout(async () => {
        foodImageWrapper.innerHTML = `<img src="https://source.unsplash.com/600x400/?${encodeURIComponent(query)},food,dish" alt="${query}">`;
        foodNameDisplay.textContent = query.charAt(0).toUpperCase() + query.slice(1);

        try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (data.meals && data.meals.length > 0) {
                const meal = data.meals[0];
                const ings = [];
                for (let i = 1; i <= 20; i++) {
                    const ing = meal[`strIngredient${i}`];
                    const meas = meal[`strMeasure${i}`];
                    if (ing && ing.trim()) ings.push(`${meas} ${ing}`);
                }
                foodIngredients.innerHTML = ings.map(i => `<li class="food-ingredient">${i}</li>`).join('');
                const steps = meal.strInstructions.split(/\r?\n/).filter(s => s.trim().length > 10);
                foodInstructions.innerHTML = steps.map(s => `<li class="food-instruction">${s}</li>`).join('');
            } else {
                foodIngredients.innerHTML = '<li class="food-ingredient">Recipe not found. Try: pizza, pasta, sushi, burger, curry</li>';
                foodInstructions.innerHTML = '<li class="food-instruction">Search for a specific dish name</li>';
            }
        } catch (e) {
            foodIngredients.innerHTML = '<li class="food-ingredient">Unable to fetch recipe</li>';
        }
    }, 1000);
};
