// cypress/e2e/Testing_TecLab/reportes.cy.js

describe('CT-022: Visualización de métricas en Analytics', () => {
  
    beforeEach(() => {
      cy.visit('http://localhost:5173/login')
      cy.get('input[type="email"]').type('coordinador@tec.mx')
      cy.get('input[type="password"]').type('Admin1234!')
      cy.get('button[type="submit"]').click()
      cy.url().should('not.include', '/login')
      cy.wait(1000)
    })
  
    it('Debe mostrar las métricas de activos en Analytics', () => {
      cy.visit('http://localhost:5173/analytics')
      cy.wait(1000)
      
      // Verificar que existen las métricas
      cy.contains('Total activos').should('be.visible')
      cy.contains('Activos').should('be.visible')
      cy.contains('En mantenimiento').should('be.visible')
      cy.contains('Dados de baja').should('be.visible')
    })
  })