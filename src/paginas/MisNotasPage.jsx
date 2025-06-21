import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MisNotasPage() {
  const [notasPorEstudiante, setNotasPorEstudiante] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);

  useEffect(() => {
    obtenerNotas();
  }, []);

  const obtenerNotas = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (!usuario) {
        alert("No hay usuario logueado.");
        return;
      }

      const resEst = await fetch('https://proxy-somee.onrender.com/api/Estudiante/Buscar');
      const estudiantes = await resEst.json();

      const resTutores = await fetch('https://proxy-somee.onrender.com/api/Tutor/Buscar');
      const tutores = await resTutores.json();
      const tutor = tutores.find(t => t.id_usuario === usuario.id);

      if (!tutor) {
        alert('No se encontró tutor asociado.');
        return;
      }

      const estudiantesAsociados = estudiantes.filter(est =>
        est.tutores.some(t => t.id_tutor === tutor.id)
      );

      const resCursos = await fetch('https://proxy-somee.onrender.com/api/Curso/Buscar');
      const cursosData = await resCursos.json();
      setCursos(cursosData);

      const resNotas = await fetch('https://proxy-somee.onrender.com/api/Notas/Buscar');
      const todasNotas = await resNotas.json();

      const agrupadas = estudiantesAsociados.map(est => {
        const notasEst = todasNotas.filter(n => n.id_estudiante === est.id_estudiante);
        const notasConCurso = notasEst.map(nota => {
          const curso = cursosData.find(c => c.id_curso === nota.id_curso);
          return {
            ...nota,
            nombreCurso: curso?.nombre || 'Sin curso',
            id_grado: curso?.id_grado || 0
          };
        });

        return {
          estudiante: est,
          notas: notasConCurso,
          id_grado: notasConCurso.length > 0 ? notasConCurso[0].id_grado : 0
        };
      });

      setNotasPorEstudiante(agrupadas);
    } catch (error) {
      console.error("❌ Error al cargar notas:", error);
      alert("Error al cargar notas.");
    }
  };

  const toggleSeleccion = (id_estudiante) => {
    setEstudiantesSeleccionados(prev =>
      prev.includes(id_estudiante)
        ? prev.filter(id => id !== id_estudiante)
        : [...prev, id_estudiante]
    );
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text('Reporte de Notas por Estudiante', 14, y);
    y += 10;

    const seleccionados = notasPorEstudiante.filter(({ estudiante }) =>
      estudiantesSeleccionados.includes(estudiante.id_estudiante)
    );

    if (seleccionados.length === 0) {
      alert("Selecciona al menos un estudiante.");
      return;
    }

    seleccionados.forEach(({ estudiante, notas, id_grado }) => {
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.text(`${estudiante.nombre}`, 14, y);
      y += 6;

      const cursosFiltrados = cursos.filter(c => c.id_grado === id_grado);
      const filas = cursosFiltrados.map(curso => {
        const notasCurso = notas.filter(n => n.id_curso === curso.id_curso);
        const porUnidad = {};
        for (let i = 1; i <= 4; i++) {
          const notaUnidad = notasCurso.find(n => n.unidad === i);
          porUnidad[i] = notaUnidad ? notaUnidad.nota : '—';
        }
        const promedio = calcularPromedio(porUnidad);
        return [
          curso.nombre,
          ...[1, 2, 3, 4].map(u => porUnidad[u]),
          promedio
        ];
      });

      autoTable(doc, {
        head: [['Curso', 'Unidad 1', 'Unidad 2', 'Unidad 3', 'Unidad 4', 'Promedio']],
        body: filas,
        startY: y,
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10 },
        theme: 'grid',
      });

      y = doc.lastAutoTable.finalY + 10;
    });

    doc.save('ReporteNotas.pdf');
  };

  const calcularPromedio = (notasPorUnidad) => {
    let suma = 0;
    let cantidad = 0;
    Object.values(notasPorUnidad).forEach(n => {
      if (n !== '—') {
        suma += parseFloat(n);
        cantidad++;
      }
    });
    return cantidad > 0 ? (suma / cantidad).toFixed(2) : '—';
  };

  return (
    <div className="contenedor">
      <h2>📘 Mis Notas</h2>
      <button onClick={exportarPDF} className="btn btn-primary" style={{ marginBottom: '20px' }}>
        📄 Exportar PDF
      </button>

      {notasPorEstudiante.length === 0 ? (
        <p>No hay notas disponibles.</p>
      ) : (
        notasPorEstudiante.map(({ estudiante, notas, id_grado }) => {
          const cursosFiltrados = cursos.filter(c => c.id_grado === id_grado);
          const notasAgrupadas = cursosFiltrados.map(curso => {
            const notasCurso = notas.filter(n => n.id_curso === curso.id_curso);
            const porUnidad = {};
            for (let i = 1; i <= 4; i++) {
              const notaUnidad = notasCurso.find(n => n.unidad === i);
              porUnidad[i] = notaUnidad ? notaUnidad.nota : '—';
            }
            const promedio = calcularPromedio(porUnidad);
            return { nombreCurso: curso.nombre, notasPorUnidad: porUnidad, promedio };
          });

          return (
            <div key={estudiante.id_estudiante} style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={estudiantesSeleccionados.includes(estudiante.id_estudiante)}
                  onChange={() => toggleSeleccion(estudiante.id_estudiante)}
                />
                <h3 style={{ margin: 0 }}>Notas de {estudiante.nombre} {estudiante.apellido}</h3>
              </label>
              <table className="table">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Unidad 1</th>
                    <th>Unidad 2</th>
                    <th>Unidad 3</th>
                    <th>Unidad 4</th>
                    <th>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {notasAgrupadas.map((curso, idx) => (
                    <tr key={idx}>
                      <td>{curso.nombreCurso}</td>
                      {[1, 2, 3, 4].map(unidad => {
                        const nota = curso.notasPorUnidad[unidad];
                        const esNotaBaja = nota !== '—' && parseFloat(nota) < 60;
                        return (
                          <td
                            key={unidad}
                            style={{
                              color: esNotaBaja ? 'red' : 'inherit'
                            }}
                          >
                            {nota}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          color: curso.promedio !== '—' && parseFloat(curso.promedio) < 60 ? 'red' : 'inherit'
                        }}
                      >
                        {curso.promedio}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
