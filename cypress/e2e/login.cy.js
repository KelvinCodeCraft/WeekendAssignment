describe('Login Tests', () => {
  const API_URL = "http://localhost:3000";

  beforeEach(() => {
    cy.visit('http://127.0.0.1:5502/login.html');
  });

  it('should login successfully with valid credentials', () => {
    cy.intercept('GET', `${API_URL}/users`, {
      statusCode: 200,
      body: [
        { email: 'koechkelvin2001@gmail.com', password: '12345678' }
      ]
    });

    cy.get('#loginEmail').type('koechkelvin2001@gmail.com');
    cy.get('#loginPassword').type('12345678');
    cy.get('form#loginForm').submit();

    // cy.url().should('include', 'index.html');
    // cy.get('#messageContainer').should('contain', 'Login successful!');
  });

  it('should show error message with invalid credentials', () => {
    cy.intercept('GET', `${API_URL}/users`, {
      statusCode: 200,
      body: [
        { email: 'koechkelvin2001@gmail.com', password: '123456784' }
      ]
    });

    cy.get('#loginEmail').type('invalid@example.com');
    cy.get('#loginPassword').type('wrongpassword');
    cy.get('form#loginForm').submit();

    cy.url().should('include', 'login.html');
    // cy.get('#messageContainer').should('contain', 'Invalid credentials. Please try again.');
  });

  it('should show error message on server error', () => {
    cy.intercept('GET', `${API_URL}/users`, {
      statusCode: 500,
      body: {}
    });

    cy.get('#loginEmail').type('koechkelvin2001@gmail.com');
    cy.get('#loginPassword').type('12345678');
    cy.get('form#loginForm').submit();

    cy.url().should('include', 'login.html');
    cy.get('#messageContainer').should('contain', 'Login failed. Please try again later.');
  });

  it('should redirect admin user to admin page', () => {
    cy.intercept('GET', `${API_URL}/users`, {
      statusCode: 200,
      body: [
        { email: 'admin@example.com', password: 'admin123', role: 'admin' }
      ]
    });

    cy.get('#loginEmail').type('admin@example.com');
    cy.get('#loginPassword').type('admin123');
    cy.get('form#loginForm').submit();

    
  });
  
});

describe('Admin Product Management Tests', () => {
  const API_URL = "http://localhost:3000";

  beforeEach(() => {
    cy.visit('http://127.0.0.1:5502/login.html');
    cy.intercept('GET', `${API_URL}/users`, {
      statusCode: 200,
      body: [
        { email: 'admin@example.com', password: 'admin123', role: 'admin' }
      ]
    });

    // Login as admin
    cy.get('#loginEmail').type('admin@example.com');
    cy.get('#loginPassword').type('admin123');
    cy.get('form#loginForm').submit();

    cy.url().should('include', 'admin.html');
    cy.get('#messageContainer').should('contain', 'Login successful!');
  });

  it('should create a new product', () => {
    cy.intercept('POST', `${API_URL}/products`, {
      statusCode: 201,
      body: { id: '3', name: 'New Product', price: 30.00, image: 'newproduct.jpg', description: 'New product description' }
    });

    cy.get('#productName').type('New Product');
    cy.get('#productPrice').type('30.00');
    cy.get('#productImage').type('newproduct.jpg');
    cy.get('#productDescription').type('New product description');
    cy.get('#submitProduct').click();

    cy.get('#adminProductsTable').should('contain', 'New Product');
  });

  it('should update an existing product', () => {
    cy.intercept('PUT', `${API_URL}/products/1`, {
      statusCode: 200,
      body: { id: '1', name: 'Updated Product', price: 15.00, image: 'updatedproduct.jpg', description: 'Updated product description' }
    });

    cy.get('#adminProductsTable').within(() => {
      cy.get('tr').first().find('[data-cy="contact-edit"]').should('be.visible').click();
    });

    cy.get('#productName').clear().type('Updated Product');
    cy.get('#productPrice').clear().type('15.00');
    cy.get('#productImage').clear().type('updatedproduct.jpg');
    cy.get('#productDescription').clear().type('Updated product description');
    cy.get('#submitProduct').click();

    cy.get('#adminProductsTable').should('contain', 'Updated Product');
  });

  it('should delete a product', () => {
    cy.intercept('DELETE', `${API_URL}/products/1`, {
      statusCode: 200
    });

    cy.get('#adminProductsTable').within(() => {
      cy.get('tr').first().find('[data-cy="contact-delete"]').should('be.visible').click();
    });

    cy.get('#adminProductsTable').should('not.contain', 'Product 1');
  });
});

describe('Cart Tests', () => {
  const API_URL = "http://localhost:3000";

  beforeEach(() => {
    cy.visit('http://127.0.0.1:5502/index.html');
  });

  it('should add items to the cart', () => {
    cy.intercept('GET', `${API_URL}/products`, {
      statusCode: 200,
      body: [
        { id: '1', name: 'Product 1', price: 10.00, image: 'product1.jpg' },
        { id: '2', name: 'Product 2', price: 20.00, image: 'product2.jpg' }
      ]
    });

    cy.get('#productsContainer').within(() => {
      // cy.get('.product').first().find('.add-to-cart-btn').click();
      cy.get('.product').last().find('.add-to-cart-btn').click();
    });

    cy.get('#cartBtn').click();
    cy.get('#cartItems').should('contain', 'Product 1');
    cy.get('#cartItems').should('contain', 'Product 2');
  });

  it('should delete items from the cart', () => {
    // Mock the API response for products
    cy.intercept('GET', `${API_URL}/products`, {
      statusCode: 200,
      body: [
        { id: '1', name: 'Product 1', price: 10.00, image: 'product1.jpg' },
        { id: '2', name: 'Product 2', price: 20.00, image: 'product2.jpg' }
      ]
    });

    cy.get('#productsContainer').within(() => {
      cy.get('.product').first().find('.add-to-cart-btn').click();
      cy.get('.product').last().find('.add-to-cart-btn').click();
    });

    cy.get('#cartBtn').click();
    cy.get('#cartItems').within(() => {
      cy.get('.cart-item').first().find('.remove-from-cart-btn').click();
    });

    cy.get('#cartItems').should('not.contain', 'Product 1');
    cy.get('#cartItems').should('contain', 'Product 2');
  });
});
