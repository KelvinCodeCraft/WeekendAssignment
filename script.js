const API_URL = "http://localhost:3000"

// Session Management
function saveUserSession(user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
}

function loadUserSession() {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
        currentUser = JSON.parse(savedUser)
        updateUI()
        loadProducts()
    }
}

function clearUserSession() {
    localStorage.removeItem("currentUser")
    currentUser = null
}

let currentUser = null

// DOM Elements
const cartModal = document.getElementById("cartModal")
const adminSection = document.getElementById("adminSection")
const productsSection = document.getElementById("productsSection")
const adminControls = document.getElementById("adminControls")
const messageContainer = document.getElementById("messageContainer")


document.getElementById("cartBtn").addEventListener("click", () => {
    cartModal.style.display = "block"
    updateCart()
})

document.getElementById("logoutBtn").addEventListener("click", logout)

document.getElementById("adminPanelBtn").addEventListener("click", toggleAdminPanel)

// Form submissions
document.getElementById("productForm").addEventListener("submit", handleProductSubmit)
document.getElementById("checkoutBtn").addEventListener("click", handleCheckout)

// Close modals
document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
        closeBtn.closest(".modal").style.display = "none"
    })
})

window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.style.display = "none"
    }
})

// Message Display Function
function showMessage(message, type = "info") {
    const messageElement = document.createElement("div")
    messageElement.classList.add("message", `message-${type}`)
    messageElement.textContent = message
    messageContainer.appendChild(messageElement)

    setTimeout(() => {
        messageElement.style.opacity = "1"
    }, 10)

    setTimeout(() => {
        messageElement.style.opacity = "0"
        setTimeout(() => {
            messageContainer.removeChild(messageElement)
        }, 300)
    }, 3000)
}

// Authentication Functions
function logout() {
    clearUserSession()
    updateUI()
    showMessage("You have been logged out successfully.", "info")
    window.location.href = "index.html"
}

// Product Functions
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`)
        const products = await response.json()

        
        document.getElementById("productsContainer").innerHTML = products
            .map(
                (product) => `
          <div class="product-card">
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <div class="product-info">
              <h3 class="product-title">${product.name}</h3>
              <div class="product-price">$${product.price.toFixed(2)}</div>
              <p class="product-description">${product.description}</p>
              <button class="nav-btn" onclick="handleAddToCart('${product.id}')">Add to Cart</button>
            </div>
          </div>
        `
            )
            .join("")

        
        if (currentUser?.role === "admin") {
            document.querySelector("#adminProductsTable tbody").innerHTML = products
                .map(
                    (product) => `
            <tr>
              <td><img src="${product.image_url}" alt="${product.name}"></td>
              <td>${product.name}</td>
              <td>$${product.price.toFixed(2)}</td>
              <td>
                <button onclick="handleEditProduct('${product.id}')" class="nav-btn" [data-cy="contact-edit"]>Edit</button>
                <button onclick="handleDeleteProduct('${product.id}')" class="nav-btn">Delete</button>
              </td>
            </tr>
          `
                )
                .join("")
        }
    } catch (error) {
        console.error("Error loading products:", error)
        showMessage("Failed to load products. Please try again later.", "error")
    }
}

async function handleProductSubmit(e) {
    e.preventDefault()
    if (currentUser?.role !== "admin") return

    const productData = {
        name: document.getElementById("productName").value,
        price: Number.parseFloat(document.getElementById("productPrice").value),
        image_url: document.getElementById("productImage").value,
        description: document.getElementById("productDescription").value,
    }

    const productId = document.getElementById("productId").value
    const method = productId ? "PUT" : "POST"
    const url = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        })

        if (response.ok) {
            document.getElementById("productForm").reset()
            document.getElementById("productId").value = ""
            document.getElementById("submitProduct").textContent = "Add Product"
            document.getElementById("cancelEdit").style.display = "none"
            loadProducts()
            showMessage(productId ? "Product updated successfully!" : "Product added successfully!", "success")
        }
    } catch (error) {
        console.error("Error saving product:", error)
        showMessage("Failed to save product. Please try again.", "error")
    }
}

window.handleEditProduct = async (id) => {
    if (currentUser?.role !== "admin") return

    try {
        const response = await fetch(`${API_URL}/products/${id}`)
        const product = await response.json()

        document.getElementById("productId").value = product.id
        document.getElementById("productName").value = product.name
        document.getElementById("productPrice").value = product.price
        document.getElementById("productImage").value = product.image_url
        document.getElementById("productDescription").value = product.description
        document.getElementById("submitProduct").textContent = "Update Product"
        document.getElementById("cancelEdit").style.display = "inline-block"

        // Scroll to the product form
        document.getElementById("productForm").scrollIntoView({ behavior: "smooth" })
    } catch (error) {
        console.error("Error fetching product:", error)
        showMessage("Failed to load product details. Please try again.", "error")
    }
}

window.handleDeleteProduct = async (id) => {
    if (currentUser?.role !== "admin" || !confirm("Are you sure you want to delete this product?")) return

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
        })

        if (response.ok) {
            loadProducts()
            showMessage("Product deleted successfully!", "success")
        }
    } catch (error) {
        console.error("Error deleting product:", error)
        showMessage("Failed to delete product. Please try again.", "error")
    }
}

// Cart Functions
window.handleAddToCart = async (productId) => {
    if (!currentUser) {
        window.location.href = "login.html"
        return
    }

    try {
        const productResponse = await fetch(`${API_URL}/products/${productId}`)
        const product = await productResponse.json()

        // Check if item already exists in cart
        const cartResponse = await fetch(`${API_URL}/cart`)
        const cartItems = await cartResponse.json()
        const existingItem = cartItems.find((item) => item.userId === currentUser.id && item.productId === productId)

        if (existingItem) {
            // Update quantity
            await fetch(`${API_URL}/cart/${existingItem.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quantity: existingItem.quantity + 1,
                }),
            })
        } else {
            // Add new item
            await fetch(`${API_URL}/cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    productId,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    quantity: 1,
                }),
            })
        }

        updateCart()
        showMessage(`${product.name} added to cart!`, "success")
    } catch (error) {
        console.error("Error adding to cart:", error)
        showMessage("Failed to add item to cart. Please try again.", "error")
    }
}

window.handleRemoveFromCart = async (cartItemId) => {
    try {
        await fetch(`${API_URL}/cart/${cartItemId}`, {
            method: "DELETE",
        })

        updateCart()
        showMessage("Item removed from cart.", "info")
    } catch (error) {
        console.error("Error removing from cart:", error)
        showMessage("Failed to remove item from cart. Please try again.", "error")
    }
}

async function updateCart() {
    if (!currentUser) return

    try {
        const response = await fetch(`${API_URL}/cart`)
        const cartItems = await response.json()
        const userItems = cartItems.filter((item) => item.userId === currentUser.id)

        const cartItemsContainer = document.getElementById("cartItems")
        cartItemsContainer.innerHTML = userItems
            .map(
                (item) => `
          <div class="cart-item">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-details">
              <h3>${item.name}</h3>
              <p>$${item.price.toFixed(2)}</p>
              <div class="quantity-controls">
                <button class="quantity-btn" onclick="handleUpdateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="handleUpdateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              </div>
            </div>
            <button onclick="handleRemoveFromCart('${item.id}')" class="nav-btn remove-btn">Remove</button>
          </div>
        `
            )
            .join("")

        const total = userItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        document.getElementById("cartTotal").textContent = `Total: $${total.toFixed(2)}`
        document.getElementById("cartCount").textContent = `Cart (${userItems.reduce((sum, item) => sum + item.quantity, 0)})`

        // Persist cart state
        localStorage.setItem("cartOpen", cartModal.style.display === "block" ? "true" : "false")
    } catch (error) {
        console.error("Error updating cart:", error)
        showMessage("Failed to update cart. Please try again.", "error")
    }
}

window.handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
        handleRemoveFromCart(cartItemId)
        return
    }

    try {
        await fetch(`${API_URL}/cart/${cartItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newQuantity }),
        })
        updateCart()
        showMessage("Cart updated successfully!", "success")
    } catch (error) {
        console.error("Error updating quantity:", error)
        showMessage("Failed to update cart. Please try again.", "error")
    }
}

