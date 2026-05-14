const bcrypt = require('bcryptjs')
const prisma  = require('./prisma')

async function main() {
  console.log('🌱 Reseteando base de datos...')

  // Limpieza ordenada respetando foreign keys
  await prisma.assetAuditLog.deleteMany({})
  await prisma.statusHistory.deleteMany({})
  await prisma.assetLog.deleteMany({})
  await prisma.asset.deleteMany({})
  await prisma.labFieldSchema.deleteMany({})
  await prisma.labMember.deleteMany({})
  await prisma.laboratory.deleteMany({})
  await prisma.department.deleteMany({})

  // ── Departamentos ──────────────────────────────────────────────────────────
  const deptDefs = [
    'Ciencias',
    'Mecánica',
    'Mecatrónica',
    'Ingeniería Industrial',
    'Computación',
    'Biotecnología',
    'Tecnologías Sostenibles y Civil',
  ]

  const depts = {}
  for (const name of deptDefs) {
    depts[name] = await prisma.department.create({ data: { name } })
  }

  // ── Laboratorios ───────────────────────────────────────────────────────────
  const labDefs = [
    { name: 'Física 1',                     dept: 'Ciencias'                       },
    { name: 'Física 2 y E&M',               dept: 'Ciencias'                       },
    { name: 'Ciencias Químico-Biológicas',  dept: 'Ciencias'                       },
    
    { name: 'Termofluidos',                 dept: 'Mecánica'                       },
    { name: 'Mecánica de Materiales',       dept: 'Mecánica'                       },
    { name: 'Procesos de Manufactura',      dept: 'Mecánica'                       },
    { name: 'Metrología',                   dept: 'Mecánica'                       },
    
    { name: 'Celda de Manufactura',         dept: 'Mecatrónica'                    },
    { name: 'Electrónica',                  dept: 'Mecatrónica'                    },
    { name: 'Robótica',                     dept: 'Mecatrónica'                    },
    { name: 'MakerSpace',                   dept: 'Mecatrónica'                    },
    { name: 'Control y Redes Industriales', dept: 'Mecatrónica'                    },
    
    { name: 'Ingeniería Industrial',        dept: 'Ingeniería Industrial'          },
    
    { name: 'Redes y Telecomunicaciones',   dept: 'Computación'                    },
    { name: 'Desarrollo Software',          dept: 'Computación'                    },
    { name: 'Multimedia',                   dept: 'Computación'                    },
    
    { name: 'Biotecnología',               dept: 'Biotecnología'                  },
  ]

  const labs = {}
  for (const def of labDefs) {
    labs[def.name] = await prisma.laboratory.create({
      data: { name: def.name, departmentId: depts[def.dept].id }
    })
  }

  // ── Usuarios ───────────────────────────────────────────────────────────────
  const coordinador = await prisma.user.upsert({
    where:  { email: 'coordinador@teclab.mx' },
    update: {},
    create: {
      name:         'Coordinador General',
      email:        'coordinador@tec.mx',
      passwordHash: await bcrypt.hash('Admin1234!', 10),
      role:         'coordinador'
    }
  })

  const encargadosDefs = [
    { name: 'Encargado Biotecnología',      email: 'bio@tec.mx',      lab: 'Biotecnología'               },
    { name: 'Encargado Desarrollo Software',email: 'dev@tec.mx',      lab: 'Desarrollo Software'                     },
    { name: 'Encargado Electrónica',        email: 'elec@tec.mx',     lab: 'Electrónica'                 },
    { name: 'Encargado Robótica',           email: 'robot@tec.mx',    lab: 'Robótica'                    },
    { name: 'Encargado Metrología',         email: 'metro@tec.mx',    lab: 'Metrología'                  },
    { name: 'Encargado MakerSpace',         email: 'maker@tec.mx',    lab: 'MakerSpace'                  },
    { name: 'Encargado Multimedia',         email: 'media@tec.mx',    lab: 'Multimedia'                  },
    { name: 'Encargado Física 1',           email: 'fis1@tec.mx',     lab: 'Física 1'                    },
    { name: 'Encargado Física 2',           email: 'fis2@tec.mx',     lab: 'Física 2 y E&M'             },
    { name: 'Encargado Industrial',         email: 'ind@tec.mx',      lab: 'Ingeniería Industrial'       },
    { name: 'Encargado Manufactura',        email: 'manu@tec.mx',     lab: 'Celda de Manufactura'        },
    { name: 'Encargado Redes',              email: 'redes@tec.mx',    lab: 'Redes y Telecomunicaciones'  },
    { name: 'Encargado Control',            email: 'control@tec.mx',  lab: 'Control y Redes Industriales'},
    { name: 'Encargado Mecánica',           email: 'mec@tec.mx',      lab: 'Mecánica de Materiales'      },
    { name: 'Encargado Procesos',           email: 'proc@tec.mx',     lab: 'Procesos de Manufactura'     },
    { name: 'Encargado Termofluidos',       email: 'termo@tec.mx',    lab: 'Termofluidos'                },
    { name: 'Encargado Química',            email: 'quim@tec.mx',     lab: 'Ciencias Químico-Biológicas' },
  ]

  for (const def of encargadosDefs) {
    const user = await prisma.user.upsert({
      where:  { email: def.email },
      update: {},
      create: {
        name:         def.name,
        email:        def.email,
        passwordHash: await bcrypt.hash('Encargado1234!', 10),
        role:         'encargado'
      }
    })
    await prisma.labMember.upsert({
      where:  { userId_labId: { userId: user.id, labId: labs[def.lab].id } },
      update: {},
      create: { userId: user.id, labId: labs[def.lab].id }
    })
  }

  // ── Schemas dinámicos ──────────────────────────────────────────────────────
  const createSchema = async (labName, fields) => {
    const lab = labs[labName]
    if (!lab) { console.warn(`⚠ Lab no encontrado: ${labName}`); return }
    for (const [i, f] of fields.entries()) {
      await prisma.labFieldSchema.create({
        data: {
          labId:           lab.id,
          fieldKey:        f.key,
          fieldLabel:      f.label,
          fieldType:       f.type      ?? 'text',
          isRequired:      f.required  ?? false,
          isVisibleInTable:f.visible   ?? true,
          isFilterable:    f.filterable ?? false,
          sortOrder:       i,
        }
      })
    }
  }

  await createSchema('Biotecnología', [
    { key: 'localizacion',      label: 'Letra Localización',  visible: true,  filterable: false },
    { key: 'elemento_etiqueta', label: 'Elemento Etiqueta',   visible: true,  filterable: false },
    { key: 'formula',           label: 'Fórmula',             visible: true,  filterable: false },
    { key: 'marca',             label: 'Marca',               visible: true,  filterable: true  },
    { key: 'caducidad',         label: 'Caducidad',           type: 'date',   visible: true,  filterable: false },
    { key: 'nfpa',              label: 'NFPA',                visible: false, filterable: false },
    { key: 'ghs',               label: 'GHS',                 visible: false, filterable: false },
    { key: 'hoja_seguridad',    label: 'Hoja de Seguridad',   type: 'url',    visible: false, filterable: false },
    { key: 'observaciones',     label: 'Observaciones',       visible: false, filterable: false },
  ])

  await createSchema('Celda de Manufactura', [
    { key: 'modelo',         label: 'Modelo',         visible: true  },
    { key: 'no_inventario',  label: 'No. Inventario', visible: true  },
    { key: 'observaciones',  label: 'Observaciones',  visible: false },
  ])

  await createSchema('Ciencias Químico-Biológicas', [
    { key: 'formula_mol',    label: 'Fórmula Molecular', visible: true,  filterable: false },
    { key: 'ubicacion',      label: 'Ubicación',         visible: true,  filterable: false },
    { key: 'nfpa',           label: 'NFPA',              visible: false, filterable: false },
    { key: 'ghs',            label: 'GHS',               visible: false, filterable: false },
    { key: 'caducidad',      label: 'Caducidad',         type: 'date',   visible: true,  filterable: false },
    { key: 'hoja_seguridad', label: 'Hoja de Seguridad', type: 'url',    visible: false, filterable: false },
  ])

  const fisicaFields = [
    { key: 'ubicacion',   label: 'Ubicación',  visible: true,  filterable: false },
    { key: 'categoria',   label: 'Categoría',  visible: true,  filterable: true  },
    { key: 'color',       label: 'Color',      visible: false, filterable: false },
    { key: 'modelo',      label: 'Modelo',     visible: true,  filterable: false },
    { key: 'marca',       label: 'Marca',      visible: true,  filterable: true  },
    { key: 'componentes', label: 'Componentes',visible: false, filterable: false },
    { key: 'manual_liga', label: 'Link Manual',type: 'url', visible: false, filterable: false },
  ]
  await createSchema('Física 1',      fisicaFields)
  await createSchema('Física 2 y E&M', fisicaFields)

  await createSchema('Mecánica de Materiales', [
    { key: 'clasificacion',      label: 'Clasificación',          visible: true,  filterable: true  },
    { key: 'marca',              label: 'Marca',                  visible: true,  filterable: true  },
    { key: 'modelo',             label: 'Modelo',                 visible: true,  filterable: false },
    { key: 'no_activo_fijo',     label: 'No. Activo Fijo',       visible: true,  filterable: false },
    { key: 'no_serie',           label: 'No. Serie',             visible: false, filterable: false },
    { key: 'lider_responsable',  label: 'Líder Responsable',     visible: false, filterable: false },
    { key: 'ubicacion',          label: 'Ubicación',             visible: true,  filterable: false },
    { key: 'fecha_garantia',     label: 'Vence Garantía',        type: 'date',   visible: true,  filterable: false },
    { key: 'frecuencia_uso',     label: 'Frecuencia de Uso',     visible: false, filterable: false },
    { key: 'fecha_ultimo_mp',    label: 'Último Servicio MP',    type: 'date',   visible: true,  filterable: false },
    { key: 'costo_mp',           label: 'Costo MP Anual',        type: 'number', visible: false, filterable: false },
    { key: 'proveedor_mp',       label: 'Proveedor MP',          visible: false, filterable: false },
    { key: 'observaciones',      label: 'Observaciones',         visible: false, filterable: false },
  ])

  await createSchema('Redes y Telecomunicaciones', [
    { key: 'descripcion_larga',  label: 'Descripción',    visible: false, filterable: false },
    { key: 'caracteristicas',    label: 'Características',visible: true,  filterable: false },
    { key: 'no_serie',           label: 'No. Serie',      visible: true,  filterable: false },
    { key: 'fecha_prestamo',     label: 'Fecha Préstamo', type: 'date', visible: true,  filterable: false },
    { key: 'usuario_prestamo',   label: 'Usuario',        visible: true,  filterable: false },
    { key: 'ubicacion',          label: 'Ubicación',      visible: true,  filterable: false },
  ])

  const consumibleFields = [
    { key: 'marca',             label: 'Marca',              visible: true,  filterable: true  },
    { key: 'no_inventario',     label: 'No. Inventario',     visible: true,  filterable: false },
    { key: 'existencias_reales',label: 'Existencias Reales', type: 'number', visible: true,  filterable: false },
    { key: 'motivo_salida',     label: 'Motivo de Salida',   visible: false, filterable: false },
    { key: 'observaciones',     label: 'Observaciones',      visible: false, filterable: false },
  ]
  await createSchema('Metrología',           consumibleFields)
  await createSchema('Termofluidos',         consumibleFields)
  await createSchema('Procesos de Manufactura', consumibleFields)

  await createSchema('Desarrollo Software', [
    { key: 'caracteristicas', label: 'Características', visible: true,  filterable: false },
    { key: 'marca',           label: 'Marca',           visible: true,  filterable: true  },
    { key: 'modelo',          label: 'Modelo',          visible: true,  filterable: false },
    { key: 'no_serie',        label: 'No. Serie',       visible: true,  filterable: false },
    { key: 'ubicacion',       label: 'Ubicación',       visible: true,  filterable: false },
  ])

  await createSchema('Multimedia', [
    { key: 'caracteristicas', label: 'Características', visible: true,  filterable: false },
    { key: 'marca',           label: 'Marca',           visible: true,  filterable: true  },
    { key: 'modelo',          label: 'Modelo',          visible: true,  filterable: false },
    { key: 'no_serie',        label: 'No. Serie',       visible: true,  filterable: false },
    { key: 'ubicacion',       label: 'Ubicación',       visible: true,  filterable: false },
  ])

  const electronicaFields = [
    { key: 'categoria',        label: 'Categoría',      visible: true,  filterable: true  },
    { key: 'tipo',             label: 'Tipo',           visible: true,  filterable: true  },
    { key: 'descripcion',      label: 'Descripción',    visible: false, filterable: false },
    { key: 'especificaciones', label: 'Especificaciones',visible: false, filterable: false },
    { key: 'modelo',           label: 'Modelo',         visible: true,  filterable: false },
  ]
  await createSchema('Electrónica',              electronicaFields)
  await createSchema('Robótica',                 electronicaFields)
  await createSchema('MakerSpace',               electronicaFields)
  await createSchema('Control y Redes Industriales', [
    { key: 'marca',         label: 'Marca',         visible: true,  filterable: true  },
    { key: 'modelo',        label: 'Modelo',        visible: true,  filterable: false },
    { key: 'no_inventario', label: 'No. Inventario',visible: true,  filterable: false },
    { key: 'observaciones', label: 'Observaciones', visible: false, filterable: false },
  ])

  await createSchema('Ingeniería Industrial', [
    { key: 'marca',          label: 'Marca/Proveedor', visible: true,  filterable: true  },
    { key: 'modelo',         label: 'Modelo',          visible: true,  filterable: false },
    { key: 'codigo_marte',   label: 'Código MARTE',    visible: true,  filterable: false },
    { key: 'ubicacion',      label: 'Ubicación',       visible: true,  filterable: false },
    { key: 'observaciones',  label: 'Observaciones',   visible: false, filterable: false },
  ])

  console.log('   coordinador@tec.mx  →  Admin1234!')
  console.log('   [lab]@tec.mx        →  Encargado1234!')
  console.log(`   ${Object.keys(labs).length} laboratorios, ${Object.keys(depts).length} departamentos`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

  