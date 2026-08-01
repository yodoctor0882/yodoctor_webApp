describe('Doctor Login API', () => {

  it('should login successfully', () => {

    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/auth/login', // ✅ correct
      body: {
        identifier: 'mahto@gmail.com',
        password: 'Mahto@123'
      }
    }).then((res) => {

      expect(res.status).to.eq(200);
      expect(res.body.data.token).to.exist;
      expect(res.body.redirect).to.eq('dashboard');

    });

  });

});