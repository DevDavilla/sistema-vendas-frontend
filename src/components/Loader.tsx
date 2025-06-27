import React from "react";
import "./Loader.css"; // Vamos criar este arquivo CSS

function Loader() {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Carregando...</p>
    </div>
  );
}

export default Loader;
