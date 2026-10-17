/* One local spoken instruction at a time. No learning/reward records are written. */
(() => {
 const key='learning-garden-farm-sound-v1';let generation=0,current=null,cancel=null,last=[];
 const enabled=()=>{try{return localStorage.getItem(key)!=='off';}catch{return true;}};
 function ui(note=''){const button=document.getElementById('cook-sound');if(button){button.textContent=enabled()?'🔊 声音：开启':'🔇 声音：关闭';button.setAttribute('aria-pressed',String(enabled()));}const status=document.getElementById('cook-voice-status');if(status)status.textContent=enabled()?note:'语音已关闭';}
 function stop(){generation++;cancel?.();cancel=null;current?.pause();current=null;}
 async function play(ids){last=ids.filter(Boolean);const clips=[...last];stop();const token=generation;if(!enabled()){ui();return;}ui();window.dispatchEvent(new CustomEvent('garden-audio-start',{detail:'kitchen'}));for(const id of clips){if(token!==generation||!enabled())return;const audio=new Audio('assets/cooking/voice/'+id+'.mp3'+(['ready-serve','served'].includes(id)?'?v=1.12.2':''));current=audio;const ok=await new Promise(resolve=>{let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timeout);audio.onended=audio.onerror=null;if(current===audio)current=null;if(cancel===abort)cancel=null;resolve(ok);};const abort=()=>{audio.pause();finish(true);};cancel=abort;const timeout=setTimeout(()=>{audio.pause();finish(false);},15000);audio.onended=()=>finish(true);audio.onerror=()=>finish(false);audio.play().catch(()=>finish(false));});if(token!==generation)return;if(!ok){ui('点“再听操作”重听提示');return;}}}
 const repeat=()=>play(last);
 function toggle(){const on=!enabled();try{localStorage.setItem(key,on?'on':'off');}catch{}stop();window.dispatchEvent(new Event('garden-sound-changed'));ui();if(on)repeat();}
 window.addEventListener('garden-audio-start',e=>{if(e.detail!=='kitchen')stop();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('storage',e=>{if(e.key===key){if(!enabled())stop();ui();}});
 window.GardenKitchenVoice={play,repeat,stop,toggle,ui};ui();
})();
