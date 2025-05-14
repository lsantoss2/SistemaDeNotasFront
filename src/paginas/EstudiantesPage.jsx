import React, { useEffect, useState } from 'react';
import '../estilos/Estudiantes.css';

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    id_estudiante: '',
    nombre: '',
    apellido: '',
    carnet: '',
    fecha_nacimiento: ''
  });

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  const obtenerEstudiantes = async () => {
    try {
      const res = await fetch('http://www.bakend-notas.somee.com/Estudiante/Buscar');
      const data = await res.json();
      setEstudiantes(data);
    } catch (error) {
      console.error('❌ Error al obtener estudiantes:', error);
    }
  };

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const url = modoEdicion
      ? '' // aquí iría tu endpoint PUT si lo tienes
      : 'http://www.bakend-notas.somee.com/Estudiante/Ingresar';
  
    // ✅ Asegurar formato yyyy-mm-dd aunque provenga como string "mm/dd/yyyy"
    const fecha = new Date(formulario.fecha_nacimiento);
    if (isNaN(fecha)) {
      alert('❌ Fecha inválida');
      return;
    }
  
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
  
    const fechaFormateada = `${yyyy}-${mm}-${dd}`;
  
    const datos = {
      ...formulario,
      fecha_nacimiento: fechaFormateada
    };
  
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
  
      const texto = await res.text();
  
      if (res.ok) {
        alert(modoEdicion ? '✅ Estudiante modificado' : '✅ Estudiante registrado');
        setFormulario({ id_estudiante: '', nombre: '', apellido: '', carnet: '', fecha_nacimiento: '' });
        setModoEdicion(false);
        setMostrarFormulario(false);
        obtenerEstudiantes();
      } else {
        alert('❌ Error: ' + texto);
      }
    } catch (error) {
      alert('❌ Error al guardar');
      console.error(error);
    }
  };
  
  

  const handleEditar = (est) => {
    setFormulario(est);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const estudiantesFiltrados = estudiantes.filter(est => {
    const texto = busqueda.toLowerCase();
    return (
      est.nombre.toLowerCase().includes(texto) ||
      est.apellido.toLowerCase().includes(texto) ||
      est.carnet.toLowerCase().includes(texto) ||
      est.fecha_nacimiento.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="contenedor-estudiantes">
      <div className="encabezado">
        <h2>Estudiantes Registrados</h2>
        <button className="btn-agregar" onClick={() => {
          setFormulario({ id_estudiante: '', nombre: '', apellido: '', carnet: '', fecha_nacimiento: '' });
          setModoEdicion(false);
          setMostrarFormulario(true);
        }}>+ Agregar Estudiante</button>
      </div>

      {/* Filtro */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, carnet o fecha..."
          className="input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {/* Tabla */}
      <table className="tabla-estudiantes">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Carnet</th>
            <th>Fecha Nacimiento</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {estudiantesFiltrados.map((est, idx) => (
            <tr key={est.id_estudiante}>
              <td>{idx + 1}</td>
              <td>{est.nombre}</td>
              <td>{est.apellido}</td>
              <td>{est.carnet}</td>
              <td>{est.fecha_nacimiento}</td>
              <td>
                <button className="btn-accion" onClick={() => handleEditar(est)}>✏️</button>
                <button className="btn-accion" onClick={() => handleEliminar(est.id_estudiante)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario */}
      {mostrarFormulario && (
        <form className="formulario-estudiante" onSubmit={handleSubmit}>
          <h3>{modoEdicion ? 'Editar Estudiante' : 'Registrar Estudiante'}</h3>
          <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} required />
          <input name="apellido" placeholder="Apellido" value={formulario.apellido} onChange={handleChange} required />
          <input name="carnet" placeholder="Carnet" value={formulario.carnet} onChange={handleChange} required />
          <input
            type="date"
            name="fecha_nacimiento"
            value={formulario.fecha_nacimiento}
            onChange={handleChange}
            required
          />
          <div className="acciones-form">
            <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
            <button type="button" className="cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
