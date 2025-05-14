import React, { useEffect, useState } from 'react';
import '../estilos/UsuariosPage.css';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState({
    id_usuario: '',
    usuario: '',
    nombre: '',
    apellido: '',
    pass: '',
    rol: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch('http://www.bakend-notas.somee.com/Usuario/Buscar');
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = modoEdicion
      ? 'http://www.bakend-notas.somee.com/Usuario/Modificar'
      : 'http://www.bakend-notas.somee.com/Usuario/Registro';

    const metodo = modoEdicion ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const texto = await res.text();
      console.log("📝 Respuesta:", texto);

      if (res.ok) {
        alert(modoEdicion ? '✅ Usuario modificado' : '✅ Usuario creado');
        setFormulario({ id_usuario: '', usuario: '', nombre: '', apellido: '', pass: '', rol: '' });
        setModoEdicion(false);
        setUsuarioEditando(null);
        setMostrarFormulario(false);
        obtenerUsuarios();
      } else {
        alert(`❌ Error en la operación\n${texto}`);
      }
    } catch (error) {
      alert('❌ Error de conexión');
      console.error(error);
    }
  };

  const handleEditar = (user) => {
    setFormulario({
      id_usuario: user.id_usuario,
      usuario: user.usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      pass: user.pass,
      rol: user.rol
    });
    setModoEdicion(true);
    setUsuarioEditando(user.usuario);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id_usuario) => {
    if (!id_usuario || id_usuario === undefined) {
      alert("❌ ID no válido para eliminación");
      return;
    }

    if (!confirm(`¿Eliminar al usuario con ID ${id_usuario}?`)) return;

    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Usuario/Eliminar?id_user=${id_usuario}`, {
        method: 'DELETE'
      });

      const respuestaTexto = await res.text();
      if (res.ok) {
        alert('🗑️ Usuario eliminado');
        obtenerUsuarios();
      } else {
        alert(`❌ No se pudo eliminar\n${respuestaTexto}`);
      }
    } catch (error) {
      alert('❌ Error al eliminar');
      console.error(error);
    }
  };

  const obtenerNombreRol = (codigo) => {
    switch (codigo) {
      case 0: return "Administrador";
      case 1: return "Profesor";
      case 2: return "Alumno";
      default: return "Desconocido";
    }
  };

  // 🔎 Filtro por múltiples columnas
  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = filtroTexto.toLowerCase();
    const coincide =
      u.nombre.toLowerCase().includes(texto) ||
      u.apellido.toLowerCase().includes(texto) ||
      u.usuario.toLowerCase().includes(texto) ||
      obtenerNombreRol(u.rol).toLowerCase().includes(texto);

    const coincideRol = filtroRol === '' || String(u.rol) === filtroRol;

    return coincide && coincideRol;
  });

  return (
    <div className="usuarios-page">
      <div className="encabezado">
        <h2>Usuarios Registrados</h2>
        <button className="btn-agregar" onClick={() => {
          setFormulario({ id_usuario: '', usuario: '', nombre: '', apellido: '', pass: '', rol: '' });
          setModoEdicion(false);
          setMostrarFormulario(true);
        }}>+ Agregar Usuario</button>
      </div>

      {/* Filtros */}
      <div className="filtros-usuarios" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, usuario o rol..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          className="input"
          style={{ flex: 1 }}
        />
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="input">
          <option value="">Todos los roles</option>
          <option value="0">Administrador</option>
          <option value="1">Profesor</option>
          <option value="2">Alumno</option>
        </select>
      </div>

      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((u, idx) => (
            <tr key={u.id_usuario}>
              <td>{idx + 1}</td>
              <td>{u.nombre}</td>
              <td>{u.apellido}</td>
              <td>{u.usuario}</td>
              <td>{obtenerNombreRol(u.rol)}</td>
              <td>
                <button className="btn-accion" onClick={() => handleEditar(u)}>✏️</button>
                <button className="btn-accion" onClick={() => handleEliminar(u.id_usuario)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarFormulario && (
        <form className="formulario-usuario" onSubmit={handleSubmit}>
          <h3>{modoEdicion ? 'Editar Usuario' : 'Registrar Usuario'}</h3>
          <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} required />
          <input name="apellido" placeholder="Apellido" value={formulario.apellido} onChange={handleChange} required />
          <input name="usuario" placeholder="Usuario" value={formulario.usuario} onChange={handleChange} required disabled={modoEdicion} />
          <input type="password" name="pass" placeholder="Contraseña" value={formulario.pass} onChange={handleChange} required />
          <select name="rol" value={formulario.rol} onChange={handleChange} required>
            <option value="">Seleccionar rol</option>
            <option value="0">Administrador</option>
            <option value="1">Profesor</option>
            <option value="2">Alumno</option>
          </select>
          <div className="acciones-form">
            <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
            <button type="button" className="cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
