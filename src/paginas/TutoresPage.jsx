import React, { useEffect, useState } from 'react';
import '../estilos/Estudiantes.css'; // Se reutiliza el estilo existente

export default function TutoresPage() {
  const [tutores, setTutores] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    obtenerTutores();
  }, []);

  const obtenerTutores = async () => {
    try {
      const res = await fetch('http://www.bakend-notas.somee.com/Tutor/Buscar');
      const data = await res.json();
      setTutores(data);
    } catch (error) {
      console.error('❌ Error al obtener tutores:', error);
    }
  };

  const tutoresFiltrados = tutores.filter(tutor => {
    const texto = busqueda.toLowerCase();
    return (
      tutor.dpi.toLowerCase().includes(texto) ||
      tutor.id_usuario.toString().includes(texto) ||
      tutor.id.toString().includes(texto)
    );
  });

  return (
    <div className="contenedor-estudiantes">
      <div className="encabezado">
        <h2>Tutores Registrados</h2>
        <button className="btn-agregar">+ Agregar Tutor</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por ID, DPI o ID Usuario..."
          className="input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <table className="tabla-estudiantes">
        <thead>
          <tr>
            <th>#</th>
            <th>ID Tutor</th>
            <th>DPI</th>
            <th>ID Usuario</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {tutoresFiltrados.map((tutor, idx) => (
            <tr key={tutor.id}>
              <td>{idx + 1}</td>
              <td>{tutor.id}</td>
              <td>{tutor.dpi}</td>
              <td>{tutor.id_usuario}</td>
              <td>
                <button className="btn-accion">✏️</button>
                <button className="btn-accion">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
