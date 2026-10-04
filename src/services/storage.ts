import type {AppData} from '../types/app';

const KEY='mytasks-kokoro-quest-v1';

const initial:AppData={
 profile:{name:'Hunter',epithet:'Paladin of Focus',dob:'',zodiac:'',awakened:false,vaultEnabled:false,notificationsEnabled:false},
 quests:[
  {id:'demo-1',title:'Review Sprint Deck',type:'Main Story',rank:'A',due:'',xp:120,gold:80,completed:false,createdAt:Date.now()}
 ],
 level:14,xp:820,gold:1250,streak:3,lastCompletedDate:''
};

export function loadData():AppData{
 try{const raw=localStorage.getItem(KEY); return raw?JSON.parse(raw):initial}
 catch{return initial}
}
export function saveData(data:AppData){localStorage.setItem(KEY,JSON.stringify(data))}
export function resetData(){localStorage.removeItem(KEY); location.reload()}
