const defaultLabs = [
  { lab_id: 'LAB-01', name: 'Laboratorio de Química Básica', description: 'Uso general para prácticas', area: 'Aulas 4', coordinador: 'Laura Martinez' },
  { lab_id: 'LAB-02', name: 'Laboratorio de Biotecnología', description: 'Investigación avanzada', area: 'Aulas 4 IBT', coordinador: 'Laura Martinez' },
  { lab_id: 'LAB-03', name: 'Almacén Central', description: 'Almacenamiento seguro de reactivos', area: 'Sótano', coordinador: 'Diego Sanchez' }
];

export const getLabs = () => {
  const storedLabs = localStorage.getItem('tec_labs');
  if (storedLabs) {
    return JSON.parse(storedLabs);
  }
  localStorage.setItem('tec_labs', JSON.stringify(defaultLabs));
  return defaultLabs;
};

export const addLab = (newLab) => {
  const currentLabs = getLabs();
  currentLabs.push(newLab);
  localStorage.setItem('tec_labs', JSON.stringify(currentLabs));
};

export const updateLab = (lab_id, updatedData) => {
  const currentLabs = getLabs();
  const index = currentLabs.findIndex(l => l.lab_id === lab_id);
  if (index !== -1) {
    currentLabs[index] = { ...currentLabs[index], ...updatedData };
    localStorage.setItem('tec_labs', JSON.stringify(currentLabs));
  }
};

export const deleteLab = (lab_id) => {
  let currentLabs = getLabs();
  currentLabs = currentLabs.filter(l => l.lab_id !== lab_id);
  localStorage.setItem('tec_labs', JSON.stringify(currentLabs));
};
