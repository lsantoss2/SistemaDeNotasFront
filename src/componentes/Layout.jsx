import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import '../estilos/Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rol = usuario?.rol;

  const handleCerrarSesion = () => {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
      localStorage.removeItem('usuario');
      navigate('/');
    }
  };

  // Calculamos el color de fondo del sidebar según el rol
  let colorSidebar = '';
  if (rol === 0) colorSidebar = 'linear-gradient(to bottom, #1e3a8a, #3b82f6)'; // azul admin
  else if (rol === 1) colorSidebar = 'linear-gradient(to bottom, #7f1d1d, #ef4444)'; // rojo profesor
  else if (rol === 2) colorSidebar = 'linear-gradient(to bottom, #065f46, #10b981)'; // verde tutor

  return (
    <div className="layout-container">
      {/* Menú lateral */}
      <aside className="sidebar" style={{ background: colorSidebar }}>
        <div className="logo">Sistema</div>
        <nav>
          <ul>
            {/* ADMINISTRADOR */}
            {rol === 0 && (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/estudiantes">Estudiantes</Link></li>
                <li><Link to="/profesores">Profesores</Link></li>
                <li><Link to="/padres">Padres</Link></li>
                <li><Link to="/usuarios">Usuarios</Link></li>
                <li><Link to="/asignaciones">Asignaciones</Link></li>
                <li><Link to="/notas">Notas</Link></li>
                <li><Link to="/cursos">Cursos</Link></li>
              </>
            )}

            {/* PROFESOR */}
            {rol === 1 && (
              <>
                <li><Link to="/estudiantes">Estudiantes</Link></li>
                <li><Link to="/notas">Notas</Link></li>
              </>
            )}

            {/* ESTUDIANTE */}
            {rol === 2 && (
              <>
                <li><Link to="/mis-notas">Mis Notas</Link></li>
              </>
            )}
          </ul>
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="cerrar-sesion-contenedor">
          <button className="btn-cerrar-sesion" onClick={handleCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
