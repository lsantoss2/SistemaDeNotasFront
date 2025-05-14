import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import '../estilos/layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rol = usuario?.rol;

  const handleCerrarSesion = () => {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
      localStorage.removeItem('usuario'); // 🧹 Borra sesión
      navigate('/'); // 🚀 Regresa al login
    }
  };

  return (
    <div className="layout-container">
      {/* Menú lateral */}
      <aside className="sidebar">
        <div className="logo">Sistema</div>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>

            {(rol === 0 || rol === 1) && (
              <li><Link to="/estudiantes">Estudiantes</Link></li>
            )}

            {rol === 0 && (
              <>
                <li><Link to="/maestros">Maestros</Link></li>
                <li><Link to="/padres">Padres</Link></li>
                <li><Link to="/eventos">Eventos</Link></li>
                <li><Link to="/examenes">Exámenes</Link></li>
                <li><Link to="/usuarios">Usuarios</Link></li>
              </>
            )}

            {(rol === 1 || rol === 2) && (
              <li><Link to="/horarios">Horarios</Link></li>
            )}

            {rol === 1 && (
              <li><Link to="/notas">Notas</Link></li>
            )}

            {rol === 2 && (
              <li><Link to="/mis-notas">Mis Notas</Link></li>
            )}
          </ul>
        </nav>

        {/* ✅ Botón de Cerrar Sesión */}
        <div className="cerrar-sesion-contenedor">
          <button className="btn-cerrar-sesion" onClick={handleCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido de cada página */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
