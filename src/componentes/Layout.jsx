import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../estilos/layout.css';

export default function Layout() {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="logo">Sistema</div>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/estudiantes">Estudiantes</Link></li>
            <li><Link to="/maestros">Maestros</Link></li>
            <li><Link to="/padres">Padres</Link></li>
            <li><Link to="/eventos">Eventos</Link></li>
            <li><Link to="/examenes">Exámenes</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
