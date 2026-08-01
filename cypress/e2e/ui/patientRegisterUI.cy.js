describe('Patient Registration UI', () => {

  it('should fill and submit form', () => {

    cy.visit('/clientregisterpage');

    cy.get('input[name="fullName"]').type('Akay');
    cy.get('input[name="email"]').type('akay@gmail.com');
    cy.get('input[name="phone"]').type('7654893027');

    cy.get('select[name="gender"]').select('Male');

    cy.get('input[name="dob"]').type('2000-01-01');

    cy.get('input[name="password"]').type('Akay@123');
    cy.get('input[name="confirmPassword"]').type('Akay@123');

    cy.contains('Register').click();

    // redirect check
    cy.url().should('include', '/clientloginpage');

  });

});