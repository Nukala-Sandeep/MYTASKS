import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import multer from 'multer';
import {User,Quest} from './models.js';
import {requireAuth,signUser} from './auth.js';

const app=express();
const PORT=process.env.PORT||5000;
app.get('/', (req, res) => {
    res.json({
        message: 'MYTASKS API is running',
        status: 'OK'
    });
});
const ELEVEN_BASE='https://api.elevenlabs.io/v1';
// Default Kitsune Aoi voice created by the project owner.
// Override with ELEVENLABS_DEFAULT_VOICE_ID when deploying another voice.
const DEFAULT_AOI_VOICE_ID=process.env.ELEVENLABS_DEFAULT_VOICE_ID||'R9th2GNXPmvP5kdtphBE';
const DEFAULT_AOI_VOICE_NAME=process.env.ELEVENLABS_DEFAULT_VOICE_NAME||'Kitsune Aoi • Default Female';
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:15*1024*1024}});
const allowedOrigins=(process.env.CLIENT_URL||'http://localhost:5173,http://127.0.0.1:5173').split(',').map(x=>x.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>{if(!origin||allowedOrigins.includes(origin)) return cb(null,true); cb(new Error('CORS origin not allowed'));}}));
app.use(express.json({limit:'1mb'}));

const safe=u=>({id:u._id,name:u.name,email:u.email,epithet:u.epithet,dob:u.dob,zodiac:u.zodiac,level:u.level,xp:u.xp,gold:u.gold,streak:u.streak,lastCompletedDate:u.lastCompletedDate,vaultEnabled:u.vaultEnabled,notificationsEnabled:u.notificationsEnabled,voiceId:u.voiceId||'',voiceName:u.voiceName||'',voiceProvider:u.voiceProvider||''});
const elevenHeaders=()=>({ 'xi-api-key':process.env.ELEVENLABS_API_KEY||'' });
const moodSettings=mood=>({stability:mood==='Goblin'?.35:mood==='Playful'?.45:.62,similarity_boost:.82,style:mood==='Goblin'?.35:mood==='Playful'?.22:.08,use_speaker_boost:true,speed:mood==='Goblin'?1.05:mood==='Playful'?1.02:.94});

app.get('/api/health',(q,r)=>r.json({ok:true,service:'mytasks-api',database:mongoose.connection.readyState===1?'connected':'disconnected',voiceProvider:process.env.ELEVENLABS_API_KEY?'elevenlabs':'browser-fallback'}));
app.post('/api/auth/register',async(req,res)=>{try{let {name,email,password}=req.body;if(!name||!email||!password)return res.status(400).json({message:'Name, email and password are required'});if(password.length<8)return res.status(400).json({message:'Password must be at least 8 characters'});email=email.toLowerCase();if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});let u=await User.create({name,email,passwordHash:await bcrypt.hash(password,12)});res.status(201).json({token:signUser(u),user:safe(u)})}catch(e){console.error(e);res.status(500).json({message:'Registration failed'})}});
app.post('/api/auth/login',async(req,res)=>{try{let {email,password}=req.body,u=await User.findOne({email:email?.toLowerCase()});if(!u||!(await bcrypt.compare(password||'',u.passwordHash)))return res.status(401).json({message:'Invalid email or password'});res.json({token:signUser(u),user:safe(u)})}catch{res.status(500).json({message:'Login failed'})}});
app.get('/api/me',requireAuth,async(req,res)=>{let u=await User.findById(req.user.id).select('-passwordHash');if(!u)return res.status(404).json({message:'User not found'});res.json({user:safe(u)})});
app.patch('/api/me',requireAuth,async(req,res)=>{const allowed=['name','epithet','dob','zodiac','vaultEnabled','notificationsEnabled'],x={};for(const k of allowed)if(req.body[k]!==undefined)x[k]=req.body[k];let u=await User.findByIdAndUpdate(req.user.id,x,{new:true}).select('-passwordHash');res.json({user:safe(u)})});
app.get('/api/quests',requireAuth,async(req,res)=>res.json({quests:await Quest.find({userId:req.user.id}).sort({createdAt:-1})}));
app.post('/api/quests',requireAuth,async(req,res)=>{let {title,type,rank,due,xp,gold}=req.body;if(!title)return res.status(400).json({message:'Quest title is required'});let q=await Quest.create({userId:req.user.id,title,type,rank,due,xp,gold});res.status(201).json({quest:q})});
app.post('/api/quests/:id/complete',requireAuth,async(req,res)=>{let q=await Quest.findOne({_id:req.params.id,userId:req.user.id});if(!q)return res.status(404).json({message:'Quest not found'});if(q.completed)return res.json({quest:q,user:safe(await User.findById(req.user.id))});if(q.due&&new Date(q.due).getTime()<=Date.now())return res.status(409).json({message:'Quest deadline has passed. This quest can no longer be cleared.'});q.completed=true;q.completedAt=new Date();await q.save();let u=await User.findById(req.user.id),today=new Date().toISOString().slice(0,10);u.xp+=q.xp;u.gold+=q.gold;u.streak=u.lastCompletedDate===today?u.streak:u.streak+1;u.lastCompletedDate=today;u.level=Math.floor(u.xp/1000)+1;await u.save();res.json({quest:q,user:safe(u)})});
app.post('/api/focus/reward',requireAuth,async(req,res)=>{let u=await User.findById(req.user.id);if(!u)return res.status(404).json({message:'User not found'});u.xp+=100;u.gold+=75;u.level=Math.floor(u.xp/1000)+1;let today=new Date().toISOString().slice(0,10);u.streak=u.lastCompletedDate===today?u.streak:u.streak+1;u.lastCompletedDate=today;await u.save();res.json({user:safe(u)})});
app.delete('/api/quests/:id',requireAuth,async(req,res)=>{let x=await Quest.deleteOne({_id:req.params.id,userId:req.user.id});if(!x.deletedCount)return res.status(404).json({message:'Quest not found'});res.status(204).end()});

