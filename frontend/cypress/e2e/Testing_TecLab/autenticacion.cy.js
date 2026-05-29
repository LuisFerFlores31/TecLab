// cypress/e2e/Testing_TecLab/autenticacion.cy.js

// CT-001: Login con credenciales válidas
describe('CT-001: Login con credenciales válidas', () => {
  it('Debe iniciar sesión como coordinador', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[type="email"]').type('coordinador@tec.mx')
    cy.get('input[type="password"]').type('Admin1234!')
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')
    cy.contains('Lab Inventory').should('be.visible')
  })
})

// CT-002: Login con credenciales inválidas
describe('CT-002: Login con credenciales inválidas', () => {
  it('Debe mostrar error con contraseña incorrecta', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[type="email"]').type('coordinador@tec.mx')
    cy.get('input[type="password"]').type('contraseñamal')
    cy.get('button[type="submit"]').click()
    cy.contains('Credenciales inválidas').should('be.visible')
    cy.url().should('include', '/login')
  })
})

// CT-003: Acceso a ruta protegida sin token (FALLA - Error del sistema)
describe('CT-003: Acceso a ruta protegida sin token', () => {
  it('DEBE FALLAR - El sistema no protege rutas (reportar al backend)', () => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('http://localhost:5173/dashboard')
    // Esta prueba fallará porque el sistema permite acceso sin token
    cy.url().should('include', '/login')
  })
})

// CT-004: Logout y cierre de sesión
describe('CT-004: Logout y cierre de sesión', () => {
  it('Debe cerrar sesión correctamente', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[type="email"]').type('coordinador@tec.mx')
    cy.get('input[type="password"]').type('Admin1234!')
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')
    
    cy.contains('Logout').click()
    cy.url().should('include', '/login')
    
    // Verificar que el token se eliminó
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token')
      expect(token).to.be.null
    })
  })
})

// CT-005: Token JWT expirado
describe('CT-005: Token JWT expirado', () => {
  it('Debe redirigir al login cuando el token expira', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[type="email"]').type('coordinador@tec.mx')
    cy.get('input[type="password"]').type('Admin1234!')
    cy.get('button[type="submit"]').click()
    
    // Simular token expirado
    cy.window().then((win) => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQwMjQwMDB9.expired_signature'
      win.localStorage.setItem('token', expiredToken)
    })
    
    cy.reload()
    cy.url().should('include', '/login')
  })
})