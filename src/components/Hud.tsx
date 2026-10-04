import {Shield,Flame,Coins,Star} from 'lucide-react';
export default function Hud({level,xp,gold,streak}:{level:number;xp:number;gold:number;streak:number}){
 const progress=xp%1000;
 return <div className="hud">
   <div><span className="label">HUNTER LEVEL</span><strong>LV. {level}</strong></div>
   <div className="xp"><span className="label">EXP</span><div className="bar"><i style={{width:`${progress/10}%`}}/></div><small>{progress}/1000</small></div>
   <div className="stat"><Coins size={17}/> {gold}</div><div className="stat"><Flame size={17}/> {streak}</div>
   <div className="rank"><Shield size={17}/> PALADIN</div>
 </div>
}
