import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import '../estilos/layout.css';

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

  return (
    <div className="layout-container">
      {/* Menú lateral */}
      <aside className="sidebar">
        <div className="logo">Sistema</div>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>

            {/* ADMINISTRADOR: acceso total */}
            {rol === 0 && (
              <>
                <li><Link to="/estudiantes">Estudiantes</Link></li>
                <li><Link to="/profesores">Profesores</Link></li>
                <li><Link to="/padres">Padres</Link></li>
                <li><Link to="/usuarios">Usuarios</Link></li>
                <li><Link to="/asignaciones">Asignaciones</Link></li>
                <li><Link to="/horarios">Horarios</Link></li>
                <li><Link to="/notas">Notas</Link></li>
              </>
            )}

            {/* PROFESOR: acceso limitado */}
            {rol === 1 && (
              <>
                <li><Link to="/estudiantes">Estudiantes</Link></li>
                <li><Link to="/horarios">Horarios</Link></li>
                <li><Link to="/notas">Notas</Link></li>
              </>
            )}

            {/* ESTUDIANTE: solo lo suyo */}
            {rol === 2 && (
              <>
                <li><Link to="/horarios">Horarios</Link></li>
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
