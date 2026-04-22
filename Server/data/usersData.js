const defaultUsers = [
  { id: 1, email: 'coordinador@tec.mx', password: 'admin', role: 'Coordinador', name: 'Laura Martinez' },
  { id: 2, email: 'laboratorista@tec.mx', password: '123', role: 'Laboratorista', name: 'Diego Sanchez' },
  { id: 3, email: 'director@tec.mx', password: 'tec', role: 'Director', name: 'Roberto Perez' }
];

export const getUsers = () => {
  // Comprobamos si la memoria local (localStorage) del navegador ya tiene guardados usuarios
  const storedUsers = localStorage.getItem('tec_lab_users');

  if (storedUsers) {
    return JSON.parse(storedUsers);
  }

  // Si no hay nada guardado aún, usamos nuestra lista por defecto y la guardamos en la memoria local
  localStorage.setItem('tec_lab_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const addUser = (newUser) => {
  const currentUsers = getUsers();
  currentUsers.push(newUser);
  // Al agregar un usuario, actualizamos directamente la memoria local para que no se borre
  localStorage.setItem('tec_lab_users', JSON.stringify(currentUsers));
};

//tabla de roles

//tabla de usuarios nueva