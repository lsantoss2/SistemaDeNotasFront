import React, { useEffect, useState } from 'react';

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [formulario, setFormulario] = useState({
    id_est: '',
    id_grado: '',
    id_ciclo: '',
    seccion: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    obtenerAsignaciones();
  }, []);

  const obtenerAsignaciones = async () => {
    try {
      const res = await fetch('http://www.bakend-notas.somee.com/Estudiante/Asignacion/Buscar');
      const data = await res.json();
      setAsignaciones(data);
    } catch (error) {
      alert('❌ Error al obtener asignaciones');
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleCancelar = () => {
    setFormulario({ id_est: '', id_grado: '', id_ciclo: '', seccion: '' });
    setModoEdicion(false);
    setIdEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = modoEdicion
      ? 'http://www.bakend-notas.somee.com/Estudiante/Asignacion/Modificar'
      : 'http://www.bakend-notas.somee.com/Estudiante/Asignacion/Ingresar';

    const payload = modoEdicion
      ? { id_estudiante_grado: idEditando, ...formulario }
      : formulario;

    try {
      const res = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      alert(modoEdicion ? '✅ Asignación modificada' : '✅ Asignación registrada');
      obtenerAsignaciones();
      handleCancelar();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleEditar = (asig) => {
    setFormulario({
      id_est: asig.id_estudiante,
      id_grado: asig.id_grado,
      id_ciclo: asig.id_ciclo,
      seccion: asig.seccion
    });
    setIdEditando(asig.id_estudiante_grado);
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta asignación?')) return;

    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Estudiante/Asignacion/Eliminar?id_asignacion=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar');

      alert('🗑️ Asignación eliminada');
      obtenerAsignaciones();
    } catch (error) {
      alert('❌ No se pudo eliminar');
      console.error(error);
    }
  };

  const asignacionesFiltradas = asignaciones.filter(a =>
    Object.values(a).some(val =>
      String(val).toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div className="contenedor">
      <h2>Asignaciones de Estudiantes</h2>

      <input
        type="text"
        placeholder="Buscar asignaciones..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ margin: '10px 0', width: '100%' }}
      />

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ID Estudiante</th>
            <th>ID Grado</th>
            <th>ID Ciclo</th>
            <th>Sección</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {asignacionesFiltradas.map((a, idx) => (
            <tr key={a.id_estudiante_grado}>
              <td>{idx + 1}</td>
              <td>{a.id_estudiante}</td>
              <td>{a.id_grado}</td>
              <td>{a.id_ciclo}</td>
              <td>{a.seccion}</td>
              <td>
                <button onClick={() => handleEditar(a)}>🛠️</button>
                <button onClick={() => handleEliminar(a.id_estudiante_grado)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{modoEdicion ? 'Editar Asignación' : 'Registrar Asignación'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="id_est"
          type="number"
          placeholder="ID Estudiante"
          value={formulario.id_est}
          onChange={handleChange}
        />
        <input
          name="id_grado"
          type="number"
          placeholder="ID Grado"
          value={formulario.id_grado}
          onChange={handleChange}
        />
        <input
          name="id_ciclo"
          type="number"
          placeholder="ID Ciclo"
          value={formulario.id_ciclo}
          onChange={handleChange}
        />
        <input
          name="seccion"
          placeholder="Sección"
          value={formulario.seccion}
          onChange={handleChange}
        />
        <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
        <button type="button" onClick={handleCancelar}>Cancelar</button>
      </form>
    </div>
  );
}
