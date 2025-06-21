import React, { useEffect, useState } from 'react';
import '../estilos/NotasPage.css';

function FormularioNota({ onSubmit, onCancel, notaInicial = {} }) {
  const [formulario, setFormulario] = useState({
    id_nota: notaInicial.id_nota || '',
    id_estudiante: notaInicial.id_estudiante || '',
    id_curso: notaInicial.id_curso || '',
    nota: notaInicial.nota || '',
    unidad: notaInicial.unidad || '',
    grado: notaInicial.grado || '',
    ciclo: 3 // Ciclo fijo
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formulario);
  };

  return (
    <div className="modal">
      <div className="modal-contenido">
        <h3>{notaInicial.id_nota ? 'Editar Nota' : 'Asignar Nota'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>ID Estudiante:</label>
              <input type="number" name="id_estudiante" value={formulario.id_estudiante} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>ID Curso:</label>
              <input type="number" name="id_curso" value={formulario.id_curso} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nota:</label>
              <input type="number" name="nota" value={formulario.nota} onChange={handleChange} min="0" max="100" step="0.01" required />
            </div>
            <div className="form-group">
              <label>Unidad:</label>
              <input type="number" name="unidad" value={formulario.unidad} onChange={handleChange} min="1" max="4" required />
            </div>
            <div className="form-group">
              <label>Grado:</label>
              <input type="number" name="grado" value={formulario.grado} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Ciclo:</label>
              <input type="number" name="ciclo" value={formulario.ciclo} readOnly />
            </div>
            {notaInicial.id_nota && (
              <div className="form-group">
                <label>ID Nota:</label>
                <input type="number" name="id_nota" value={formulario.id_nota} readOnly />
              </div>
            )}
          </div>
          <div className="acciones-modal">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotasPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [modalEstudiante, setModalEstudiante] = useState(null);
  const [formularioNota, setFormularioNota] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [gradoFiltro, setGradoFiltro] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resEstudiantes, resCursos, resNotas, resAsignaciones] = await Promise.all([
        fetch('https://proxy-somee.onrender.com/api/Estudiante/Buscar'),
        fetch('https://proxy-somee.onrender.com/api/Curso/Buscar'),
        fetch('https://proxy-somee.onrender.com/api/Notas/Buscar'),
        fetch('https://proxy-somee.onrender.com/api/Estudiante/Estudiante/Grado/Buscar')
      ]);

      setEstudiantes(await resEstudiantes.json());
      setCursos(await resCursos.json());
      setNotas(await resNotas.json());
      setAsignaciones(await resAsignaciones.json());
    } catch (error) {
      alert('❌ Error al cargar datos');
      console.error(error);
    }
  };

  const abrirModalEstudiante = (estudiante) => {
    setModalEstudiante(estudiante);
  };

  const cerrarModalEstudiante = () => {
    setModalEstudiante(null);
  };

  const abrirFormularioNota = (id_est, id_curso, unidad) => {
    const notaObj = notas.find(n => n.id_estudiante === id_est && n.id_curso === id_curso && n.unidad === unidad);
    const relacion = asignaciones.find(a => a.id_estudiante === id_est);
    const grado = relacion ? relacion.id_grado : 0;
    setFormularioNota({
      id_nota: notaObj ? notaObj.id_nota : '',
      id_estudiante: id_est,
      id_curso: id_curso,
      nota: notaObj ? notaObj.nota : '',
      unidad: unidad,
      grado: grado,
      ciclo: 3 // Ciclo fijo
    });
    setModoEdicion(!!notaObj);
  };

  const cerrarFormularioNota = () => {
    setFormularioNota(null);
    setModoEdicion(false);
  };

  const handleGuardarNota = async (datos) => {
    let payload = {};
    let url = '';

    if (modoEdicion) {
      payload = {
        id_nota: parseInt(datos.id_nota),
        id_estudiante: parseInt(datos.id_estudiante),
        id_curso: parseInt(datos.id_curso),
        nota: parseFloat(datos.nota),
        unidad: parseInt(datos.unidad),
        id_ciclo: 3 // Ciclo fijo
      };
      url = `https://proxy-somee.onrender.com/api/Notas/Modificar?id_nota=${datos.id_nota}`;
    } else {
      payload = {
        id_estudiante: parseInt(datos.id_estudiante),
        id_curso: parseInt(datos.id_curso),
        nota: parseFloat(datos.nota),
        unidad: parseInt(datos.unidad),
        grado: parseInt(datos.grado),
        ciclo: 3 // Ciclo fijo
      };
      url = 'https://proxy-somee.onrender.com/api/Notas/Ingresar';
    }

    try {
      const res = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());
      alert(modoEdicion ? '✅ Nota actualizada' : '✅ Nota registrada');
      cerrarFormularioNota();
      cargarDatos();
    } catch (err) {
      alert('❌ Error al guardar la nota');
      console.error(err);
    }
  };

  const obtenerNotasPorCurso = (id_est, id_curso) => {
    const notasCurso = notas.filter(n => n.id_estudiante === id_est && n.id_curso === id_curso);
    const porUnidad = {};
    for (let i = 1; i <= 4; i++) {
      const notaUnidad = notasCurso.find(n => n.unidad === i);
      porUnidad[i] = notaUnidad ? notaUnidad.nota : '—';
    }
    return porUnidad;
  };

  const gradoALetras = (numero) => {
    const grados = {
      1: 'Primero',
      2: 'Segundo',
      3: 'Tercero',
      4: 'Cuarto',
      5: 'Quinto',
      6: 'Sexto',
      7: 'Séptimo'
    };
    return grados[numero] || 'N/A';
  };

  const filtrarEstudiantes = estudiantes.filter(est => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = (
      est.nombre.toLowerCase().includes(texto) ||
      est.apellido.toLowerCase().includes(texto) ||
      est.carnet.toString().includes(texto)
    );
    const relacion = asignaciones.find(a => a.id_estudiante === est.id_estudiante);
    const gradoEstudiante = relacion ? relacion.id_grado : null;
    const coincideGrado = gradoFiltro ? (gradoEstudiante === parseInt(gradoFiltro)) : true;
    return coincideBusqueda && coincideGrado;
  });

  return (
    <div className="contenedor">
      <h2>Gestión de Notas</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, carnet..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={gradoFiltro} onChange={(e) => setGradoFiltro(e.target.value)}>
          <option value="">Todos los grados</option>
          {[1,2,3,4,5,6,7].map(g => (
            <option key={g} value={g}>{gradoALetras(g)}</option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Carnet</th>
            <th>Grado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtrarEstudiantes.map((est, idx) => {
            const relacion = asignaciones.find(a => a.id_estudiante === est.id_estudiante);
            const gradoEstudiante = relacion ? gradoALetras(relacion.id_grado) : 'N/A';
            return (
              <tr key={est.id_estudiante}>
                <td>{idx + 1}</td>
                <td>{est.nombre} {est.apellido}</td>
                <td>{est.carnet}</td>
                <td>{gradoEstudiante}</td>
                <td><button onClick={() => abrirModalEstudiante(est)}>🔍 Ver Detalles</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalEstudiante && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Notas de {modalEstudiante.nombre} {modalEstudiante.apellido}</h3>
            <table className="tabla-notas-modal">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Unidad 1</th>
                  <th>Unidad 2</th>
                  <th>Unidad 3</th>
                  <th>Unidad 4</th>
                </tr>
              </thead>
              <tbody>
                {cursos
                  .filter(curso => {
                    const relacion = asignaciones.find(a => a.id_estudiante === modalEstudiante.id_estudiante);
                    return curso.id_grado === (relacion ? relacion.id_grado : null);
                  })
                  .map(curso => {
                    const notasPorUnidad = obtenerNotasPorCurso(modalEstudiante.id_estudiante, curso.id_curso);
                    return (
                      <tr key={curso.id_curso}>
                        <td>{curso.nombre}</td>
                        {[1, 2, 3, 4].map(unidad => (
                          <td
                            key={unidad}
                            onDoubleClick={() => abrirFormularioNota(modalEstudiante.id_estudiante, curso.id_curso, unidad)}
                            style={{ cursor: 'pointer' }}
                          >
                            {notasPorUnidad[unidad]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="acciones-modal">
              <button onClick={cerrarModalEstudiante}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {formularioNota && (
        <FormularioNota
          notaInicial={formularioNota}
          onSubmit={handleGuardarNota}
          onCancel={cerrarFormularioNota}
        />
      )}
    </div>
  );
}
