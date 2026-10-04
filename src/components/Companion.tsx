import {useState} from 'react';
import {Heart,Volume2,Sparkles} from 'lucide-react';
import {randomLine,speak} from '../services/voice';
import type {Mood} from '../types/app';

export default function Companion(){
 const [mood,setMood]=useState<Mood>('Soft');
 const [line,setLine]=useState('Your companion is ready, Hunter.');
 const talk=()=>{const x=randomLine(mood);setLine(x);speak(x,mood)};
 return <section className="companion card">
   <div className="anime-companion" aria-label="Original anime companion"><div className="hair"/><div className="face"><i className="eye left"/><i className="eye right"/><span className="mouth"/></div><span className="ear e1"/><span className="ear e2"/></div>
   <div className="companion-copy"><div className="label"><Sparkles size={11}/> KITSUNE AOI • ORIGINAL COMPANION</div><h3>{line}</h3><div className="moods">{(['Soft','Playful','Goblin'] as Mood[]).map(m=><button className={mood===m?'pill active':'pill'} onClick={()=>setMood(m)} key={m}>{m}</button>)}</div></div>
   <button className="iconBtn" onClick={talk} title="Talk to companion"><Volume2 size={21}/></button><Heart className="heart" size={16}/>
 </section>
}
