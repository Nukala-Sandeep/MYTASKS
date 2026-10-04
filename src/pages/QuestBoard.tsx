import {useState} from 'react';
import {Plus,Filter,CheckCircle2,Trash2} from 'lucide-react';
import type {AppData,Quest,QuestType,Rank} from '../types/app';
import QuestCard from '../components/QuestCard';
import Companion from '../components/Companion';
import VoiceCommands from '../components/VoiceCommands';
import {api} from '../services/api';
import {speak} from '../services/voice';

const rewards:Record<Rank,{xp:number;gold:number}>={E:{xp:30,gold:20},D:{xp:50,gold:30},C:{xp:80,gold:50},B:{xp:110,gold:70},A:{xp:160,gold:100},S:{xp:250,gold:180}};
const praise=['Excellent work, Hunter! Quest cleared successfully!','Amazing! You defeated that quest. I am proud of you!','Mission complete! Your focus is getting stronger!','Well done! Another raid has fallen before you!'];

export default function QuestBoard({data,setData}:{data:AppData;setData:(x:AppData)=>void}){
 const [open,setOpen]=useState(false); const [filter,setFilter]=useState<'All'|'Active'|'Cleared'>('All');
 const [title,setTitle]=useState(''); const [type,setType]=useState<QuestType>('Main Story'); const [rank,setRank]=useState<Rank>('C'); const [due,setDue]=useState(''); const [notice,setNotice]=useState('');
 const quests=data.quests.filter(q=>filter==='All'||filter==='Active'&&!q.completed||filter==='Cleared'&&q.completed);
 const notify=(msg:string)=>{setNotice(msg);setTimeout(()=>setNotice(''),3500)};
 const complete=async(q:Quest)=>{
  if(q.completed)return;
  try{const r=await api.completeQuest(q.id); const u=r.user; setData({...data,level:u.level,xp:u.xp,gold:u.gold,streak:u.streak,lastCompletedDate:u.lastCompletedDate,quests:data.quests.map(x=>x.id===q.id?{...x,completed:true}:x)}); const line=praise[Math.floor(Math.random()*praise.length)]; notify(line); speak(line,'Playful'); }catch(e:any){notify(e.message)}
 };
 const remove=async(q:Quest)=>{if(!confirm(`Remove “${q.title}”?`))return;try{await api.deleteQuest(q.id);setData({...data,quests:data.quests.filter(x=>x.id!==q.id)});const line=`Quest removed. We will make room for what matters, Hunter.`;notify(line);speak(line,'Soft')}catch(e:any){notify(e.message)}};
 const add=()=>{if(!title.trim())return; if(due&&new Date(due).getTime()<=Date.now())return notify('Choose a future deadline for this quest.'); const r=rewards[rank]; const dueValue=due?new Date(due).toISOString():''; const q:Quest={id:crypto.randomUUID(),title:title.trim(),type,rank,due:dueValue,xp:r.xp,gold:r.gold,completed:false,createdAt:Date.now()};api.createQuest(q).then(r=>{setData({...data,quests:[{...r.quest,id:r.quest._id},...data.quests]});setTitle('');setDue('');setOpen(false);notify('Quest forged successfully!');speak(`Quest forged: ${q.title}. I will keep watch over your deadline.`,'Soft')}).catch(e=>notify(e.message))};
 const voiceCommand=(raw:string)=>{const c=raw.toLowerCase();
   if(c.includes('create')||c.includes('new quest')||c.includes('forge')){setOpen(true);notify('Quest forge opened. Tell me the quest title, then set its deadline.');return}
   if(c.includes('show cleared')||c.includes('completed quests')){setFilter('Cleared');return}
   if(c.includes('show active')||c.includes('active quests')){setFilter('Active');return}
   if(c.includes('show all')||c.includes('all quests')){setFilter('All');return}
   const match=data.quests.find(q=>c.includes(q.title.toLowerCase()));
   if(match&&(c.includes('complete')||c.includes('clear')||c.includes('finish'))){complete(match);return}
   if(match&&(c.includes('remove')||c.includes('delete')||c.includes('cancel'))){remove(match);return}
   if(c.includes('remove')||c.includes('delete')){notify('Say “remove” followed by the quest name.');return}
   notify(`I heard “${raw}”, but I do not know that command yet.`);
 };
 return <div className="page"><HudPlaceholder data={data}/><Companion/><VoiceCommands onCommand={voiceCommand}/><div className="page-head"><div><span className="eyebrow">QUEST BOARD</span><h1>Today's Raids</h1></div><button className="primary small" onClick={()=>setOpen(true)}><Plus size={17}/> Forge Quest</button></div>
 <div className="filters">{(['All','Active','Cleared'] as const).map(x=><button className={filter===x?'pill active':'pill'} onClick={()=>setFilter(x)} key={x}><Filter size={14}/>{x}</button>)}</div>
 <div className="quest-grid">{quests.map(q=><QuestCard key={q.id} quest={q} onComplete={()=>complete(q)} onDelete={()=>remove(q)}/>)}</div>
 {notice&&<div className="quest-toast"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={()=>setNotice('')}><Trash2 size={14}/></button></div>}
 {open&&<div className="modal"><div className="modal-card"><button className="close" onClick={()=>setOpen(false)}>×</button><span className="eyebrow">FORGE NEW QUEST</span><h2>Create a Raid</h2>
 <label>Quest title<input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Study Java for 60 minutes"/></label>
 <label>Archetype<select value={type} onChange={e=>setType(e.target.value as QuestType)}>{['Main Story','Daily Habit','Urgent Raid','Side Quest'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Rank<select value={rank} onChange={e=>setRank(e.target.value as Rank)}>{['E','D','C','B','A','S'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Deadline date & time<input type="datetime-local" min={new Date(Date.now()+60000).toISOString().slice(0,16)} value={due} onChange={e=>setDue(e.target.value)}/></label>
 <div className="reward">Reward: +{rewards[rank].xp} XP • {rewards[rank].gold} Gold • Complete before the deadline</div>
 <button className="primary" onClick={add}>Create Quest</button></div></div>}
 </div>
}
function HudPlaceholder({data}:{data:AppData}){return <div className="hud"><div><span className="label">HUNTER</span><strong>LV. {data.level}</strong></div><div className="xp"><span className="label">EXP</span><div className="bar"><i style={{width:`${data.xp%1000/10}%`}}/></div><small>{data.xp%1000}/1000</small></div><div className="stat">🪙 {data.gold}</div><div className="stat">🔥 {data.streak}</div><div className="rank">PALADIN</div></div>}
