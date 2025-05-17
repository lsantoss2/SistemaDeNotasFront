import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MisNotasPage() {
  const [notasPorEstudiante, setNotasPorEstudiante] = useState([]);
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

      const resEst = await fetch('http://www.bakend-notas.somee.com/Estudiante/Buscar');
      const estudiantes = await resEst.json();

      const resTutores = await fetch('http://www.bakend-notas.somee.com/Tutor/Buscar');
      const tutores = await resTutores.json();
      const tutor = tutores.find(t => t.id_usuario === usuario.id);

      if (!tutor) {
        alert('No se encontró tutor asociado.');
        return;
      }

      const estudiantesAsociados = estudiantes.filter(est =>
        est.tutores.some(t => t.id_tutor === tutor.id)
      );

      if (estudiantesAsociados.length === 0) {
        alert("No hay estudiantes asignados a este tutor.");
        return;
      }

      const resCursos = await fetch('http://www.bakend-notas.somee.com/Curso/Buscar');
      const cursosData = await resCursos.json();

      const resNotas = await fetch('http://www.bakend-notas.somee.com/Notas/Buscar');
      const todasNotas = await resNotas.json();

      const agrupadas = estudiantesAsociados.map(est => {
        const notasEst = todasNotas.filter(n => n.id_estudiante === est.id_estudiante);
        const notasConCurso = notasEst.map(nota => {
          const curso = cursosData.find(c => c.id_curso === nota.id_curso);
          return {
            ...nota,
            nombreCurso: curso?.nombre || 'Sin curso'
          };
        });

        return {
          estudiante: est,
          notas: notasConCurso
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

    seleccionados.forEach(({ estudiante, notas }) => {
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.text(`${estudiante.nombre}`, 14, y);
      y += 6;

      if (notas.length === 0) {
        doc.text('Este estudiante no tiene notas registradas.', 14, y);
        y += 10;
      } else {
        const columnas = ["Curso", "Unidad", "Punteo"];
        const filas = notas.map(n => [n.nombreCurso, n.unidad, n.nota]);

        autoTable(doc, {
          head: [columnas],
          body: filas,
          startY: y,
          margin: { left: 14, right: 14 },
          styles: { fontSize: 10 },
          theme: 'grid',
        });

        y = doc.lastAutoTable.finalY + 10;
      }
    });

    doc.save('ReporteNotas.pdf');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📘 Mis Notas</h2>

      <button
        onClick={exportarPDF}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        📄 Exportar PDF
      </button>

      {notasPorEstudiante.length === 0 ? (
        <p>No hay notas disponibles.</p>
      ) : (
        notasPorEstudiante.map(({ estudiante, notas }) => (
          <div key={estudiante.id_estudiante} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={estudiantesSeleccionados.includes(estudiante.id_estudiante)}
                onChange={() => toggleSeleccion(estudiante.id_estudiante)}
              />
              <h3 style={{ color: '#003366', margin: 0 }}>👨‍🎓 {estudiante.nombre}</h3>
            </label>

            {notas.length === 0 ? (
              <p>Este estudiante no tiene notas registradas.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Curso</th>
                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Unidad</th>
                    <th style={{ padding: '8px', border: '1px solid #ccc' }}>Punteo</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map(nota => (
                    <tr key={nota.id_nota}>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{nota.nombreCurso}</td>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{nota.unidad}</td>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{nota.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
}