async function handleCheckout() {
    if (!currentUser) return

    try {
        const response = await fetch(`${API_URL}/cart`)
        const cartItems = await response.json()
        const userItems = cartItems.filter((item) => item.userId === currentUser.id)

        // Delete all user's cart items
        for (const item of userItems) {
            await fetch(`${API_URL}/cart/${item.id}`, {
                method: "DELETE",
            })
        }

        showMessage("Checkout successful! Thank you for your purchase.", "success")
        cartModal.style.display = "none"
        updateCart()
    } catch (error) {
        console.error("Error during checkout:", error)
        showMessage("Checkout failed. Please try again.", "error")
    }
}

// UI Functions
function updateUI() {
    const loggedIn = !!currentUser
    const isAdmin = currentUser?.role === "admin"

    document.getElementById("loginBtn").style.display = loggedIn ? "none" : "inline-block"
    document.getElementById("registerBtn").style.display = loggedIn ? "none" : "inline-block"
    document.getElementById("logoutBtn").style.display = loggedIn ? "inline-block" : "none"
    document.getElementById("cartBtn").style.display = loggedIn && !isAdmin ? "inline-block" : "none"
    document.getElementById("userInfo").style.display = loggedIn ? "inline-block" : "none"
    document.getElementById("adminControls").style.display = isAdmin ? "inline-block" : "none"

    adminSection.style.display = isAdmin ? "block" : "none"
    productsSection.style.display = isAdmin ? "none" : "block"

    if (loggedIn) {
        document.getElementById("userEmail").textContent = currentUser.email
        updateCart()
    }

    // Restore cart state
    const cartOpen = localStorage.getItem("cartOpen")
    if (cartOpen === "true") {
        cartModal.style.display = "block"
    }
}

function toggleAdminPanel() {
    if (currentUser?.role !== "admin") {
        adminSection.style.display = "none"
        productsSection.style.display = "block"
        return
    }

    const showAdmin = adminSection.style.display === "none"
    adminSection.style.display = showAdmin ? "block" : "none"
    productsSection.style.display = showAdmin ? "none" : "block"
}

// Initialize
loadUserSession()
loadProducts()
updateUI()