import React, { useState } from 'react';
import '../estilos/Estudiantes.css';

const estudiantesMock = [
  {
    id: 1,
    nombre: 'Shahrukh Khan',
    rol: '1',
    email: 'sharukh@inilabs.com',
    estado: true,
    foto: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    nombre: 'Ranbeer Singh',
    rol: '2',
    email: 'ranbeer@inilabs.net',
    estado: true,
    foto: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: 3,
    nombre: 'Abu Musa',
    rol: '3',
    email: 'musa@inilabs.com',
    estado: false,
    foto: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
];

export default function EstudiantesPage() {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = estudiantesMock.filter((est) =>
    est.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="estudiantes-container">
      <h2>Estudiante</h2>

      <div className="top-bar">
        <button className="btn-agregar">+ Agrega un Estudiante</button>
        <input
          type="text"
          className="buscador"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <table className="tabla-estudiantes">
        <thead>
          <tr>
            <th>#</th>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((e, idx) => (
            <tr key={e.id}>
              <td>{idx + 1}</td>
              <td><img src={e.foto} alt="foto" className="foto-est" /></td>
              <td>{e.nombre}</td>
              <td>{e.rol}</td>
              <td>{e.email}</td>
              <td>
                <span className={`estado ${e.estado ? 'on' : 'off'}`}>
                  {e.estado ? 'ON' : 'OFF'}
                </span>
              </td>
              <td>
                <button className="btn-ver">👁</button>
                <button className="btn-editar">✏</button>
                <button className="btn-eliminar">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
