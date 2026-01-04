// Food selection page script
let stations = [];
let bookingData = null;
let selectedFoodItems = [];
let foodMenu = null;

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData();
    stations = data.stations;
    foodMenu = data.foodMenu;
    
    bookingData = getBookingData();
    
    if (!bookingData || !bookingData.passengers || bookingData.passengers.length === 0) {
        alert('No passenger data found. Redirecting to home page.');
        navigateTo('index.html');
        return;
    }
    
    // Load previously selected food items if any
    if (bookingData.foodItems) {
        selectedFoodItems = bookingData.foodItems;
    }
    
    displayBookingSummary();
    displayFoodCategories();
    updateSelectedFoodDisplay();
    setupEventListeners();
});

// Display booking summary
function displayBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    const journey = bookingData.journey;
    const train = bookingData.train;
    const fromName = getStationName(journey.from);
    const toName = getStationName(journey.to);
    
    summary.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> Booking Summary</h3>
        <div class="summary-item">
            <span>Route:</span>
            <span>${fromName} → ${toName}</span>
        </div>
        <div class="summary-item">
            <span>Train:</span>
            <span>${train.trainName} (${train.trainNumber})</span>
        </div>
        <div class="summary-item">
            <span>Class:</span>
            <span>${train.selectedClass.name}</span>
        </div>
        <div class="summary-item">
            <span>Date:</span>
            <span>${formatDate(journey.date)}</span>
        </div>
        <div class="summary-item">
            <span>Passengers:</span>
            <span>${bookingData.passengers.length}</span>
        </div>
    `;
}

// Display food categories
function displayFoodCategories() {
    if (!foodMenu || !foodMenu.categories) {
        document.getElementById('foodCategories').innerHTML = '<p>Food menu not available.</p>';
        return;
    }
    
    const categoriesContainer = document.getElementById('foodCategories');
    categoriesContainer.innerHTML = '';
    
    foodMenu.categories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'food-category';
        
        categorySection.innerHTML = `
            <div class="category-header">
                <i class="${category.icon}"></i>
                <h3>${category.name}</h3>
            </div>
            <div class="food-items-grid" id="category-${category.name}"></div>
        `;
        
        categoriesContainer.appendChild(categorySection);
        
        // Add food items
        const itemsGrid = categorySection.querySelector(`#category-${category.name}`);
        category.items.forEach(item => {
            const foodItem = createFoodItem(item, category.name);
            itemsGrid.appendChild(foodItem);
        });
    });
}

// Create food item card
function createFoodItem(item, categoryName) {
    const foodCard = document.createElement('div');
    foodCard.className = 'food-item-card';
    foodCard.dataset.itemId = item.id;
    
    const isSelected = selectedFoodItems.some(f => f.id === item.id);
    
    foodCard.innerHTML = `
        <div class="food-item-image">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'150\'%3E%3Crect fill=\'%23e2e8f0\' width=\'200\' height=\'150\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%2394a3b8\'%3ENo Image%3C/text%3E%3C/svg%3E'">
            <div class="dietary-badge ${item.dietary}">${item.dietary === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}</div>
        </div>
        <div class="food-item-content">
            <h4 class="food-item-name">${item.name}</h4>
            <p class="food-item-description">${item.description}</p>
            <div class="food-item-footer">
                <span class="food-item-price">₹${item.price}</span>
                <div class="food-item-controls">
                    <button type="button" class="quantity-btn minus" onclick="decreaseQuantity('${item.id}')" ${isSelected && selectedFoodItems.find(f => f.id === item.id) && selectedFoodItems.find(f => f.id === item.id).quantity > 0 ? '' : 'style="display:none"'}">-</button>
                    <span class="quantity-display" id="qty-${item.id}" ${isSelected && selectedFoodItems.find(f => f.id === item.id) && selectedFoodItems.find(f => f.id === item.id).quantity > 0 ? '' : 'style="display:none"'}>${isSelected && selectedFoodItems.find(f => f.id === item.id) ? selectedFoodItems.find(f => f.id === item.id).quantity : 0}</span>
                    <button type="button" class="quantity-btn plus" onclick="increaseQuantity('${item.id}', ${item.price}, '${item.name.replace(/'/g, "\\'")}', '${item.image}', '${item.dietary}')">+</button>
                </div>
            </div>
        </div>
    `;
    
    if (isSelected) {
        foodCard.classList.add('selected');
    }
    
    return foodCard;
}

