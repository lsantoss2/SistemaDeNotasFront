import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import '../estilos/InformacionPerfil.css';

export default function InformacionPerfilPage() {
  const { id } = useParams();
  const [modoEdicion, setModoEdicion] = useState(false);

  const [estudiante, setEstudiante] = useState({
    id,
    nombre: 'Shahrukh Khan',
    email: 'sharukh@inilabs.com',
    telefono: '01715462698',
    direccion: 'Mumbai, India',
    grupo: 'Science',
    nacimiento: '1988-12-26',
    sangre: 'A+',
    foto: 'https://randomuser.me/api/portraits/men/1.jpg',
  });

  const [formulario, setFormulario] = useState({});

  useEffect(() => {
    setFormulario(estudiante);
  }, [estudiante]);

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarCambios = () => {
    // Aquí podrías enviar cambios reales con fetch PUT
    setEstudiante(formulario);
    setModoEdicion(false);
    alert('Cambios guardados (simulado)');
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Resumen del Estudiante', 10, 10);
    doc.setFontSize(12);
    doc.text(`Nombre: ${estudiante.nombre}`, 10, 25);
    doc.text(`Email: ${estudiante.email}`, 10, 35);
    doc.text(`Teléfono: ${estudiante.telefono}`, 10, 45);
    doc.text(`Dirección: ${estudiante.direccion}`, 10, 55);
    doc.text(`Grupo: ${estudiante.grupo}`, 10, 65);
    doc.text(`Nacimiento: ${estudiante.nacimiento}`, 10, 75);
    doc.text(`Sangre: ${estudiante.sangre}`, 10, 85);
    doc.save(`Estudiante_${estudiante.id}.pdf`);
  };

  return (
    <div className="perfil-contenedor">
      <div className="perfil-card">
        <img src={estudiante.foto} alt="perfil" className="perfil-foto" />
        {!modoEdicion ? (
          <>
            <h2>{estudiante.nombre}</h2>
            <p className="perfil-rol">Estudiante</p>
            <p><strong>Email:</strong> {estudiante.email}</p>
            <p><strong>Teléfono:</strong> {estudiante.telefono}</p>
            <p><strong>Dirección:</strong> {estudiante.direccion}</p>
            <p><strong>Grupo:</strong> {estudiante.grupo}</p>
            <p><strong>Fecha de nacimiento:</strong> {estudiante.nacimiento}</p>
            <p><strong>Sangre:</strong> {estudiante.sangre}</p>

            <div className="perfil-botones">
              <button className="btn btn-pdf" onClick={generarPDF}>📄 PDF</button>
              <button className="btn btn-editar" onClick={() => setModoEdicion(true)}>✏️ Editar</button>
            </div>
          </>
        ) : (
          <>
            <h2>Editar Información</h2>
            <input name="nombre" value={formulario.nombre} onChange={manejarCambio} />
            <input name="email" value={formulario.email} onChange={manejarCambio} />
            <input name="telefono" value={formulario.telefono} onChange={manejarCambio} />
            <input name="direccion" value={formulario.direccion} onChange={manejarCambio} />
            <input name="grupo" value={formulario.grupo} onChange={manejarCambio} />
            <input name="nacimiento" value={formulario.nacimiento} onChange={manejarCambio} />
            <input name="sangre" value={formulario.sangre} onChange={manejarCambio} />
            <div className="perfil-botones">
              <button className="btn btn-guardar" onClick={guardarCambios}>💾 Guardar</button>
              <button className="btn btn-cancelar" onClick={() => setModoEdicion(false)}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
