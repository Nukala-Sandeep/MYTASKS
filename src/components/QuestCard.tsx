import {CheckCircle2,Clock,Coins,Star,Swords,Trash2,AlertTriangle} from 'lucide-react';
import type {Quest} from '../types/app';
import {useEffect,useState} from 'react';
const rankClass=(r:string)=>`rank rank-${r.toLowerCase()}`;
export default function QuestCard({quest,onComplete,onDelete}:{quest:Quest;onComplete:()=>void;onDelete:()=>void}){
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 const deadline=quest.due?new Date(quest.due).getTime():0;
 const overdue=!quest.completed&&deadline>0&&deadline<now;
 const remaining=Math.max(0,deadline-now);
 const mins=Math.floor(remaining/60000), secs=Math.floor((remaining%60000)/1000);
 const countdown=deadline?(remaining>=3600000?`${Math.floor(remaining/3600000)}h ${Math.floor((remaining%3600000)/60000)}m left`:`${mins}m ${String(secs).padStart(2,'0')}s left`):'No deadline';
 return <article className={`quest card ${quest.completed?'done':''} ${overdue?'overdue':''}`}>
   <div className="quest-top"><span className={rankClass(quest.rank)}>{quest.rank}-RANK</span><span className="quest-type">{quest.type}</span></div>
   <h3>{quest.title}</h3>
   <div className="quest-meta"><span><Star size={15}/> +{quest.xp} XP</span><span><Coins size={15}/> {quest.gold} Gold</span>{quest.due&&<span><Clock size={15}/> {new Date(quest.due).toLocaleString()}</span>}</div>
   {!quest.completed&&quest.due&&<div className={overdue?'deadline danger':'deadline'}>{overdue?<><AlertTriangle size={14}/> Deadline passed</>:<><Clock size={14}/> {countdown}</>}</div>}
   <div className="quest-actions">
    <button className={quest.completed?'complete doneBtn':'complete'} disabled={quest.completed||overdue} onClick={onComplete}>{quest.completed?<><CheckCircle2 size={17}/> Cleared</>:overdue?<><AlertTriangle size={17}/> Missed</>:<><Swords size={17}/> Clear Quest</>}</button>
    <button className="delete-quest" onClick={onDelete} title="Remove quest"><Trash2 size={16}/></button>
   </div>
 </article>
}
