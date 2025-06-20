// describe('Complete User Journey', () => {
//   it('should allow user to register, login, and book an event', () => {
//     // Log in
//     cy.visit('/');
//     cy.visit('/login');
//     cy.get('[id=email]').type('martin.leroy@edu.ecole-89.com');
//     cy.get('[id=password]').type('ADMINADMIN');
//     cy.get('[type=submit]').click();

//     // Email verification simulation
//     cy.task('getLatestEmail').then((email) => {
//       const otpMatch = email.body.match(/(\d{6})/);
//       const otp = otpMatch[1];

//       cy.get('[id=otp-input]').type(otp);
//       cy.get('[id=verify-otp]').click();
//     });

//     // Event registration
//     cy.visit('/event');
//     cy.get('[id=event-card]').first().click();
//     cy.get('[id=register-button]').click();
//     cy.get('[id=event-registration-success]').should('be.visible');
//   });
// });

describe('Register', () => {
  it('should allow user to register, login, and book an event', () => {
    // Log in
    cy.visit('/');
    cy.visit('/register');
    cy.get('[id=email]').type('martin.leroy@edu.ecole-89.com');
    cy.get('[id=password]').type('ADMINADMIN');
    cy.get('[id=confirmPassword]').type('ADMINADMIN');
    cy.get('[id=termsAccepted]').check();
    cy.get('[type=submit]').click();
  });
});