app.get('/api/voice/default',requireAuth,(req,res)=>res.json({provider:'elevenlabs',voiceId:DEFAULT_AOI_VOICE_ID,voiceName:DEFAULT_AOI_VOICE_NAME,modelId:process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2'}));

app.post('/api/voice/clone',requireAuth,upload.single('file'),async(req,res)=>{
  try{
    if(!process.env.ELEVENLABS_API_KEY)return res.status(503).json({message:'Custom voice is not configured. Add ELEVENLABS_API_KEY to server/.env.'});
    if(req.body.consent!=='true')return res.status(400).json({message:'Voice consent is required.'});
    if(!req.file)return res.status(400).json({message:'Audio sample is required.'});
    if(!req.file.mimetype.startsWith('audio/'))return res.status(400).json({message:'Please upload an audio file.'});
    const name=(req.body.name||'Kokoro Custom Voice').slice(0,80);
    const form=new FormData();
    form.append('name',name);
    form.append('description','Kokoro Quest companion voice created from a permitted recording.');
    form.append('remove_background_noise','true');
    form.append('files',new Blob([req.file.buffer],{type:req.file.mimetype}),req.file.originalname||'voice-sample');
    const old=await User.findById(req.user.id);
    const response=await fetch(`${ELEVEN_BASE}/voices/add`,{method:'POST',headers:elevenHeaders(),body:form});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) return res.status(response.status).json({message:data.detail?.message||data.message||'Voice provider rejected the sample.'});
    if(old?.voiceId&&old.voiceProvider==='elevenlabs'){
      fetch(`${ELEVEN_BASE}/voices/${encodeURIComponent(old.voiceId)}`,{method:'DELETE',headers:elevenHeaders()}).catch(()=>{});
    }
    const u=await User.findByIdAndUpdate(req.user.id,{voiceId:data.voice_id,voiceName:name,voiceProvider:'elevenlabs'},{new:true});
    res.json({ok:true,user:safe(u),requiresVerification:Boolean(data.requires_verification)});
  }catch(e){console.error(e);res.status(500).json({message:'Voice cloning failed. Check the sample and provider configuration.'})}
});

app.post('/api/voice/speak',requireAuth,async(req,res)=>{
  try{
    if(!process.env.ELEVENLABS_API_KEY)return res.status(503).json({message:'Custom voice provider is not configured'});
    const text=String(req.body.text||'').trim();
    if(!text)return res.status(400).json({message:'Text is required'});
    if(text.length>500)return res.status(400).json({message:'Dialogue is limited to 500 characters'});
    const u=await User.findById(req.user.id);
    const voiceId=u?.voiceId||DEFAULT_AOI_VOICE_ID;
    if(!voiceId)return res.status(503).json({message:'No ElevenLabs voice is configured'});
    const response=await fetch(`${ELEVEN_BASE}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,{method:'POST',headers:{...elevenHeaders(),'Content-Type':'application/json'},body:JSON.stringify({text,model_id:process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2',voice_settings:moodSettings(req.body.mood||'Soft')})});
    if(!response.ok){const d=await response.text();console.error('ElevenLabs TTS:',d);return res.status(response.status).json({message:'Voice synthesis failed'});}
    const audio=Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type','audio/mpeg');res.setHeader('Cache-Control','no-store');res.send(audio);
  }catch(e){console.error(e);res.status(500).json({message:'Voice synthesis failed'})}
});

app.delete('/api/voice',requireAuth,async(req,res)=>{try{const u=await User.findById(req.user.id);if(u?.voiceId&&u.voiceProvider==='elevenlabs'&&process.env.ELEVENLABS_API_KEY){await fetch(`${ELEVEN_BASE}/voices/${encodeURIComponent(u.voiceId)}`,{method:'DELETE',headers:elevenHeaders()}).catch(()=>{})}const next=await User.findByIdAndUpdate(req.user.id,{voiceId:'',voiceName:'',voiceProvider:''},{new:true});res.json({user:safe(next)})}catch{res.status(500).json({message:'Could not remove custom voice'})}});

async function start(){
  if(!process.env.JWT_SECRET){console.error('JWT_SECRET missing in server/.env');process.exit(1)}
  app.listen(PORT,'0.0.0.0',()=>console.log(`mytasks API: http://localhost:${PORT}`));
  const uri=process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/mytasks';
  mongoose.connection.on('connected',()=>console.log('MongoDB connected'));
  mongoose.connection.on('error',e=>console.error('MongoDB error:',e.message));
  mongoose.connection.on('disconnected',()=>console.error('MongoDB disconnected - retrying...'));
  try{await mongoose.connect(uri,{serverSelectionTimeoutMS:5000});}catch(e){console.error('MongoDB connection failed:',e.message);console.error('Start MongoDB and the API will retry automatically.')}
  setInterval(async()=>{if(mongoose.connection.readyState!==1){try{await mongoose.connect(uri,{serverSelectionTimeoutMS:3000});}catch(e){}}},5000);
}
start();
