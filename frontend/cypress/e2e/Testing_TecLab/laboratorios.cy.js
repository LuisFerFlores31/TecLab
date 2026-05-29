// cypress/e2e/Testing_TecLab/laboratorios.cy.js

let authToken
let timestamp

beforeEach(() => {
  timestamp = Date.now()
  
  // Login para obtener token
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/login',
    body: { email: 'coordinador@tec.mx', password: 'Admin1234!' }
  }).then((res) => {
    expect(res.status).to.eq(200)
    authToken = res.body.token
  })
})

// CT-015: Alta de nuevo laboratorio
describe('CT-015: Alta de nuevo laboratorio', () => {
  it('Debe registrar un nuevo laboratorio', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/labs',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: `Laboratorio de Pruebas ${timestamp}`, departmentId: 1 },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(201)
    })
  })
})

// CT-016: Baja de laboratorio sin equipos
describe('CT-016: Baja de laboratorio sin equipos', () => {
  it('Debe eliminar un laboratorio sin equipos', () => {
    // Crear laboratorio con nombre único
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/labs',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: `Lab Para Eliminar ${timestamp}`, departmentId: 1 }
    }).then((res) => {
      const id = res.body.id
      // Eliminar laboratorio
      cy.request({
        method: 'DELETE',
        url: `http://localhost:3001/api/labs/${id}`,
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((deleteRes) => {
        expect(deleteRes.status).to.eq(200)
      })
    })
  })
})

// CT-017: Baja de laboratorio con equipos activos
describe('CT-017: Baja de laboratorio con equipos activos', () => {
  it('Debe eliminar laboratorio aunque tenga equipos', () => {
    // Crear laboratorio nuevo
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/labs',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: `Lab Con Equipos ${timestamp}`, departmentId: 1 }
    }).then((res) => {
      const labId = res.body.id
      
      // Crear un equipo en ese laboratorio
      cy.request({
        method: 'POST',
        url: `http://localhost:3001/api/assets/lab/${labId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          name: 'Equipo de Prueba',
          assetType: 'equipo',
          quantity: 1,
          extraFields: {}
        }
      }).then(() => {
        // Eliminar laboratorio (debería eliminar también los equipos)
        cy.request({
          method: 'DELETE',
          url: `http://localhost:3001/api/labs/${labId}`,
          headers: { Authorization: `Bearer ${authToken}` },
          failOnStatusCode: false
        }).then((deleteRes) => {
          // Tu backend falla por foreign key. Debes arreglarlo o aceptar que falle
          expect(deleteRes.status).to.eq(200)
        })
      })
    })
  })
})

// CT-018: Edición de laboratorio
describe('CT-018: Edición de laboratorio', () => {
  it('Debe editar un laboratorio', () => {
    // Crear laboratorio
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/labs',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: `Lab Original ${timestamp}`, departmentId: 1 }
    }).then((res) => {
      const id = res.body.id
      // Editar laboratorio
      cy.request({
        method: 'PATCH',
        url: `http://localhost:3001/api/labs/${id}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { name: `Lab Editado ${timestamp}` }
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200)
        expect(updateRes.body.name).to.eq(`Lab Editado ${timestamp}`)
      })
    })
  })
})