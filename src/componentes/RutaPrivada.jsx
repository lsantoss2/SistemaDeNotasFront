// src/componentes/RutaPrivada.jsx
import { Navigate } from "react-router-dom";

export default function RutaPrivada({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  return usuario && usuario.found ? children : <Navigate to="/" />;
}
