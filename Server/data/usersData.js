const defaultUsers = [
  { id: 1, email: 'coordinador@tec.mx', password: 'admin', role: 'Coordinador', name: 'Laura Martinez' },
  { id: 2, email: 'laboratorista@tec.mx', password: '123', role: 'Laboratorista', name: 'Diego Sanchez' }
];

export const getUsers = () => {
  // Comprobamos si el localStorage del navegador ya tiene guardados usuarios (Despues lo cambio por postgres)
  const storedUsers = localStorage.getItem('tec_lab_users');

  if (storedUsers) {
    return JSON.parse(storedUsers);
  }

  // Si no hay nada guardado aún, se usa la lista por defecto y se guarda en el localStorage
  localStorage.setItem('tec_lab_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const addUser = (newUser) => {
  const currentUsers = getUsers();
  currentUsers.push(newUser);
  // Al agregar un usuario, actualizamos el localStorage
  localStorage.setItem('tec_lab_users', JSON.stringify(currentUsers));
};

export const updateUser = (id, updatedData) => {
  const currentUsers = getUsers();
  const index = currentUsers.findIndex(u => u.id === id);
  if (index !== -1) {
    currentUsers[index] = { ...currentUsers[index], ...updatedData };
    localStorage.setItem('tec_lab_users', JSON.stringify(currentUsers));
  }
};

export const deleteUser = (id) => {
  let currentUsers = getUsers();
  currentUsers = currentUsers.filter(u => u.id !== id);
  localStorage.setItem('tec_lab_users', JSON.stringify(currentUsers));
};