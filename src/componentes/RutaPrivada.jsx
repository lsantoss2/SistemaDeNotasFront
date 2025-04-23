import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RutaPrivada({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario || usuario.found !== true) {
    return <Navigate to="/" />;
  }

  return children;
}
