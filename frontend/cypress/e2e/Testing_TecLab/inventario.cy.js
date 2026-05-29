// cypress/e2e/Testing_TecLab/inventario.cy.js

beforeEach(() => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[type="email"]').type('coordinador@tec.mx')
    cy.get('input[type="password"]').type('Admin1234!')
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')
    cy.wait(1000)
  })
  
  // CT-006: Alta de nuevo equipo
  describe('CT-006: Alta de nuevo equipo', () => {
    it('Debe registrar un nuevo equipo correctamente', () => {
      cy.visit('http://localhost:5173/add')
      cy.wait(2000)
      
      cy.get('input[placeholder="Nombre del activo"]').type('Osciloscopio Tektronix')
      cy.get('input[value="0"]').clear().type('1')
      cy.contains('Celda de Manufactura').click()
      cy.wait(2000)
      
      cy.get('input').eq(2).type('TDS-2024C')
      cy.get('input').eq(3).type('LAB-001-099')
      cy.get('input').eq(4).type('Equipo nuevo en buen estado')
      
      cy.contains('button', 'Registrar activo').click()
      cy.contains('Activo registrado').should('be.visible')
    })
  })
  
  // CT-007: Alta con número duplicado (DEBE FALLAR)
  describe('CT-007: Alta de equipo con número duplicado', () => {
    it('DEBE FALLAR - El backend no valida números duplicados', () => {
      cy.visit('http://localhost:5173/add')
      cy.wait(2000)
      
      cy.get('input[placeholder="Nombre del activo"]').type('Equipo Duplicado')
      cy.get('input[value="0"]').clear().type('1')
      cy.contains('Celda de Manufactura').click()
      cy.wait(2000)
      
      cy.get('input').eq(3).type('LAB-001-099')
      cy.contains('button', 'Registrar activo').click()
      cy.contains('El número de inventario ya existe').should('be.visible')
    })
  })
  
  // CT-008: Consulta de listado de equipos
  describe('CT-008: Consulta de listado de equipos', () => {
    it('Debe mostrar la tabla de inventario', () => {
      cy.visit('http://localhost:5173/inventory')
      cy.get('table').should('be.visible')
    })
  })
  
  // CT-009: Búsqueda de equipo por nombre
  describe('CT-009: Búsqueda de equipo por nombre', () => {
    it('Debe encontrar equipo por nombre', () => {
      cy.visit('http://localhost:5173/inventory')
      cy.wait(1000)
      cy.contains('Celda de Manufactura').click()
      cy.wait(1000)
      cy.get('input[placeholder*="Buscar"]').type('Osciloscopio')
      cy.wait(2000)
      cy.contains('Osciloscopio Tektronix').should('be.visible')
    })
  })
  
  // CT-010: Búsqueda de equipo por alias
  describe('CT-010: Búsqueda de equipo por alias', () => {
    it('Debe encontrar equipo por alias', () => {
      cy.visit('http://localhost:5173/inventory')
      cy.wait(1000)
      cy.contains('Celda de Manufactura').click()
      cy.wait(1000)
      cy.get('input[placeholder*="Buscar"]').type('oscilo')
      cy.wait(2000)
      cy.contains('Osciloscopio Tektronix').should('be.visible')
    })
  })
  
  // CT-011: Edición de equipo existente (ícono lápiz)
  describe('CT-011: Edición de equipo existente', () => {
    it('Debe editar un equipo correctamente', () => {
      cy.visit('http://localhost:5173/inventory')
      cy.wait(1000)
      cy.contains('Celda de Manufactura').click()
      cy.wait(2000)
      
      cy.contains('tr', 'Osciloscopio Tektronix').within(() => {
        cy.get('svg').eq(1).click({ force: true })
      })
      
      cy.url().should('include', '/edit/')
      cy.get('input[placeholder="Nombre del activo"]').clear().type('Osciloscopio Actualizado')
      cy.contains('button', 'Guardar cambios').click()
      cy.contains('Activo actualizado').should('be.visible')
    })
  })
  
  // CT-012: Baja lógica de equipo (con confirm nativo)
describe('CT-012: Baja lógica de equipo', () => {
    it('Debe dar de baja un equipo', () => {
      // Interceptar el confirm de JavaScript
      cy.on('window:confirm', (text) => {
        expect(text).to.include('¿Dar de baja')
        return true // Aceptar
      })
      
      cy.visit('http://localhost:5173/inventory')
      cy.wait(1000)
      cy.contains('Celda de Manufactura').click()
      cy.wait(2000)
      
      cy.contains('tr', 'Equipo Duplicado').within(() => {
        cy.get('svg').eq(2).click({ force: true })
      })
      
      cy.contains('Equipo dado de baja').should('be.visible')
    })
  })
  // CT-013: Ver ficha detallada del equipo (ícono ojo)
  describe('CT-013: Ver ficha detallada del equipo', () => {
    it('Debe mostrar la ficha detallada', () => {
      cy.visit('http://localhost:5173/inventory')
      cy.wait(1000)
      cy.contains('Celda de Manufactura').click()
      cy.wait(2000)
      
      cy.contains('tr', 'Osciloscopio Actualizado').within(() => {
        cy.get('svg').eq(0).click({ force: true })
      })
      
      cy.contains('Nombre').should('be.visible')
      cy.contains('Modelo').should('be.visible')
    })
  })
  
  // CT-014: Registro de historial de cambios (en Analytics)
  describe('CT-014: Registro de historial de cambios', () => {
    it('Debe mostrar el historial de cambios en Analytics', () => {
      cy.visit('http://localhost:5173/analytics')
      cy.wait(2000)
      cy.contains('Actividad reciente').should('be.visible')
      cy.contains('Osciloscopio Actualizado').should('be.visible')
    })
  })