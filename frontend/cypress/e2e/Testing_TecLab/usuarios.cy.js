// cypress/e2e/Testing_TecLab/usuarios-api.cy.js

let authToken
let tecnicoEmail = `tecnico_test_${Date.now()}@test.com`
let labNombre = `Lab Test ${Date.now()}`
let labId
let tecnicoId
let equipoId
let otroLabId
let otroEquipoId

before(() => {
  // 1. Login como coordinador
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/login',
    body: { email: 'coordinador@tec.mx', password: 'Admin1234!' }
  }).then((res) => {
    expect(res.status).to.eq(200)
    authToken = res.body.token
  })
})

// CT-019: Asignación de técnico a laboratorio
describe('CT-019: Asignación de técnico a laboratorio', () => {
  it('Debe asignar un técnico a un laboratorio', () => {
    // 1. Crear un técnico nuevo
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/users',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Tecnico Test',
        email: tecnicoEmail,
        password: 'Test1234!',
        role: 'encargado'
      }
    }).then((res) => {
      expect(res.status).to.eq(201)
      tecnicoId = res.body.id
    })
    
    // 2. Crear un laboratorio nuevo
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/labs',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: labNombre, departmentId: 1 }
    }).then((res) => {
      expect(res.status).to.eq(201)
      labId = res.body.id
      
      // 3. Asignar técnico al laboratorio
      cy.request({
        method: 'POST',
        url: `http://localhost:3001/api/labs/${labId}/members`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { userId: tecnicoId }
      }).then((assignRes) => {
        expect(assignRes.status).to.eq(200)
      })
    })
  })
})

// CT-020: Técnico edita equipo de su laboratorio
describe('CT-020: Técnico edita equipo de su laboratorio', () => {
  it('Debe permitir que un técnico edite equipos de su laboratorio', () => {
    // 1. Crear un equipo en el laboratorio (como coordinador)
    cy.request({
      method: 'POST',
      url: `http://localhost:3001/api/assets/lab/${labId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Equipo del Tecnico',
        assetType: 'equipo',
        quantity: 1,
        extraFields: {}
      }
    }).then((res) => {
      expect(res.status).to.eq(201)
      equipoId = res.body.id
    })
    
    // 2. Login como técnico
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/login',
      body: { email: tecnicoEmail, password: 'Test1234!' }
    }).then((res) => {
      expect(res.status).to.eq(200)
      const tecnicoToken = res.body.token
      
      // 3. Editar el equipo (debería poder)
      cy.request({
        method: 'PATCH',
        url: `http://localhost:3001/api/assets/${equipoId}`,
        headers: { Authorization: `Bearer ${tecnicoToken}` },
        body: { name: 'Equipo Editado por Tecnico' }
      }).then((editRes) => {
        expect(editRes.status).to.eq(200)
      })
    })
  })
})

// CT-021: Técnico edita equipo no asignado
describe('CT-021: Técnico edita equipo no asignado', () => {
  it('NO DEBE permitir que un técnico edite equipos de laboratorio no asignado', () => {
    // 1. Crear otro laboratorio
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/labs',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: `Lab No Asignado ${Date.now()}`, departmentId: 1 }
    }).then((res) => {
      expect(res.status).to.eq(201)
      otroLabId = res.body.id
      
      // 2. Crear equipo en el otro laboratorio
      cy.request({
        method: 'POST',
        url: `http://localhost:3001/api/assets/lab/${otroLabId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          name: 'Equipo Restringido',
          assetType: 'equipo',
          quantity: 1,
          extraFields: {}
        }
      }).then((res) => {
        expect(res.status).to.eq(201)
        otroEquipoId = res.body.id
      })
    })
    
    // 3. Login como técnico
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/login',
      body: { email: tecnicoEmail, password: 'Test1234!' }
    }).then((res) => {
      expect(res.status).to.eq(200)
      const tecnicoToken = res.body.token
      
      // 4. Intentar editar equipo de laboratorio NO asignado
      cy.request({
        method: 'PATCH',
        url: `http://localhost:3001/api/assets/${otroEquipoId}`,
        headers: { Authorization: `Bearer ${tecnicoToken}` },
        body: { name: 'Intento no autorizado' },
        failOnStatusCode: false
      }).then((editRes) => {
        // Si retorna 200 es ERROR del backend
        // Si retorna 403 es CORRECTO
        if (editRes.status === 200) {
          cy.log('⚠️ ERROR DEL BACKEND: Debería retornar 403')
        }
        expect(editRes.status).to.eq(403)
      })
    })
  })
})