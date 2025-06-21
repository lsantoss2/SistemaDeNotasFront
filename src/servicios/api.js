const API_BASE = 'https://proxy-somee.onrender.com/api';

export const loginUsuario = async (usuario, pass) => {
  try {
    const url = `${API_BASE}/Usuario/Login?usuario=${encodeURIComponent(usuario)}&pass=${encodeURIComponent(pass)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error en la solicitud de login:', error);
    return null;
  }
};