// Global functions for inline onclick handlers
window.increaseQuantity = function(itemId, price, name, image, dietary) {
    const existingItem = selectedFoodItems.find(f => f.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        selectedFoodItems.push({
            id: itemId,
            name: name,
            price: price,
            image: image,
            dietary: dietary,
            quantity: 1
        });
    }
    
    updateFoodItemDisplay(itemId);
    updateSelectedFoodDisplay();
}

window.decreaseQuantity = function(itemId) {
    const existingItem = selectedFoodItems.find(f => f.id === itemId);
    
    if (existingItem && existingItem.quantity > 0) {
        existingItem.quantity -= 1;
        
        if (existingItem.quantity === 0) {
            selectedFoodItems = selectedFoodItems.filter(f => f.id !== itemId);
        }
    }
    
    updateFoodItemDisplay(itemId);
    updateSelectedFoodDisplay();
}

// Update food item display
function updateFoodItemDisplay(itemId) {
    const foodCard = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!foodCard) return;
    
    const item = selectedFoodItems.find(f => f.id === itemId);
    const isSelected = item && item.quantity > 0;
    
    const quantityDisplay = foodCard.querySelector(`#qty-${itemId}`);
    const minusBtn = foodCard.querySelector('.minus');
    const plusBtn = foodCard.querySelector('.plus');
    
    if (isSelected) {
        foodCard.classList.add('selected');
        quantityDisplay.textContent = item.quantity;
        quantityDisplay.style.display = 'inline-block';
        minusBtn.style.display = 'inline-block';
    } else {
        foodCard.classList.remove('selected');
        quantityDisplay.style.display = 'none';
        minusBtn.style.display = 'none';
    }
}

// Update selected food display
function updateSelectedFoodDisplay() {
    const selectedFoodSection = document.getElementById('selectedFood');
    const selectedFoodList = document.getElementById('selectedFoodList');
    const foodTotal = document.getElementById('foodTotal');
    
    const itemsWithQuantity = selectedFoodItems.filter(item => item.quantity > 0);
    
    if (itemsWithQuantity.length === 0) {
        selectedFoodSection.classList.add('hidden');
        foodTotal.textContent = '0';
        return;
    }
    
    selectedFoodSection.classList.remove('hidden');
    
    let total = 0;
    selectedFoodList.innerHTML = '';
    
    itemsWithQuantity.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const listItem = document.createElement('div');
        listItem.className = 'selected-food-item';
        listItem.innerHTML = `
            <div class="selected-food-info">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\'%3E%3Crect fill=\'%23e2e8f0\' width=\'50\' height=\'50\'/%3E%3C/svg%3E'">
                <div>
                    <span class="selected-food-name">${item.name}</span>
                    <span class="selected-food-price">₹${item.price} × ${item.quantity}</span>
                </div>
            </div>
            <div class="selected-food-total">₹${itemTotal}</div>
        `;
        selectedFoodList.appendChild(listItem);
    });
    
    foodTotal.textContent = total;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('skipFood').addEventListener('click', () => {
        bookingData.foodItems = [];
        saveBookingData(bookingData);
        navigateTo('payment.html');
    });
    
    document.getElementById('proceedToPayment').addEventListener('click', () => {
        bookingData.foodItems = selectedFoodItems.filter(item => item.quantity > 0);
        saveBookingData(bookingData);
        navigateTo('payment.html');
    });
}

