describe('Doctor Login UI', () => {

  it('should login via UI', () => {

    cy.visit('http://localhost:3000/doctorloginpage');

    cy.get('input[name="identifier"]').type('mahto@gmail.com');
    cy.get('input[name="password"]').type('Mahto@123');

    cy.intercept('POST', '**/auth/login').as('loginApi');

    cy.contains('Login').click();

    // ✅ wait for API
    cy.wait('@loginApi');

    // ✅ wait for UI change
    cy.contains('Dr. Mahto', { timeout: 10000 }).should('be.visible');

    // ✅ final assertion
    cy.url().should('include', '/doctordashboard');

  });

});