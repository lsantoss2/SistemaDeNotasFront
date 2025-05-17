import React, { useEffect, useState } from 'react';
import '../estilos/Estudiantes.css';

export default function TutoresPage() {
  const [tutores, setTutores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    id: '',
    dpi: '',
    id_usuario: ''
  });

  useEffect(() => {
    obtenerTutores();
  }, []);

  const obtenerTutores = async () => {
    try {
      setLoading(true);
      const [tutoresRes, usuariosRes] = await Promise.all([
        fetch('http://www.bakend-notas.somee.com/Tutor/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Usuario/Buscar')
      ]);

      const tutoresData = await tutoresRes.json();
      const usuariosData = await usuariosRes.json();

      setTutores(tutoresData);
      setUsuarios(usuariosData);

      const combined = tutoresData.map(tutor => {
        const usuario = usuariosData.find(u => u.id_usuario === tutor.id_usuario) || {};
        return {
          ...tutor,
          usuario: usuario.usuario || 'N/A',
          nombre: usuario.nombre || 'N/A',
          apellido: usuario.apellido || 'N/A',
          rol: usuario.rol || 'N/A'
        };
      });

      setCombinedData(combined);
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
    } finally {
      setLoading(false);
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

    const query = new URLSearchParams({
      id: formulario.id,
      DPI: formulario.dpi,
      id_usuario: formulario.id_usuario
    });

    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Tutor/Modificar?${query.toString()}`, {
        method: 'PUT'
      });

      const texto = await res.text();

      if (res.ok) {
        alert('✅ Tutor modificado');
        setFormulario({ id: '', dpi: '', id_usuario: '' });
        setModoEdicion(false);
        setMostrarFormulario(false);
        obtenerTutores();
      } else {
        alert('❌ Error:\n' + texto);
      }
    } catch (error) {
      alert('❌ Error al modificar tutor');
      console.error(error);
    }
  };

  const handleEditar = (tutor) => {
    setFormulario({
      id: tutor.id,
      dpi: tutor.dpi,
      id_usuario: tutor.id_usuario
    });
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm(`¿Eliminar al tutor con ID ${id}?`)) return;

    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Tutor/Eliminar?id=${id}`, {
        method: 'DELETE'
      });

      const texto = await res.text();

      if (res.ok) {
        alert('🗑️ Tutor eliminado');
        obtenerTutores();
      } else {
        alert(`❌ No se pudo eliminar\n${texto}`);
      }
    } catch (error) {
      alert('❌ Error al eliminar tutor');
      console.error(error);
    }
  };

  const tutoresFiltrados = combinedData.filter((tutor) => {
    const texto = busqueda.toLowerCase();
    return (
      tutor.dpi.toLowerCase().includes(texto) ||
      tutor.id_usuario.toString().includes(texto) ||
      tutor.id.toString().includes(texto) ||
      (tutor.nombre && tutor.nombre.toLowerCase().includes(texto)) ||
      (tutor.apellido && tutor.apellido.toLowerCase().includes(texto)) ||
      (tutor.usuario && tutor.usuario.toLowerCase().includes(texto))
    );
  });

  const obtenerNombreRol = (codigo) => {
    switch (codigo) {
      case 0: return "Administrador";
      case 1: return "Profesor";
      case 2: return "Tutor";
      default: return "Desconocido";
    }
  };

  if (loading) {
    return <div className="contenedor-estudiantes">Cargando datos...</div>;
  }

  return (
    <div className="contenedor-estudiantes">
      <div className="encabezado">
        <h2>Tutores Registrados</h2>
        <button className="btn-agregar" onClick={() => {
          setFormulario({ id: '', dpi: '', id_usuario: '' });
          setModoEdicion(false);
          setMostrarFormulario(true);
        }}>+ Agregar Tutor</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por ID, DPI, ID Usuario, nombre, apellido o usuario..."
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
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Usuario</th>
            <th>DPI</th>
            <th>ID Usuario</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {tutoresFiltrados.map((tutor, idx) => (
            <tr key={tutor.id}>
              <td>{idx + 1}</td>
              <td>{tutor.id}</td>
              <td>{tutor.nombre}</td>
              <td>{tutor.apellido}</td>
              <td>{tutor.usuario}</td>
              <td>{tutor.dpi}</td>
              <td>{tutor.id_usuario}</td>
              <td>{obtenerNombreRol(tutor.rol)}</td>
              <td>
                <button className="btn-accion" onClick={() => handleEditar(tutor)}>✏️</button>
                <button className="btn-accion" onClick={() => handleEliminar(tutor.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarFormulario && (
        <form className="formulario-estudiante" onSubmit={handleSubmit}>
          <h3>{modoEdicion ? 'Editar Tutor' : 'Registrar Tutor'}</h3>
          <input name="id" placeholder="ID Tutor" value={formulario.id} onChange={handleChange} required />
          <input name="dpi" placeholder="DPI" value={formulario.dpi} onChange={handleChange} required />
          <input name="id_usuario" placeholder="ID Usuario" value={formulario.id_usuario} onChange={handleChange} required />
          <div className="acciones-form">
            <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
            <button type="button" className="cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
