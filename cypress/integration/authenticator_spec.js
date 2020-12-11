describe('Authenticator:', function() {
    // Step 1: setup the application state
    beforeEach(function() {
      cy.visit('/');
    });
    
    describe('Sign In:', () => {
      it('allows a user to signin', () => {
        // Step 2: Take an action (Sign in)
        cy.get(selectors.usernameInput).first().type("govilsurabhi81@gmail.com");
        cy.get(selectors.signInPasswordInput).type("HelloKnow@123");
        cy.get(selectors.signInSignInButton).contains('Sign In').click();
  
        // Step 3: Make an assertion (Check for sign-out text)
        cy.get(selectors.signOutButton).contains('Sign Out');
      });
    });
    
    describe('Testing Upload File:', () => {
    it('allows a user to upload files', () => {
        cy.fixture('test_csv.xlsx').then(fileContent => {
            cy.get(selectors.usernameInput).first().type("govilsurabhi81@gmail.com");
            cy.get(selectors.signInPasswordInput).type("HelloKnow@123");
            cy.get(selectors.signInSignInButton).contains('Sign In').click();
            cy.get(selectors.uploadButton).click({
                fileContent: fileContent.toString(),
                fileName: 'test_csv',
                mimeType: 'image/png'
            });
            //cy.get(selectors.uploadButton).click();
        });
    });
    });
  
  });
  export const selectors = {
    // Auth component classes
    usernameInput: '[data-test="sign-in-username-input"]',
    signInPasswordInput: '[data-test="sign-in-password-input"]',
    signInSignInButton: '[data-test="sign-in-sign-in-button"]',
    signOutButton: '[data-test="sign-out-button"]',
    uploadButton: '[data-test="user-upload-button"]'
  }