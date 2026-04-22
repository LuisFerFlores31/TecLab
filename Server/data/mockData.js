export const recentActivity = [
  { id: 1, user: 'Juan Pérez', action: 'Added 10 Pipettes', time: '2 hours ago', type: 'add' },
  { id: 2, user: 'María González', action: 'Updated Reactivo X', time: '3 hours ago', type: 'update' },
  { id: 3, user: 'Carlos Ruiz', action: 'Removed 5 Beakers', time: '5 hours ago', type: 'remove' },
  { id: 4, user: 'Ana López', action: 'Added 20 Test Tubes', time: '6 hours ago', type: 'add' },
  { id: 5, user: 'Luis Torres', action: 'Updated Storage Location', time: '8 hours ago', type: 'update' }
];

export let inventoryItems = [
  { id: 'ITM-001', name: 'Pipetas de 10ml', category: 'Vidriería', storage: 'Aulas 4', status: 'Normal', quantity: 15 },
  { id: 'ITM-002', name: 'Reactivo Químico X', category: 'Reactivos', storage: 'Aulas 4 IBT', status: 'Review', quantity: 5 },
  { id: 'ITM-003', name: 'Tubos de Ensayo', category: 'Vidriería', storage: 'Aulas 4 IBT', status: 'Normal', quantity: 120 },
  { id: 'ITM-004', name: 'Guantes de Nitrilo', category: 'Equipo de Protección', storage: 'Aulas 4 IBT', status: 'Normal', quantity: 200 },
  { id: 'ITM-005', name: 'Placas Petri', category: 'Consumibles', storage: 'Biblioteca', status: 'Normal', quantity: 45 },
  { id: 'ITM-006', name: 'Ácido Sulfúrico 1M', category: 'Reactivos', storage: 'Aulas 4 IBT', status: 'Review', quantity: 8 },
  { id: 'ITM-007', name: 'Microscopio Digital', category: 'Equipos', storage: 'Aulas 2', status: 'Normal', quantity: 12 },
  { id: 'ITM-008', name: 'Matraz Aforado 250ml', category: 'Vidriería', storage: 'Aulas 4 IBT', status: 'Normal', quantity: 32 }
];

//FUNCIONES DE API PARA FUTURA MIGRACIÓN A POSTGRES

export const getInventory = () => {
  return [...inventoryItems];
};

export const getInventoryById = (id) => {
  return inventoryItems.find(item => item.id === id);
};

export const addInventoryItem = (item) => {
  inventoryItems.push(item);
};

export const updateInventoryItem = (id, updatedItem) => {
  const index = inventoryItems.findIndex(item => item.id === id);
  if (index !== -1) {
    inventoryItems[index] = { ...inventoryItems[index], ...updatedItem };
  }
};

export const deleteInventoryItem = (id) => {
  inventoryItems = inventoryItems.filter(item => item.id !== id);
};