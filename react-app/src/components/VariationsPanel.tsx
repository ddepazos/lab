import {useState} from 'react';
import type {StudioDocument} from '../document/types';
import type {Layer} from '../document/layers';
import type {Timeline} from '../animation/timeline';
import {useStudio} from '../state/studio';
type Snapshot={id:string;name:string;document:StudioDocument;layers:Layer[];timeline:Timeline};
const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value)) as T;
export function VariationsPanel({timeline,onTimelineChange}:{timeline:Timeline;onTimelineChange:(timeline:Timeline)=>void}){
 const document=useStudio(s=>s.doc),layers=useStudio(s=>s.layers),loadProject=useStudio(s=>s.loadProject);
 const [snapshots,setSnapshots]=useState<Snapshot[]>([]);
 const save=()=>setSnapshots(items=>[...items,{id:String(Date.now())+'-'+items.length,name:'Variación '+(items.length+1),document:clone(document),layers:clone(layers),timeline:clone(timeline)}]);
 const restore=(item:Snapshot)=>{loadProject({format:'lab-project',version:1,document:clone(item.document),layers:clone(item.layers),timeline:clone(item.timeline)});onTimelineChange(clone(item.timeline));};
 return <section className="variations-panel"><div className="layers-head"><h2>Variaciones</h2><button onClick={save}>+ Guardar</button></div><p className="note">Capturas temporales de la composición. Para conservarlas entre sesiones, exporta el proyecto JSON.</p>{snapshots.map(item=><div className="variation-item" key={item.id}><button onClick={()=>restore(item)} title="Recuperar esta variación">{item.name}</button><button onClick={()=>setSnapshots(items=>items.filter(x=>x.id!==item.id))} aria-label={'Eliminar '+item.name}>×</button></div>)}</section>;
}
