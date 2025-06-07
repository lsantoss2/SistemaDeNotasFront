import React, { useEffect, useState } from 'react';
import '../estilos/Estudiantes.css';

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    id_estudiante: '',
    nombre: '',
    apellido: '',
    carnet: '',
    fecha_nacimiento: '',
    id_tutor: '',
    parentesco: ''
  });

  useEffect(() => {
    obtenerEstudiantes();
    obtenerTutoresConUsuarios();
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

  const obtenerTutoresConUsuarios = async () => {
    try {
      const [resTutores, resUsuarios] = await Promise.all([
        fetch('http://www.bakend-notas.somee.com/Tutor/Buscar'),
        fetch('http://www.bakend-notas.somee.com/Usuario/Buscar')
      ]);

      const dataTutores = await resTutores.json();
      const dataUsuarios = await resUsuarios.json();
      setUsuarios(dataUsuarios);

      const tutoresCombinados = dataTutores.map(tutor => {
        const usuario = dataUsuarios.find(u => u.id_usuario === tutor.id_usuario) || {};
        return {
          ...tutor,
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          usuario: usuario.usuario || ''
        };
      });

      setTutores(tutoresCombinados);
    } catch (error) {
      console.error('❌ Error al obtener tutores:', error);
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
      id_estudiante: formulario.id_estudiante,
      nombre: formulario.nombre,
      apellido: formulario.apellido,
      carnet: formulario.carnet,
      fecha_nacimiento: fechaFormateada,
      id_tutor: parseInt(formulario.id_tutor),
      parentesco: formulario.parentesco
    };

    const url = modoEdicion
      ? 'http://www.bakend-notas.somee.com/Estudiante/Modificar'
      : 'http://www.bakend-notas.somee.com/Estudiante/Ingresar';

    const metodo = modoEdicion ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const texto = await res.text();

      if (res.ok) {
        alert(modoEdicion ? '✅ Estudiante modificado' : '✅ Estudiante registrado');
        setFormulario({
          id_estudiante: '',
          nombre: '',
          apellido: '',
          carnet: '',
          fecha_nacimiento: '',
          id_tutor: '',
          parentesco: ''
        });
        setModoEdicion(false);
        setMostrarFormulario(false);
        obtenerEstudiantes();
      } else {
        alert('❌ Error:\n' + texto);
      }
    } catch (error) {
      alert('❌ Error al guardar');
      console.error(error);
    }
  };

  const handleEditar = (est) => {
    setFormulario({
      id_estudiante: est.id_estudiante,
      nombre: est.nombre,
      apellido: est.apellido,
      carnet: est.carnet,
      fecha_nacimiento: est.fecha_nacimiento,
      id_tutor: est.tutores?.[0]?.id_tutor || '',
      parentesco: est.tutores?.[0]?.parentesco || ''
    });
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm(`¿Eliminar al estudiante con ID ${id}?`)) return;

    try {
      // Eliminar relaciones en TutorEstudiante
      const resTutorEstudiante = await fetch(
        `http://www.bakend-notas.somee.com/TutorEstudiante/EliminarPorEstudiante?id_estudiante=${id}`,
        { method: 'DELETE' }
      );

      if (!resTutorEstudiante.ok) {
        const texto = await resTutorEstudiante.text();
        console.error(`❌ Error al eliminar relación TutorEstudiante: ${texto}`);
      }

      // Eliminar relaciones en Notas
      const resNotas = await fetch(
        `http://www.bakend-notas.somee.com/Notas/EliminarPorEstudiante?id_estudiante=${id}`,
        { method: 'DELETE' }
      );

      if (!resNotas.ok) {
        const texto = await resNotas.text();
        console.error(`❌ Error al eliminar relación Notas: ${texto}`);
      }

      // Finalmente, eliminar el estudiante
      const resEstudiante = await fetch(
        `http://www.bakend-notas.somee.com/Estudiante/Eliminar?id_estudiante=${id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const texto = await resEstudiante.text();

      if (resEstudiante.ok) {
        alert('🗑️ Estudiante eliminado');
        obtenerEstudiantes();
      } else {
        console.error(`❌ Error al eliminar estudiante: ${texto}`);
        alert(`❌ No se pudo eliminar\n${texto}`);
      }
    } catch (error) {
      console.error('❌ Error general al eliminar:', error);
      alert('❌ Error general al eliminar');
    }
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
          setFormulario({
            id_estudiante: '',
            nombre: '',
            apellido: '',
            carnet: '',
            fecha_nacimiento: '',
            id_tutor: '',
            parentesco: ''
          });
          setModoEdicion(false);
          setMostrarFormulario(true);
        }}>+ Agregar Estudiante</button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre, apellido, carnet o fecha..."
        className="input"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />

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

      {mostrarFormulario && (
        <form className="formulario-estudiante" onSubmit={handleSubmit}>
          <h3>{modoEdicion ? 'Editar Estudiante' : 'Registrar Estudiante'}</h3>

          <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} required />
          <input name="apellido" placeholder="Apellido" value={formulario.apellido} onChange={handleChange} required />
          <input name="carnet" placeholder="Carnet" value={formulario.carnet} onChange={handleChange} required />
          <input type="date" name="fecha_nacimiento" value={formulario.fecha_nacimiento} onChange={handleChange} required />

          <select name="id_tutor" value={formulario.id_tutor} onChange={handleChange} required>
            <option value="">Seleccionar tutor</option>
            {tutores.map(t => (
              <option key={t.id} value={t.id}>
                {t.nombre} {t.apellido}
              </option>
            ))}
          </select>

          <select
            name="parentesco"
            value={
              ['mamá', 'papá', 'tío', 'tía', 'abuelo', 'abuela', 'hermano', 'hermana'].includes(formulario.parentesco)
                ? formulario.parentesco
                : 'otro'
            }
            onChange={(e) => {
              if (e.target.value === 'otro') {
                setFormulario({ ...formulario, parentesco: '' });
              } else {
                setFormulario({ ...formulario, parentesco: e.target.value });
              }
            }}
            required
          >
            <option value="">Seleccionar parentesco</option>
            <option value="mamá">Mamá</option>
            <option value="papá">Papá</option>
            <option value="tío">Tío</option>
            <option value="tía">Tía</option>
            <option value="abuelo">Abuelo</option>
            <option value="abuela">Abuela</option>
            <option value="hermano">Hermano</option>
            <option value="hermana">Hermana</option>
            <option value="otro">Otro</option>
          </select>

          {formulario.parentesco === '' && (
            <input
              name="parentesco"
              placeholder="Especifique el parentesco"
              value={formulario.parentesco}
              onChange={handleChange}
              required
            />
          )}

          <div className="acciones-form">
            <button type="submit">{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</button>
            <button type="button" className="cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
