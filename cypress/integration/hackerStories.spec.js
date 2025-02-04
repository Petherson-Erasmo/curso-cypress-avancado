/// <reference types="Cypress" />

const initialTerm = 'React'
const newTerm = 'Cypress'

describe('Hitting the real API', () => {

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: initialTerm,
        page: '0'
      }
    }).as('getStories')

    cy.visit('/')
    cy.wait('@getStories')
  })

  it('shows 20 stories, then the next 20 after clicking "More"', () => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: initialTerm,
        page: '1'
      }
    }).as('getNextStories')

    cy.get('div[class="item"]')
      .should('have.length', 20)
    cy.contains('More')
      .should('be.visible')
      .click()
    cy.wait('@getNextStories')
    cy.get('div[class="item"]')
      .should('have.length', 40)
  })

  it('searches via the last searched term', () => {
    cy.intercept(
      'GET',
      `**/search?query=${newTerm}&page=0`
    ).as('getNewTermStories')

    cy.get('#search')
      .clear()
      .should('be.visible')
      .type(`${newTerm}{enter}`)
    cy.wait('@getNewTermStories')
    cy.getLocalStorage('search')
      .should('be.equal', newTerm)
    cy.get(`button:contains(${initialTerm})`)
      .should('be.visible')
      .click()
    cy.wait('@getStories')
    cy.getLocalStorage('search')
      .should('be.equal', initialTerm)
    cy.get('div[class="item"]')
      .should('have.length', 20)
    cy.get('div[class="item"]')
      .first()
      .should('contain', initialTerm)
    cy.get(`button:contains(${newTerm})`)
      .should('be.visible')
  })
})

describe('Mocking the API', () => {
  context('Footer and list of stories', () => {
    beforeEach(() => {    
      cy.intercept(
        'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'stories' }
      ).as('getStories')

      cy.visit('/')
      cy.wait('@getStories')
    })

    it('Shows the footer', () => {
      cy.get('footer')
        .should('be.visible')
        .and('contain', 'Icons made by Freepik from www.flaticon.com')
    })

    context('List of stories', () => {
      const stories = require('../fixtures/stories.json')

      it('Shows the right data for all rendered stories', () => {
        cy.get('div[class="item"]')
          .first()
          .should('be.visible')
          .should('contain', stories.hits[0].title)
          .and('contain', stories.hits[0].author)
          .and('contain', stories.hits[0].num_comments)
          .and('contain', stories.hits[0].points)
        cy.contains(stories.hits[0].title)
          .should('have.attr', 'href', stories.hits[0].url)
        cy.get('div[class="item"]')
          .last()
          .should('be.visible')
          .should('contain', stories.hits[1].title)
          .and('contain', stories.hits[1].author)
          .and('contain', stories.hits[1].num_comments)
          .and('contain', stories.hits[1].points)
        cy.contains(stories.hits[1].title)
          .should('have.attr', 'href', stories.hits[1].url)
      })

      it('Shows one story less after dimissing the first one', () => {
        cy.get('.button-small')
          .first()
          .should('be.visible')
          .click()

        cy.get('div[class="item"]')
          .should('have.length', 1)
      })

      context('Order by', () => {
        it('Orders by title', () => {
          cy.get('.list-header-button:contains(Title)')
            .as('titleHeader')
            .should('be.visible')
            .click()

          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].title)
          cy.contains(stories.hits[0].title)
            .should('have.attr', 'href', stories.hits[0].url)

          cy.get('@titleHeader')
            .click()
          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[1].title)
          cy.contains(stories.hits[1].title)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('Orders by author', () => {
          cy.get('.list-header-button:contains(Author)')
            .as('authorHeader')
            .should('be.visible')
            .click()

          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].author)

          cy.get('@authorHeader')
            .click()
          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[1].author)

        })

        it('Orders by comments', () => {
          cy.get('.list-header-button:contains(Comments)')
            .as('commentsHeader')
            .should('be.visible')
            .click()

          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].num_comments)

          cy.get('@commentsHeader')
            .click()
          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[1].num_comments)
        })

        it('Orders by points', () => {
          cy.get('.list-header-button:contains(Points)')
            .as('pointsHeader')
            .should('be.visible')
            .click()

          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].points)

          cy.get('@pointsHeader')
            .click()
          cy.get('div[class="item"]')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[1].points)
        })
      })
    })
  })

  context('Search', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'empty' }
      ).as('getEmptyStories')

      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories' }
      ).as('getStories')

      cy.visit('/')
      cy.wait('@getEmptyStories')

      cy.get('#search')
        .clear()
    })

    it('Shows no story when none is returne', () => {
      cy.get('div[class="item"]')
        .should('not.exist')
    })

    it('Types and hits ENTER', () => {
      cy.get('#search')
        .should('be.visible')
        .type(`${newTerm}{enter}`)
      cy.wait('@getStories')
      cy.getLocalStorage('search')
        .should('be.equal', newTerm)
      cy.get('div[class="item"]')
        .should('have.length', 2)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    it('Types and clicks the submit button', () => {
      cy.get('#search')
        .should('be.visible')
        .type(newTerm)
      cy.contains('Submit')
        .should('be.visible')
        .click()
      cy.wait('@getStories')
      cy.getLocalStorage('search')
        .should('be.equal', newTerm)
      cy.get('div[class="item"]')
        .should('have.length', 2)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    context('Last searches', () => {
      it('Shows a max of 5 buttons for the last searched terms', () => {
        const faker = require('faker')

        cy.intercept(
          'GET',
          '**/search**',
          { fixture: 'empty' }
        ).as('getRandomStories')

        Cypress._.times(6, () => {
          const randomWord = faker.random.word()
          cy.get('#search')
            .clear()
            .type(`${randomWord}{enter}`)
          cy.wait('@getRandomStories')
          cy.getLocalStorage('search')
            .should('be.equal', randomWord)
        })
        cy.get('.last-searches')
          .within(() => {
            cy.get('button')
              .should('have.length', 5)
          })

      })
    })
  })

  it('Shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        delay: 1000, 
        fixture: 'stories' 
      }
    ).as('getDelayStories')

    cy.visit('/')

    cy.assertLoadingIsShownAndHidden()
    cy.wait('@getDelayStories')
    cy.get('.item')
      .should('have.length', 2)
  })
})

describe('Errors message', () => {
  const errorMsg = 'Something went wrong ...'

  it('Shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getServerFailure')
    cy.visit('/')
    cy.wait('@getServerFailure')
    cy.contains(errorMsg)
      .should('be.visible')
  })

  it('Shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { forceNetworkError: true }
    ).as('getNetworkFailure')
    cy.visit('/')
    cy.wait('@getNetworkFailure')
    cy.contains(errorMsg)
      .should('be.visible')
  })
})