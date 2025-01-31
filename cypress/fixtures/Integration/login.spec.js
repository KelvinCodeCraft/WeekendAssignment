describe('Login Tests', () => {
    const API_URL = "http://localhost:3000";
  
    beforeEach(() => {
      cy.visit('src/html/login.html');
    });
  
    it('should login successfully with valid credentials', () => {
      // Mock the API response for valid credentials
      cy.intercept('GET', `${API_URL}/users`, {
        statusCode: 200,
        body: [
          { email: 'test@example.com', password: 'password123' }
        ]
      });
  
      cy.get('#loginEmail').type('test@example.com');
      cy.get('#loginPassword').type('password123');
      cy.get('form#loginForm').submit();
  
      cy.url().should('include', 'index.html');
      cy.get('#messageContainer').should('contain', 'Login successful!');
    });
  
    it('should show error message with invalid credentials', () => {
      // Mock the API response for invalid credentials
      cy.intercept('GET', `${API_URL}/users`, {
        statusCode: 200,
        body: [
          { email: 'test@example.com', password: 'password123' }
        ]
      });
  
      cy.get('#loginEmail').type('invalid@example.com');
      cy.get('#loginPassword').type('wrongpassword');
      cy.get('form#loginForm').submit();
  
      cy.url().should('include', 'login.html');
      cy.get('#messageContainer').should('contain', 'Invalid credentials. Please try again.');
    });
  
    it('should show error message on server error', () => {
      // Mock the API response for server error
      cy.intercept('GET', `${API_URL}/users`, {
        statusCode: 500,
        body: {}
      });
  
      cy.get('#loginEmail').type('test@example.com');
      cy.get('#loginPassword').type('password123');
      cy.get('form#loginForm').submit();
  
      cy.url().should('include', 'login.html');
      cy.get('#messageContainer').should('contain', 'Login failed. Please try again later.');
    });
  });