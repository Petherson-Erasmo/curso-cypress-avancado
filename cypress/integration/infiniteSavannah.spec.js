/// <reference types="Cypress" />

// O desenvolvimento desse teste foi
describe('Hacker News Search', () => {
  const term = 'cypress.io'

  beforeEach(() => {
    cy.intercept(
      'GET',
      '**/search?query=redux&page=0&hitsPerPage=100',
      {
        fixture: 'empty'
      }
    ).as('getEmpty')
    cy.intercept(
      'GET',
            `**/search?query=${term}&page=0&hitsPerPage=100`,
            {
              fixture: 'stories'
            }
    ).as('getStories')

    cy.visit('http://infinite-savannah-93746.herokuapp.com/')
    cy.wait('@getEmpty')
  })

  it('Correctly caches the results', () => {
    const faker = require('faker')
    const randomWord = faker.random.word()
    let count = 0

    cy.intercept(
      'GET',
            `**/search?query=${randomWord}**`, req => {
              count += 1
              req.reply({
                fixture: 'empty'
              })
            }
    ).as('getRandom')

    cy.search(randomWord)
      .then(() => {
        expect(count, `network calls to fetch ${randomWord}`)
          .to.equal(1)

        cy.wait('@getRandom')

        cy.search(term)
        cy.wait('@getStories')

        cy.search(randomWord)
          .then(() => {
            expect(count, `network calls to fetch ${randomWord}`)
              .to.equal(1)
          })
      })
  })
})
