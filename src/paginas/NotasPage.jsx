import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function NotasPage() {
  const [allNotas, setAllNotas] = useState([]);
  const [filteredNotas, setFilteredNotas] = useState([]);
  const [filtros, setFiltros] = useState({
    id_curso: '',
    id_estudiante: '',
    unidad: '',
    id_ciclo: ''
  });
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [ciclos, setCiclos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formulario, setFormulario] = useState({
    id_curso: '',
    id_estudiante: '',
    nota: '',
    unidad: '',
    grado: '',
    ciclo: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cursosRes, estudiantesRes, ciclosRes, gradosRes, notasRes] = await Promise.all([
          fetch('http://www.bakend-notas.somee.com/Curso/Buscar'),
          fetch('http://www.bakend-notas.somee.com/Estudiante/Buscar'),
          fetch('http://www.bakend-notas.somee.com/Ciclo/Buscar'),
          fetch('http://www.bakend-notas.somee.com/Grado/Buscar'),
          fetch('http://www.bakend-notas.somee.com/Notas/Buscar')
        ]);

        const cursosData = await cursosRes.json();
        const estudiantesData = await estudiantesRes.json();
        const ciclosData = await ciclosRes.json();
        const gradosData = await gradosRes.json();
        const notasData = await notasRes.json();

        setCursos(cursosData);
        setEstudiantes(estudiantesData);
        setCiclos(ciclosData);
        setGrados(gradosData);
        setAllNotas(notasData);
        setFilteredNotas(notasData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert("❌ Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filtros, allNotas]);

  const applyFilters = () => {
    const filtered = allNotas.filter(nota => {
      if (filtros.id_curso && nota.id_curso !== parseInt(filtros.id_curso)) return false;
      if (filtros.id_estudiante && nota.id_estudiante !== parseInt(filtros.id_estudiante)) return false;
      if (filtros.unidad && nota.unidad !== parseInt(filtros.unidad)) return false;
      if (filtros.id_ciclo && nota.ciclo !== parseInt(filtros.id_ciclo)) return false;
      return true;
    });
    setFilteredNotas(filtered);
  };

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const notaData = {
      id_curso: parseInt(formulario.id_curso),
      id_estudiante: parseInt(formulario.id_estudiante),
      nota: parseFloat(formulario.nota),
      unidad: parseInt(formulario.unidad),
      grado: parseInt(formulario.grado),
      ciclo: parseInt(formulario.ciclo)
    };

    const url = modoEdicion
      ? `http://www.bakend-notas.somee.com/Notas/Modificar?id_nota=${idEditando}`
      : 'http://www.bakend-notas.somee.com/Notas/Ingresar';

    try {
      const res = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notaData)
      });

      if (res.ok) {
        alert(modoEdicion ? '✅ Nota actualizada' : '✅ Nota registrada');
        resetForm();
        const notasRes = await fetch('http://www.bakend-notas.somee.com/Notas/Buscar');
        const notasData = await notasRes.json();
        setAllNotas(notasData);
      } else {
        const errorText = await res.text();
        alert(`❌ Error al registrar/modificar nota: ${errorText}`);
      }
    } catch (error) {
      alert("❌ Error del servidor");
      console.error(error);
    }
  };

  const handleEditar = (nota) => {
    setFormulario({
      id_curso: nota.id_curso.toString(),
      id_estudiante: nota.id_estudiante.toString(),
      nota: nota.nota.toString(),
      unidad: nota.unidad.toString(),
      grado: nota.grado.toString(),
      ciclo: nota.ciclo.toString()
    });
    setIdEditando(nota.id_nota);
    setModoEdicion(true);
  };

  const handleEliminar = async (id_nota) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    try {
      const res = await fetch(`http://www.bakend-notas.somee.com/Notas/Eliminar?id_nota=${id_nota}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('🗑️ Nota eliminada');
        const notasRes = await fetch('http://www.bakend-notas.somee.com/Notas/Buscar');
        const notasData = await notasRes.json();
        setAllNotas(notasData);
      } else {
        alert('❌ No se pudo eliminar');
      }
    } catch (error) {
      alert('❌ Error del servidor');
    }
  };

  const resetForm = () => {
    setFormulario({
      id_curso: '',
      id_estudiante: '',
      nota: '',
      unidad: '',
      grado: '',
      ciclo: ''
    });
    setModoEdicion(false);
    setIdEditando(null);
  };

  const getNombreCurso = (id) => {
    const curso = cursos.find(c => c.id_curso === id);
    return curso ? curso.nombre : 'N/A';
  };

  const getNombreEstudiante = (id) => {
    const estudiante = estudiantes.find(e => e.id_estudiante === id);
    return estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : 'N/A';
  };

  const getNombreGrado = (id) => {
    const grado = grados.find(g => g.id === id);
    return grado ? grado.nombre : 'N/A';
  };

  const getCiclo = (id) => {
    const ciclo = ciclos.find(c => c.id_ciclo === id);
    return ciclo ? ciclo.ciclo : 'N/A';
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Notas", 14, 15);

    const tableColumn = ["#", "Curso", "Estudiante", "Nota", "Unidad", "Grado", "Ciclo"];
    const tableRows = filteredNotas.map((n, i) => [
      i + 1,
      getNombreCurso(n.id_curso),
      getNombreEstudiante(n.id_estudiante),
      n.nota,
      n.unidad,
      getNombreGrado(n.grado),
      getCiclo(n.ciclo)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("notas_reporte.pdf");
  };

  return (
    <div className="container">
      <h2>Notas de Clases</h2>

      <div className="filters">
        <h3>Filtrar Notas</h3>
        <div className="filter-fields">
          <select name="id_curso" value={filtros.id_curso} onChange={handleFilterChange}>
            <option value="">Todos los cursos</option>
            {cursos.map(curso => (
              <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre}</option>
            ))}
          </select>

          <select name="id_estudiante" value={filtros.id_estudiante} onChange={handleFilterChange}>
            <option value="">Todos los estudiantes</option>
            {estudiantes.map(est => (
              <option key={est.id_estudiante} value={est.id_estudiante}>
                {est.nombre} {est.apellido}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="unidad"
            placeholder="Unidad"
            value={filtros.unidad}
            onChange={handleFilterChange}
            min="1"
          />

          <select name="id_ciclo" value={filtros.id_ciclo} onChange={handleFilterChange}>
            <option value="">Todos los ciclos</option>
            {ciclos.map(ciclo => (
              <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>{ciclo.ciclo}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={exportarPDF} style={{ margin: '10px 0' }}>
        📄 Exportar PDF
      </button>

      <table className="tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>Curso</th>
            <th>Estudiante</th>
            <th>Nota</th>
            <th>Unidad</th>
            <th>Grado</th>
            <th>Ciclo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotas.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                {loading ? 'Cargando...' : 'No hay notas disponibles. Use los filtros para buscar.'}
              </td>
            </tr>
          ) : (
            filteredNotas.map((n, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{getNombreCurso(n.id_curso)}</td>
                <td>{getNombreEstudiante(n.id_estudiante)}</td>
                <td>{n.nota}</td>
                <td>{n.unidad}</td>
                <td>{getNombreGrado(n.grado)}</td>
                <td>{getCiclo(n.ciclo)}</td>
                <td>
                  <button onClick={() => handleEditar(n)}>✏️</button>
                  <button onClick={() => handleEliminar(n.id_nota)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3>{modoEdicion ? 'Editar Nota' : 'Registrar Nota'}</h3>
      <form onSubmit={handleSubmit}>
        <select name="id_curso" value={formulario.id_curso} onChange={handleChange} required>
          <option value="">Seleccionar curso</option>
          {cursos.map(curso => (
            <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre}</option>
          ))}
        </select>

        <select name="id_estudiante" value={formulario.id_estudiante} onChange={handleChange} required>
          <option value="">Seleccionar estudiante</option>
          {estudiantes.map(est => (
            <option key={est.id_estudiante} value={est.id_estudiante}>
              {est.nombre} {est.apellido}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="nota"
          placeholder="Nota (0-100)"
          value={formulario.nota}
          onChange={handleChange}
          required
          min="0"
          max="100"
          step="0.01"
        />

        <input
          type="number"
          name="unidad"
          placeholder="Unidad"
          value={formulario.unidad}
          onChange={handleChange}
          required
          min="1"
        />

        <select name="grado" value={formulario.grado} onChange={handleChange} required>
          <option value="">Seleccionar grado</option>
          {grados.map(grado => (
            <option key={grado.id} value={grado.id}>{grado.nombre}</option>
          ))}
        </select>

        <select name="ciclo" value={formulario.ciclo} onChange={handleChange} required>
          <option value="">Seleccionar ciclo</option>
          {ciclos.map(ciclo => (
            <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>{ciclo.ciclo}</option>
          ))}
        </select>

        <button type="submit">{modoEdicion ? 'Actualizar' : 'Registrar'}</button>
        {modoEdicion && <button type="button" onClick={resetForm}>Cancelar</button>}
      </form>
    </div>
  );
}
