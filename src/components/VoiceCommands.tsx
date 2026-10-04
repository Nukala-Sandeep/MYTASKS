import {Mic,MicOff,Volume2} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {speak} from '../services/voice';

type Props={onCommand:(text:string)=>void};
export default function VoiceCommands({onCommand}:Props){
 const [listening,setListening]=useState(false); const [heard,setHeard]=useState(''); const recognition=useRef<any>(null);
 useEffect(()=>()=>{recognition.current?.stop()},[]);
 const start=()=>{
  const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!SR){speak('Voice commands are not supported in this browser. Please use Chrome or Edge.', 'Soft');return}
  const r=new SR(); r.lang='en-US'; r.continuous=true; r.interimResults=false;
  r.onresult=(e:any)=>{const text=e.results[e.results.length-1][0].transcript.trim();setHeard(text);onCommand(text)};
  r.onerror=()=>setListening(false); r.onend=()=>setListening(false); recognition.current=r; r.start(); setListening(true);
 };
 const stop=()=>{recognition.current?.stop();setListening(false)};
 return <div className="voice-command-bar card"><div className={`mic-orb ${listening?'listening':''}`}><Mic size={18}/></div><div className="voice-command-copy"><b>{listening?'Listening for commands…':'Voice Command Mode'}</b><small>{heard||'Try: “create quest”, “complete Java quest”, “remove that quest”, “show active quests”'}</small></div><button className={listening?'pill active':'pill'} onClick={listening?stop:start}>{listening?<><MicOff size={15}/> Stop</>:<><Mic size={15}/> Listen</>}</button><Volume2 size={16} className="voice-wave"/></div>
}
