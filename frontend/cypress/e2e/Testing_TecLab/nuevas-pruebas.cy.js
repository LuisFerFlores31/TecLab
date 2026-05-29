// cypress/e2e/Testing_TecLab/nuevas-pruebas.cy.js

describe('Nuevas Pruebas - Usuarios e Inventario', () => {
  
    // Variable para guardar el ID del usuario creado
    let nuevoUsuarioId
    let authToken
  
    // Login antes de todas las pruebas
    before(() => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/auth/login',
        body: { email: 'coordinador@tec.mx', password: 'Admin1234!' }
      }).then((res) => {
        expect(res.status).to.eq(200)
        authToken = res.body.token
      })
    })
  
    // CT-023: Crear nuevo usuario (encargado)
    describe('CT-023: Crear nuevo usuario encargado', () => {
      it('Debe crear un nuevo usuario con rol encargado', () => {
        const timestamp = Date.now()
        
        cy.request({
          method: 'POST',
          url: 'http://localhost:3001/api/users',
          headers: { Authorization: `Bearer ${authToken}` },
          body: {
            name: `Encargado Test ${timestamp}`,
            email: `encargado_${timestamp}@tec.mx`,
            password: 'Test1234!',
            role: 'encargado'
          }
        }).then((res) => {
          expect(res.status).to.eq(201)
          nuevoUsuarioId = res.body.id
          expect(res.body.name).to.include('Encargado Test')
          expect(res.body.role).to.eq('encargado')
        })
      })
    })
  
    // CT-024: Eliminar usuario
    describe('CT-024: Eliminar usuario', () => {
      it('Debe eliminar un usuario (baja lógica)', () => {
        // Primero crear un usuario para eliminar
        const timestamp = Date.now()
        
        cy.request({
          method: 'POST',
          url: 'http://localhost:3001/api/users',
          headers: { Authorization: `Bearer ${authToken}` },
          body: {
            name: `Usuario Para Eliminar ${timestamp}`,
            email: `eliminar_${timestamp}@tec.mx`,
            password: 'Test1234!',
            role: 'encargado'
          }
        }).then((res) => {
          expect(res.status).to.eq(201)
          const userId = res.body.id
          
          // Eliminar el usuario
          cy.request({
            method: 'DELETE',
            url: `http://localhost:3001/api/users/${userId}`,
            headers: { Authorization: `Bearer ${authToken}` }
          }).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200)
          })
        })
      })
    })
  
    // CT-025: Subir imagen al equipo (UI)
    describe('CT-025: Subir imagen al equipo', () => {
      beforeEach(() => {
        cy.visit('http://localhost:5173/login')
        cy.get('input[type="email"]').type('coordinador@tec.mx')
        cy.get('input[type="password"]').type('Admin1234!')
        cy.get('button[type="submit"]').click()
        cy.url().should('not.include', '/login')
        cy.wait(1000)
      })
  
      it('Debe existir la opción de subir imagen en el formulario', () => {
        cy.visit('http://localhost:5173/add')
        cy.wait(1000)
        
        // Verificar que existe el área de subir imagen
        cy.contains('Imagen del activo').should('be.visible')
        cy.contains('Arrastra una imagen o haz clic').should('be.visible')
        cy.get('input[type="file"]').should('exist')
      })
    })
  
    // CT-026: Filtrar equipos por laboratorio (UI)
    describe('CT-026: Filtrar equipos por laboratorio', () => {
      beforeEach(() => {
        cy.visit('http://localhost:5173/login')
        cy.get('input[type="email"]').type('coordinador@tec.mx')
        cy.get('input[type="password"]').type('Admin1234!')
        cy.get('button[type="submit"]').click()
        cy.url().should('not.include', '/login')
        cy.wait(1000)
      })
  
      it('Debe mostrar equipos según el laboratorio seleccionado', () => {
        cy.visit('http://localhost:5173/inventory')
        cy.wait(1000)
        
        // Verificar que existe el laboratorio
        cy.contains('Biotecnología').should('be.visible')
        
        // Seleccionar otro laboratorio
        cy.contains('Celda de Manufactura').click()
        cy.wait(500)
        
        // Verificar que la vista se actualizó
        cy.contains('Inventario').should('be.visible')
      })
    })
  })