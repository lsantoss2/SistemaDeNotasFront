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

      <section className="stats">
        <div className="card stat">Colegios: 3</div>
        <div className="card stat">Profesores: 85</div>
        <div className="card stat">Alumnos: 1240</div>
        <div className="card stat">Padres: 820</div>
      </section>

      <section className="middle">
        <div className="calendar card">📅 Calendario (próximamente)</div>
        <div className="graph card">📊 Gráfico (próximamente)</div>
      </section>

      <section className="bottom">
        <div className="events card">
          <h3>Próximos Eventos</h3>
          <ul>
            <li>📌 Evaluaciones 1er Trimestre</li>
            <li>📌 Reunión con padres</li>
            <li>📌 Día del Maestro</li>
          </ul>
        </div>
        <div className="top-students card">
          <h3>Estudiantes Destacados</h3>
          <ul>
            <li>Daniel López - 98.5%</li>
            <li>Lucía Ramírez - 97.8%</li>
            <li>Kevin Pérez - 97.0%</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
