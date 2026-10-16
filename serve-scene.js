/* The ledger has already committed before this purely visual delivery starts. */
(()=>{let active=null;const stop=()=>active?.();
 function play(dish,origin,target){stop();if(!target)return;target.closest('.table-dish')?.classList.remove('just-served');const end=target.getBoundingClientRect(),size=end.width;if(!size)return;let done=false,animation=null,flight=null;
  const clean=(focus=false)=>{if(done)return;done=true;animation?.cancel();flight?.remove();target.classList.remove('is-receiving');target.closest('.table-dish')?.classList.add('serving-arrival');setTimeout(()=>target.closest('.table-dish')?.classList.remove('serving-arrival'),450);active=null;if(focus&&target.isConnected)target.focus({preventScroll:true});};
  active=()=>clean();
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){clean(true);return;}
  const x=Math.max(0,Math.min(innerWidth-size,(origin?.left||innerWidth/2)+(origin?.width||0)*.55-size/2)),y=Math.max(70,Math.min(innerHeight-size,(origin?.top||innerHeight/2)+(origin?.height||0)*.5-size/2));
  flight=document.createElement('div');flight.className='serving-flight';flight.setAttribute('aria-hidden','true');flight.style.width=size+'px';flight.innerHTML=`<img src="assets/dishes/table/${dish.id}.webp" alt="" draggable="false">${GardenCookingPlay.steam(dish.method)}`;document.body.append(flight);target.classList.add('is-receiving');
  const tx=end.left,ty=end.top;animation=flight.animate([{transform:`translate(${x}px,${y}px) scale(1.1)`,opacity:0},{offset:.18,transform:`translate(${x}px,${y-18}px) scale(1.1)`,opacity:1},{offset:.64,transform:`translate(${(x+tx)/2}px,${Math.max(40,Math.min(y,ty)-40)}px) scale(1.06)`,opacity:1},{transform:`translate(${tx}px,${ty}px) scale(1)`,opacity:1}],{duration:850,easing:'cubic-bezier(.24,.7,.25,1)',fill:'forwards'});
  animation.finished.then(()=>clean(true),()=>clean());
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);globalThis.GardenServing={play,stop};
})();
