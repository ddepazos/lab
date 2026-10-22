import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const LEGACY_URL = import.meta.env.VITE_LEGACY_URL || 'https://ddepazos.github.io/lab/';
function App() {
  const [status, setStatus] = React.useState('Cargando editor original…');
  const [reloadKey, setReloadKey] = React.useState(0);
  return <main>
    <header>
      <strong>LAB <small>React — transición</small></strong>
      <div className="actions"><span role="status">{status}</span>
        <button type="button" onClick={() => {setStatus('Recargando editor…');setReloadKey(k => k+1)}}>Recargar editor</button>
        <a href={LEGACY_URL} target="_blank" rel="noopener noreferrer">Abrir editor original</a>
      </div>
    </header>
    <iframe key={reloadKey} title="Editor LAB original" src={LEGACY_URL}
      onLoad={() => setStatus('Marco cargado; herramientas aún sin verificar')}
      onError={() => setStatus('Error al cargar el marco; abre el editor original')}/>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
