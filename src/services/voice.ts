import type {Mood} from '../types/app';
import {voiceSpeak} from './api';
export type VoicePreference='female-anime'|'female'|'any';
const KEY='kokoro_voice_preference';
const lines:Record<Mood,string[]>={Soft:['You can do this, Hunter. One focused step at a time.','I believe in you. Let us clear this quest together.'],Playful:['Quest spotted! Come on, Hunter, let us make it fun!','Nice work! I knew you had that quest in you.'],Goblin:['Unlimited power! Obliterate that quest!','Another quest has been deleted from existence!']};
export const DEFAULT_AOI_VOICE_ID='R9th2GNXPmvP5kdtphBE';
export const DEFAULT_AOI_VOICE_NAME='Kitsune Aoi • Default Female';
export function getVoicePreference():VoicePreference{return(localStorage.getItem(KEY) as VoicePreference)||'female-anime'}
export function setVoicePreference(v:VoicePreference){localStorage.setItem(KEY,v)}
function scoreVoice(v:SpeechSynthesisVoice,pref:VoicePreference){const n=(v.name+' '+v.voiceURI).toLowerCase();let s=0;const female=/female|woman|girl|zira|samantha|aria|jenny|libby|sara|hazel|susan|ava|serena|moira|victoria|karen|sophia|google us english|microsoft zira|microsoft aria/.test(n);const anime=/anime|neural|aria|jenny|sara|sophia|female/.test(n);if(pref==='female-anime'){if(anime)s+=8;if(female)s+=10}if(pref==='female'&&female)s+=15;if(pref==='any')s+=2;if(v.lang.toLowerCase().startsWith('en'))s+=5;if(v.localService)s+=2;return s}
export function availableVoices(){return 'speechSynthesis' in window?window.speechSynthesis.getVoices():[]}
export function bestVoice(pref=getVoicePreference()){const voices=availableVoices();if(!voices.length)return null;return[...voices].sort((a,b)=>scoreVoice(b,pref)-scoreVoice(a,pref))[0]||null}
function browserSpeak(text:string,mood:Mood){if(!('speechSynthesis'in window))return false;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);const v=bestVoice();if(v)u.voice=v;u.lang=v?.lang||'en-US';u.rate=mood==='Goblin'?1.08:mood==='Playful'?1.02:.9;u.pitch=mood==='Goblin'?1.35:mood==='Playful'?1.28:1.18;window.speechSynthesis.speak(u);return true}
export async function speak(text:string,mood:Mood='Soft'){try{const blob=await voiceSpeak(text,mood);const url=URL.createObjectURL(blob);const audio=new Audio(url);audio.onended=()=>URL.revokeObjectURL(url);await audio.play();return true}catch{ return browserSpeak(text,mood)}}
export function randomLine(mood:Mood){const a=lines[mood];return a[Math.floor(Math.random()*a.length)]}
