import {useState} from 'react';
import {Sparkles,ShieldCheck,Bell,ChevronRight,CalendarDays} from 'lucide-react';
import type {AppData} from '../types/app';
import {requestNotifications} from '../services/notifications';

function zodiac(d:string){
 if(!d)return '';
 const [y,m,day]=d.split('-').map(Number), md=m*100+day;
 if(md<=119)return 'Capricorn'; if(md<=218)return 'Aquarius'; if(md<=320)return 'Pisces'; if(md<=419)return 'Aries';
 if(md<=520)return 'Taurus'; if(md<=620)return 'Gemini'; if(md<=722)return 'Cancer'; if(md<=822)return 'Leo';
 if(md<=922)return 'Virgo'; if(md<=1022)return 'Libra'; if(md<=1121)return 'Scorpio'; if(md<=1221)return 'Sagittarius'; return 'Capricorn';
}
export default function Onboarding({data,setData,onFinish}:{data:AppData;setData:(x:AppData)=>void;onFinish:(x:AppData)=>void}){
 const [step,setStep]=useState(data.profile.awakened?3:1);
 const [name,setName]=useState(data.profile.name==='Hunter'?'':data.profile.name);
 const [dob,setDob]=useState(data.profile.dob);
 const [vault,setVault]=useState(data.profile.vaultEnabled);
 const [notifs,setNotifs]=useState(data.profile.notificationsEnabled);
 const today=new Date().toISOString().slice(0,10);
 const saveProfile=()=>setData({...data,profile:{...data.profile,name:name||'Hunter',epithet:'Paladin of Focus',dob,zodiac:zodiac(dob),awakened:true,vaultEnabled:vault,notificationsEnabled:notifs}});
 const finish=()=>{const next={...data,profile:{...data.profile,name:name||'Hunter',epithet:'Paladin of Focus',dob,zodiac:zodiac(dob),awakened:true,vaultEnabled:vault,notificationsEnabled:notifs}};onFinish(next)};
 return <div className="onboarding">
   <div className="onboard-brand">MYTASKS <span>KOKORO QUEST</span></div>
   {step===1&&<div className="on-card"><div className="bigIcon"><Sparkles/></div><span className="eyebrow">STAGE 01 • AWAKENING</span><h1>Awaken, Hunter.</h1><p>Your productivity journey begins with your identity.</p>
      <label>Hunter / Player Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name"/></label>
      <label>Date of Birth<div className="dateField"><CalendarDays size={18}/><input type="date" max={today} value={dob} onChange={e=>setDob(e.target.value)}/></div></label>
      {dob&&<div className="affinity">✦ {zodiac(dob)} Arcane Sign Detected • Birthday raid unlocked</div>}
      <button className="primary" onClick={()=>{saveProfile();setStep(2)}}>Awaken <ChevronRight/></button>
   </div>}
   {step===2&&<div className="on-card"><div className="bigIcon"><ShieldCheck/></div><span className="eyebrow">STAGE 02 • VAULT</span><h1>Fortify your Vault.</h1><p>Protect your local productivity data with a device security gate.</p>
      <div className="securityBox"><b>Biometric Rune Key</b><span>Use your device lock/biometric protection before opening the app.</span><button className={vault?'toggle on':'toggle'} onClick={()=>setVault(!vault)}>{vault?'ENABLED':'ENABLE'}</button></div>
      <div className="securityNote">Your browser cannot directly guarantee a hardware-enclave AES key. This starter keeps sensitive app data local and prepares the boundary for a native secure-storage implementation.</div>
      <button className="primary" onClick={()=>{saveProfile();setStep(3)}}>Continue <ChevronRight/></button>
   </div>}
   {step===3&&<div className="on-card"><div className="bigIcon"><Bell/></div><span className="eyebrow">STAGE 03 • COMPANION LINK</span><h1>Link your companion.</h1><p>Allow notifications so raids and streak reminders can reach you.</p>
      <div className="voiceSample">“Don't ignore me, baka!”</div>
      <button className={notifs?'toggle on wide':'toggle wide'} onClick={async()=>{const ok=await requestNotifications();setNotifs(ok)}}>{notifs?'NOTIFICATIONS ENABLED':'ENABLE NOTIFICATIONS'}</button>
      <button className="primary" onClick={finish}>Enter Main Hub <ChevronRight/></button>
   </div>}
 </div>
}
