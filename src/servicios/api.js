const API_BASE = 'https://www.bakend-notas.somee.com';

export const loginUsuario = async (usuario, pass) => {
  try {
    const url = `${API_BASE}/Usuario/Login?usuario=${encodeURIComponent(usuario)}&pass=${encodeURIComponent(pass)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'text/plain' }
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
