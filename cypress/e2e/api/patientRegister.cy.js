describe('Patient Registration API', () => {

  it('should register patient successfully', () => {

    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/patient/register',
      body: {
        fullName: 'Akay',
        email: 'akay@gmail.com',
        phone: '7654893027',
        password: 'Akay@123',
        confirmPassword: 'Akay@123',
        gender: 'MALE',
        dob: '2000-01-01'
      }
    }).then((res) => {

      expect(res.status).to.eq(201); // ya 200
      expect(res.body).to.exist;

    });

  });

});