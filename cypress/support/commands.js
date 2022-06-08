/// <reference types="Cypress" />

import 'cypress-localstorage-commands'

Cypress.Commands.add('assertLoadingIsShownAndHidden', () => {
  cy.contains('Loading ...').should('be.visible')
  cy.contains('Loading ...').should('not.exist')
})

Cypress.Commands.add('search', data => {
  cy.get('input[type="text"]')
    .should('be.visible')
    .clear()
    .type(`${data}{enter}`)
})
