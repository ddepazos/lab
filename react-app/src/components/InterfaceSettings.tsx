import {useEffect,useRef} from 'react';
export type InterfacePreferences={theme:'dark'|'light';layout:'compact'|'comfortable'|'focus'};
export const defaultInterface:InterfacePreferences={theme:'dark',layout:'compact'};
const storageKey='lab-interface-v1';
export function readInterfacePreferences():InterfacePreferences{
 try{const value=JSON.parse(localStorage.getItem(storageKey)??'null');return {theme:value?.theme==='light'?'light':'dark',layout:['compact','comfortable','focus'].includes(value?.layout)?value.layout:'compact'};}catch{return {...defaultInterface};}
}
export function saveInterfacePreferences(value:InterfacePreferences){try{localStorage.setItem(storageKey,JSON.stringify(value));}catch{/* Keep the controls usable when storage is unavailable. */}}
export function InterfaceSettings({value,onChange,onClose}:{value:InterfacePreferences;onChange:(value:InterfacePreferences)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>{if(dialog?.open)dialog.close();};},[]);
 return <dialog ref={ref} className="lab-interface-dialog" aria-labelledby="lab-interface-title" onCancel={onClose} onClose={()=>{if(!ref.current?.open)onClose();}}>
  <div className="lab-interface-heading"><h2 id="lab-interface-title">Interfaz de LAB</h2><button type="button" aria-label="Cerrar ajustes de interfaz" onClick={()=>ref.current?.close()}>×</button></div>
  <p>Ajusta tu espacio de trabajo. La preferencia se guarda en este navegador.</p>
  <label>Tema de interfaz<select aria-label="Tema de interfaz" value={value.theme} onChange={e=>onChange({...value,theme:e.target.value as InterfacePreferences['theme']})}><option value="dark">Oscuro · Graphite</option><option value="light">Claro</option></select></label>
  <label>Distribución de interfaz<select aria-label="Distribución de interfaz" value={value.layout} onChange={e=>onChange({...value,layout:e.target.value as InterfacePreferences['layout']})}><option value="compact">Compacta · Más espacio para el lienzo</option><option value="comfortable">Amplia · Paneles y controles más grandes</option><option value="focus">Enfoque · Solo lienzo y herramientas</option></select></label>
  <p>El tema cambia los paneles y controles. Los colores del diseño y sus capas se conservan.</p>
  <div className="lab-interface-actions"><button type="button" onClick={()=>onChange({...defaultInterface})}>Restaurar interfaz predeterminada</button><button type="button" onClick={()=>ref.current?.close()}>Listo</button></div>
 </dialog>;
}
