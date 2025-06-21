import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MisNotasPage() {
  const [notasPorEstudiante, setNotasPorEstudiante] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [gradosEstudiantes, setGradosEstudiantes] = useState([]);
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

      const [
        resEst, resTutores, resCursos, resNotas, resGradoEst
      ] = await Promise.all([
        fetch('https://proxy-somee.onrender.com/api/Estudiante/Buscar'),
        fetch('https://proxy-somee.onrender.com/api/Tutor/Buscar'),
        fetch('https://proxy-somee.onrender.com/api/Curso/Buscar'),
        fetch('https://proxy-somee.onrender.com/api/Notas/Buscar'),
        fetch('https://proxy-somee.onrender.com/api/Estudiante/Estudiante/Grado/Buscar2')
      ]);

      const [
        estudiantes, tutores, cursosData, todasNotas, gradosData
      ] = await Promise.all([
        resEst.json(), resTutores.json(), resCursos.json(),
        resNotas.json(), resGradoEst.json()
      ]);

      setCursos(cursosData);
      setGradosEstudiantes(gradosData);

      const tutor = tutores.find(t => t.id_usuario === usuario.id);
      if (!tutor) return alert('No se encontró tutor asociado.');

      const estudiantesAsociados = estudiantes.filter(est =>
        est.tutores.some(t => t.id_tutor === tutor.id)
      );

      localStorage.setItem('estudiantes_asignados', JSON.stringify(estudiantesAsociados));

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
    let y = 20;
    const fechaHoy = new Date().toLocaleDateString('es-GT');

    const seleccionados = notasPorEstudiante.filter(({ estudiante }) =>
      estudiantesSeleccionados.includes(estudiante.id_estudiante)
    );

    if (seleccionados.length === 0) {
      alert("Selecciona al menos un estudiante.");
      return;
    }

    seleccionados.forEach(({ estudiante, notas }) => {
      const gradoEst = gradosEstudiantes.find(g => g.carnet === estudiante.carnet);

      console.log("📌 Estudiante:", estudiante);
      console.log("📚 Datos desde EstudianteGrado Buscar2:", gradoEst);

      const nombreGrado = gradoEst?.grado || 'N/A';
      const nombreCiclo = gradoEst?.ciclo?.toString() || 'N/A';

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('COLEGIO BELÉN', 105, y, { align: 'center' });
      y += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre del alumno: ${estudiante.nombre} ${estudiante.apellido}`, 14, y); y += 6;
      doc.text(`Carnet: ${estudiante.carnet || 'N/A'}`, 14, y); y += 6;
      doc.text(`Grado: ${nombreGrado}`, 14, y); y += 6;
      doc.text(`Ciclo: ${nombreCiclo}`, 14, y); y += 6;
      doc.text(`Fecha: ${fechaHoy}`, 14, y); y += 10;

      const cursosFiltrados = cursos.filter(c => c.id_grado === notas[0]?.id_grado);
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

      y = doc.lastAutoTable.finalY + 15;

      if (y > 250) {
        doc.addPage();
        y = 20;
      }
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
    <div className="mis-notas-container">
      <h2 className="titulo">📘 Mis Notas</h2>
      <button onClick={exportarPDF} className="boton-exportar">
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
            <div key={estudiante.id_estudiante} className="tarjeta-estudiante">
              <div className="encabezado-tarjeta">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={estudiantesSeleccionados.includes(estudiante.id_estudiante)}
                    onChange={() => toggleSeleccion(estudiante.id_estudiante)}
                  />
                  <span className="nombre-estudiante">
                    Notas de {estudiante.nombre} {estudiante.apellido}
                  </span>
                </label>
              </div>
              <table className="tabla-notas">
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
                          <td key={unidad} className={esNotaBaja ? 'roja' : ''}>
                            {nota}
                          </td>
                        );
                      })}
                      <td className={curso.promedio !== '—' && parseFloat(curso.promedio) < 60 ? 'roja' : ''}>
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
