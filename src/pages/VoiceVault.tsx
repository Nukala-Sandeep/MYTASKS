import {useEffect,useRef,useState} from 'react';
import {Volume2,Upload,Mic,Square,Download,Save,Play,Pause,Trash2,ShieldCheck,WandSparkles} from 'lucide-react';
import {speak,getVoicePreference,setVoicePreference,availableVoices,type VoicePreference} from '../services/voice';
import {api,voiceClone,removeCustomVoice} from '../services/api';
import type {Mood} from '../types/app';

type SavedSample={name:string;type:string;size:number;url:string;blob?:Blob};

export default function VoiceVault(){
 const [mood,setMood]=useState<Mood>('Soft');
 const [text,setText]=useState('Quest cleared! Excellent work, Hunter.');
 const [pref,setPref]=useState<VoicePreference>(getVoicePreference());
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 const [sample,setSample]=useState<SavedSample|null>(null);
 const [recorded,setRecorded]=useState<SavedSample|null>(null);
 const [recording,setRecording]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [cloning,setCloning]=useState(false);
 const [consent,setConsent]=useState(false);
 const [custom,setCustom]=useState<{id:string;name:string;provider:string}|null>(null);
 const [message,setMessage]=useState('');
 const inputRef=useRef<HTMLInputElement>(null);
 const mediaRecorderRef=useRef<MediaRecorder|null>(null);
 const chunksRef=useRef<Blob[]>([]);
 const audioRef=useRef<HTMLAudioElement|null>(null);

 useEffect(()=>{const load=()=>setVoices(availableVoices());load();speechSynthesis?.addEventListener('voiceschanged',load);api.me().then(r=>{if(r.user.voiceId)setCustom({id:r.user.voiceId,name:r.user.voiceName||'Custom Voice',provider:r.user.voiceProvider||'elevenlabs'})}).catch(()=>{});return()=>speechSynthesis?.removeEventListener('voiceschanged',load)},[]);

 const audition=async()=>{setVoicePreference(pref);setMessage('Speaking…');await speak(text,mood);setMessage(custom?'Using your custom companion voice.':'Using female browser voice fallback.');};
 const save=()=>{setVoicePreference(pref);speak('Voice preference saved. I am ready, Hunter.','Soft');setMessage('Voice preference saved.');};
 const handleUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('audio/')){setMessage('Please choose an audio file.');return}if(file.size>15*1024*1024){setMessage('Maximum sample size is 15 MB.');return}const url=URL.createObjectURL(file);setSample({name:file.name,type:file.type,size:file.size,url,blob:file});setMessage('Sample ready. Press Create Custom Voice.');e.target.value=''};
 const startRecording=async()=>{if(!navigator.mediaDevices?.getUserMedia){setMessage('Microphone recording needs Chrome/Edge on localhost or HTTPS.');return}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunksRef.current=[];const mime=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';const recorder=new MediaRecorder(stream,{mimeType:mime});mediaRecorderRef.current=recorder;recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)};recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'});const url=URL.createObjectURL(blob);setRecorded({name:`kokoro-recording-${Date.now()}.webm`,type:blob.type,size:blob.size,url,blob});setRecording(false);setMessage('Recording ready. Review it, then create the custom voice.');};recorder.start();setRecording(true);setMessage('Recording… speak clearly for 10–30 seconds.')}catch{setMessage('Microphone permission was denied or unavailable.')}};
 const stopRecording=()=>mediaRecorderRef.current?.stop();
 const togglePlay=(item:SavedSample)=>{if(!audioRef.current){audioRef.current=new Audio();audioRef.current.onended=()=>setPlaying(false)}if(playing){audioRef.current.pause();setPlaying(false)}else{audioRef.current.src=item.url;audioRef.current.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false))}};
 const clone=async()=>{const item=recorded||sample;if(!item?.blob){setMessage('Choose or record an audio sample first.');return}if(!consent){setMessage('Confirm that you own or have permission to use this voice.');return}setCloning(true);setMessage('Creating your custom voice…');try{const r=await voiceClone(item.blob,'Kokoro Hunter Companion');setCustom({id:r.user.voiceId,name:r.user.voiceName,provider:r.user.voiceProvider});setMessage(r.requiresVerification?'Voice created; provider verification may be required before use.':'Custom voice created. The companion will now use it.');await speak('Custom voice linked. I am ready, Hunter.','Soft')}catch(e:any){setMessage(e.message||'Voice cloning failed.')}finally{setCloning(false)}};
 const remove=async()=>{if(!confirm('Remove the custom companion voice?'))return;try{await removeCustomVoice();setCustom(null);setMessage('Custom voice removed. Browser female voice is active again.')}catch(e:any){setMessage(e.message)}};
 const download=(item:SavedSample)=>{const a=document.createElement('a');a.href=item.url;a.download=item.name;a.click()};
 const size=(n:number)=>n<1024?`${n} B`:`${(n/1024/1024).toFixed(2)} MB`;
 return <div className="page"><span className="eyebrow">VOICE VAULT • STAGE 07</span><h1>Companion Voice Lab</h1><p className="muted">Kitsune Aoi uses your ElevenLabs default female voice for companion dialogue, focus alerts and quest/focus completion speech. A personal custom voice can still override it. If ElevenLabs is unavailable, the app falls back to the browser's best available female English voice.</p>
 <div className="voice-grid"><div className="card voice-card"><div className="voice-character"><div className="anime-companion mini"><div className="hair"/><div className="face"><i className="eye left"/><i className="eye right"/><span className="mouth"/></div></div><div><h2>Kitsune Aoi</h2><span className="tag">ORIGINAL • FEMALE • ANIME-STYLE</span></div></div>
 <div className="securityBox"><b><ShieldCheck size={16}/> Active voice</b><span>{custom?custom.name:'Kitsune Aoi • Default Female (ElevenLabs)'}</span></div>
 <label>Fallback voice profile<select value={pref} onChange={e=>setPref(e.target.value as VoicePreference)}><option value="female-anime">Female Anime-Style</option><option value="female">Female Voice</option><option value="any">System Default</option></select></label>
 <label>Dialogue<textarea value={text} onChange={e=>setText(e.target.value)} maxLength={500}/></label><div className="moods">{(['Soft','Playful','Goblin'] as Mood[]).map(m=><button type="button" className={mood===m?'pill active':'pill'} onClick={()=>setMood(m)} key={m}>{m}</button>)}</div>
 <div className="voice-actions"><button type="button" className="primary" onClick={audition}><Volume2/> Audition</button><button type="button" className="pill" onClick={save}><Save/> Save fallback</button></div>{message&&<div className="vault-message">{message}</div>}
 </div>
 <div className="card voice-card"><h2><WandSparkles/> Custom Voice Engine</h2><p className="muted">Upload or record a voice you own or have permission to use. The backend sends the sample to the configured voice provider and stores only the provider voice ID in MongoDB.</p>
 <input ref={inputRef} type="file" accept="audio/*" onChange={handleUpload} style={{display:'none'}} />
 <button type="button" className="pill wide" onClick={()=>inputRef.current?.click()}><Upload/> Upload permitted sample</button>
 <button type="button" className="pill wide" onClick={recording?stopRecording:startRecording}>{recording?<><Square/> Stop recording</>:<><Mic/> Record voice</>}</button>
 {(sample||recorded)&&<div className="sample-list">{sample&&<div className="sample-row"><div><b>{sample.name}</b><small>{sample.type} • {size(sample.size)}</small></div><button type="button" className="icon-btn" title="Play" onClick={()=>togglePlay(sample)}>{playing?<Pause/>:<Play/>}</button><button type="button" className="icon-btn" title="Delete" onClick={()=>{URL.revokeObjectURL(sample.url);setSample(null)}}><Trash2/></button></div>}{recorded&&<div className="sample-row"><div><b>{recorded.name}</b><small>{recorded.type} • {size(recorded.size)}</small></div><button type="button" className="icon-btn" title="Play" onClick={()=>togglePlay(recorded)}><Play/></button><button type="button" className="icon-btn" title="Export" onClick={()=>download(recorded)}><Download/></button></div>}</div>}
 <label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I confirm this recording is my voice or I have permission to create and use a voice model from it.</label>
 <button type="button" className="primary wide" disabled={cloning||(!sample&&!recorded)} onClick={clone}>{cloning?'Creating voice…':'Create / Replace Custom Voice'}</button>
 {custom&&<button type="button" className="pill wide danger" onClick={remove}><Trash2/> Remove Custom Voice</button>}
 <div className="vault-stat"><b>{voices.length}</b><span>browser voices available as fallback</span></div><small className="muted">The ElevenLabs API key stays on the backend. Never put it in a VITE_* frontend variable.</small>
 </div></div></div>
}
