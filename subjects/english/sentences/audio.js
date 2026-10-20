(()=>{let current=null,cancel=null,generation=0;const listeners=new Set();
 function stop(){generation++;current?.pause();current=null;cancel?.();cancel=null;listeners.forEach(fn=>fn(null));}
 let enabled=()=>true;
 async function play(clips){stop();if(!enabled()||document.hidden)return false;window.dispatchEvent(new CustomEvent('garden-audio-start',{detail:'english-sentences'}));const token=generation;const error=document.querySelector('#sentence-audio-error');if(error)error.textContent='';
  for(const entry of clips){if(token!==generation||document.hidden)return false;const src=typeof entry==='string'?entry: 'sentences/audio/'+((entry.language||'en')==='en'?'annie-v1/':'')+GardenSentenceCatalog.clip(entry.text,entry.language||'en')+'.mp3';listeners.forEach(fn=>fn(src));const a=new Audio(src);current=a;const ok=await new Promise(resolve=>{let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timer);a.onended=a.onerror=null;if(cancel===abort)cancel=null;resolve(value);};const abort=()=>finish(false);cancel=abort;const timer=setTimeout(()=>{a.pause();finish(false);},60000);a.onended=()=>finish(true);a.onerror=()=>finish(false);a.play().catch(()=>finish(false));});if(token!==generation)return false;if(!ok){a.pause();current=null;listeners.forEach(fn=>fn(null));if(error)error.textContent='声音暂时没有播放出来，点喇叭再试一次。';return false;}}
  current=null;listeners.forEach(fn=>fn(null));return true;
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);window.addEventListener('garden-audio-start',e=>{if(e.detail!=='english-sentences')stop();});globalThis.GardenSentenceAudio={stop,play,configure(fn){enabled=fn;},subscribe(fn){listeners.add(fn);}};
})();
