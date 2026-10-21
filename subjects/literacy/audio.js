(() => {
 let clip=null,cancel=null,token=0;
 function stop(){token++;clip?.pause();clip=null;cancel?.();cancel=null;}
 async function play(src,enabled=true){
  stop();const error=document.querySelector('#audio-error');if(error)error.textContent='';if(!enabled||document.hidden)return false;window.dispatchEvent(new CustomEvent('garden-audio-start',{detail:'literacy'}));const current=token,paths=Array.isArray(src)?src:[src],prepared=globalThis.GardenSpeechJoin?.prepare(paths);
  for(const [index,path] of paths.entries()){
   if(current!==token||document.hidden)return false;const sound=prepared?.get(index)||new Audio(path);clip=sound;
   const ok=await new Promise(resolve=>{let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);sound.onended=sound.onerror=null;if(cancel===abort)cancel=null;resolve(ok);};const abort=()=>finish(false);cancel=abort;const timer=setTimeout(()=>{sound.pause();finish(false);},60000);sound.onended=()=>finish(true);sound.onerror=()=>finish(false);sound.play().catch(()=>finish(false));});
   if(current!==token)return false;
   if(!ok){sound.pause();clip=null;const error=document.querySelector('#audio-error');if(error)error.textContent='声音暂时没有播放出来，可以再点一次喇叭。';return false;}
  }clip=null;return true;
 }
 window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('garden-audio-start',e=>{if(e.detail!=='literacy')stop();});
 globalThis.LiteracyAudio={stop,play};
})();
