import {Component} from 'react';
import type {ErrorInfo,ReactNode} from 'react';
type State={error:Error|null};
export class ErrorBoundary extends Component<{children:ReactNode},State>{
 state:State={error:null};
 static getDerivedStateFromError(error:Error):State{return {error}};
 componentDidCatch(error:Error,info:ErrorInfo){console.error('LAB render error',error,info.componentStack)}
 render(){if(this.state.error)return <div role="alert" style={{padding:32,color:'#fff',background:'#181818',minHeight:'100vh'}}><h1>LAB encontró un error</h1><p>La aplicación no pudo completar esta operación. El error se muestra para facilitar su diagnóstico.</p><pre style={{whiteSpace:'pre-wrap'}}>{this.state.error.message}</pre><button onClick={()=>this.setState({error:null})}>Reintentar</button><button onClick={()=>location.reload()}>Recargar LAB</button></div>;return this.props.children}
}
