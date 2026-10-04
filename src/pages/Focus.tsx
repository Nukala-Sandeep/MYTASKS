import {useEffect,useState} from 'react';
import {Play,Pause,RotateCcw,Trophy,Volume2} from 'lucide-react';
import type {AppData} from '../types/app';
import {speak} from '../services/voice';
import {api} from '../services/api';
export default function Focus({data,setData}:{data:AppData;setData:(x:AppData)=>void}){
 const [seconds,setSeconds]=useState(25*60),[running,setRunning]=useState(false),[claimed,setClaimed]=useState(false);
 useEffect(()=>{if(!running)return;const t=setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);speak('Raid complete! Claim your victory, Hunter.','Playful');return 0}return s-1}),1000);return()=>clearInterval(t)},[running]);
 const mins=String(Math.floor(seconds/60)).padStart(2,'0'),secs=String(seconds%60).padStart(2,'0');
 const claim=async()=>{if(claimed||seconds>0)return;try{const r=await api.focusReward();setClaimed(true);setData({...data,level:r.user.level,xp:r.user.xp,gold:r.user.gold,streak:r.user.streak,lastCompletedDate:r.user.lastCompletedDate})}catch(e:any){alert(e.message)}};
 const reset=()=>{setRunning(false);setSeconds(25*60);setClaimed(false)};
 const progress=((25*60-seconds)/(25*60))*100;
 return <div className="page focus-page"><div className="focus-banner"><span>FOCUS CRUCIBLE</span><b>Neo-Tokyo Lofi Channel</b><button className="iconBtn" onClick={()=>speak('Focus mode engaged. I will protect your streak.','Soft')}><Volume2 size={18}/></button></div><h1>Enter Focus Mode</h1><p className="muted">A 25-minute S-rank concentration raid. Finish it to claim the reward.</p><div className="timer-ring" style={{background:`conic-gradient(#00f0ff ${progress}%,#292734 ${progress}% )`}}><div className="timer-inner"><span>25 MIN RAID</span><strong>{mins}:{secs}</strong><small>{running?'FOCUSING...':'READY'}</small></div></div><div className="timer-actions"><button className="primary" onClick={()=>{if(!running&&seconds===25*60)speak('Focus mode engaged. Let us clear this raid together.','Soft');setRunning(!running)}}>{running?<Pause/>:<Play/>}{running?'Pause':'Start Focus'}</button><button className="pill" onClick={reset}><RotateCcw/> Reset</button></div>{seconds===0&&<button className="claim" disabled={claimed} onClick={claim}><Trophy/> {claimed?'Victory Claimed!':'Claim +100 XP / +75 Gold'}</button>}<div className="focus-note">Keep the app open while focusing. Browser audio and notifications depend on your device permissions.</div></div>
}
