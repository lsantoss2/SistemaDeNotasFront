import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../estilos/Dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem('usuario'));
    if (!datos) {
      navigate('/');
    } else {
      setUsuario(datos);
    }
  }, []);

  const getRolNombre = (rol) => {
    switch (rol) {
      case 0: return "Administrador";
      case 1: return "Profesor";
      case 2: return "Alumno";
      default: return "Usuario";
    }
  };

  if (!usuario) return null;

  return (
    <main className="main">
      <header className="header">
        <h2>Bienvenido, {getRolNombre(usuario.rol)} {usuario.nombre}</h2>
        <span>Año Escolar 2024 - 2025</span>
      </header>

      <div className="powerbi-dashboard" style={{ marginTop: '20px', width: '100%' }}>
        <iframe
          title="notas"
          width="100%"
          height="600"
          src="https://app.powerbi.com/view?r=eyJrIjoiMmEzMzY0ZDQtYmEzMS00MTE5LWFkZDEtZWY5ZDc0MzNkNmUyIiwidCI6IjVmNTNiNGNlLTYzZDQtNGVlOC04OGQyLTIyZjBiMmQ0YjI3YSIsImMiOjR9"
          frameBorder="0"
          allowFullScreen={true}
          style={{ border: 'none' }}
        ></iframe>
      </div>
    </main>
  );
}
