import {useState} from 'react';

const API='https://lab-render-api.ddepazosdesanmartin.workers.dev';
const JOB_PATTERN=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Job={id:string;status:string;fps?:number;frameCount?:number;width?:number;height?:number;createdAt?:string};
export function RemoteRenderLibrary(){
 const [jobId,setJobId]=useState('beed6fb5-06a1-4c3c-8ddc-832ce3abee70');
 const [token,setToken]=useState('');
 const [showAdvanced,setShowAdvanced]=useState(false);
 const [job,setJob]=useState<Job|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('El renderizado local funciona sin token. La biblioteca remota requiere autorización del Worker.');
 const headers=()=>({Authorization:'Bearer '+token.trim()});
 const validate=()=>{if(!JOB_PATTERN.test(jobId.trim()))throw new Error('Identificador de trabajo inválido');if(!token.trim())throw new Error('Introduce el token de acceso del Worker');};
 const load=async()=>{setBusy(true);setMessage('Consultando renderizado…');try{validate();const response=await fetch(API+'/api/jobs/'+jobId.trim(),{headers:headers(),cache:'no-store'});if(!response.ok)throw new Error(response.status===401?'Token incorrecto o no autorizado':'Error HTTP '+response.status);const data=await response.json() as Job;setJob(data);setMessage('Trabajo consultado correctamente.')}catch(e){setJob(null);setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}};
 const download=async()=>{setBusy(true);setMessage('Descargando MP4 remoto…');try{validate();const response=await fetch(API+'/api/jobs/'+jobId.trim()+'/download',{headers:headers(),cache:'no-store'});if(!response.ok)throw new Error(response.status===404?'El MP4 todavía no está disponible':response.status===401?'Acceso no autorizado':'Error HTTP '+response.status);const blob=await response.blob();if(!blob.size)throw new Error('El MP4 está vacío');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='LAB-'+jobId.trim()+'.mp4';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setMessage('Descarga MP4 iniciada ('+(blob.size/1048576).toFixed(2)+' MB).')}catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}};
 return <section className="lab-remote-library" aria-label="Renderizados remotos">
 <h2>Biblioteca remota · Cloudflare R2</h2>
 <p className="note">Consulta y descarga un trabajo existente sin alterar los motores de exportación local.</p>
 <p className="note">Esta biblioteca es independiente de «Exportar video» (MP4/WebM local). No es necesario introducir credenciales para exportar desde tu navegador.</p>
 <button type="button" aria-expanded={showAdvanced} onClick={()=>setShowAdvanced(value=>!value)}>{showAdvanced?'Ocultar controles remotos':'Mostrar controles remotos · acceso restringido'}</button>
 {showAdvanced&&<div className="lab-remote-controls"><label>ID del renderizado<input type="text" spellCheck={false} value={jobId} onChange={e=>{setJobId(e.target.value);setJob(null)}} placeholder="UUID del trabajo"/></label>
 <label>Token técnico del Worker (solo administración)<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} placeholder="Token API del Worker"/></label>
 <div className="lab-remote-actions"><button type="button" disabled={busy||!token.trim()||!JOB_PATTERN.test(jobId.trim())} onClick={()=>void load()}>Consultar trabajo</button><button type="button" disabled={busy||!token.trim()||job?.status!=='completed'||job.id!==jobId.trim()} onClick={()=>void download()}>↓ Descargar MP4 remoto</button></div>
 {job&&<p className="note">Estado: {job.status} · {job.width??'—'} × {job.height??'—'} · {job.frameCount??'—'} fotogramas · {job.fps??'—'} FPS</p>}
 <p role="status" className="note">{message}</p></div>}
 <p className="note">El acceso automático del administrador sigue pendiente de implementación segura. No se ha eliminado la protección del Worker.</p>
 <p className="note">ZIP de PNG, listado de todos los trabajos y eliminación requieren ampliar las rutas autenticadas del Worker. No se ofrecen acciones que todavía no existen.</p>
 </section>;
}
