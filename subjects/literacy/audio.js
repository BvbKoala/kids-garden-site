(() => {
  let clip=null,resolveCurrent=null,token=0;
  function stop(){token++;if(clip){clip.pause();clip=null;}if(resolveCurrent){resolveCurrent(false);resolveCurrent=null;}}
  async function play(src,enabled=true){
    stop();if(!enabled)return false;const current=token;clip=new Audio(src);
    const sound=clip;
    const ok=await new Promise(resolve=>{
      let done=false;const finish=success=>{if(done)return;done=true;clearTimeout(timeout);if(resolveCurrent===finish)resolveCurrent=null;resolve(success);};
      resolveCurrent=finish;const timeout=setTimeout(()=>finish(false),20000);
      sound.onended=()=>finish(true);sound.onerror=()=>finish(false);sound.play().catch(()=>finish(false));
    });
    if(current!==token)return false;clip=null;
    if(!ok){const error=document.querySelector('#audio-error');if(error)error.textContent='声音暂时没有播放出来，可以再点一次喇叭。';}
    return ok;
  }
  window.addEventListener('pagehide',stop);
  globalThis.LiteracyAudio={stop,play};
})();
