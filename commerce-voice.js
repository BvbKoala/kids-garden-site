/* Local commerce narration; never reads or writes the reward ledger. */
(() => {
 const key='learning-garden-farm-sound-v1',root='assets/commerce/voice/';let generation=0,current=null,cancel=null;
 const enabled=()=>{try{return localStorage.getItem(key)!=='off';}catch{return true;}};
 function stop(){generation++;cancel?.();cancel=null;current?.pause();current=null;}
 async function play(clips){stop();if(!enabled()||document.hidden)return;window.dispatchEvent(new CustomEvent('garden-audio-start',{detail:'commerce'}));const token=generation;
  for(const src of clips){if(token!==generation||!enabled()||document.hidden)return;const audio=new Audio(src);current=audio;const ok=await new Promise(resolve=>{let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);audio.onended=audio.onerror=null;if(current===audio)current=null;if(cancel===abort)cancel=null;resolve(ok);};const abort=()=>{audio.pause();finish(false);};cancel=abort;const timer=setTimeout(abort,15000);audio.onended=()=>finish(true);audio.onerror=()=>finish(false);audio.play().catch(()=>finish(false));});if(!ok)return;}
 }
 const clip=id=>root+id+'.mp3';
 // Chinese place-value speech, including safe large legacy inventory counters.
 function numbers(n,leading=true){if(!Number.isSafeInteger(n)||n<0)return [];if(n<10)return ['n'+n];const split=(base)=>{const a=Math.floor(n/base),b=n%base;return [...numbers(a,leading),'n'+base,...(b?[...(b<base/10?['n0']:[]),...numbers(b,false)]:[])];};if(n>=1e12)return split(1e12);if(n>=1e8)return split(1e8);if(n>=10000)return split(10000);if(n>=1000)return split(1000);if(n>=100)return split(100);return [...(n<20&&leading?[]:['n'+Math.floor(n/10)]),'n10',...(n%10?['n'+n%10]:[])];}
 function itemId(item){return GardenRewards.crops.some(c=>c.id===item.id)?'seed-'+item.id:GardenRewards.animals.some(a=>a.id===item.id)?'baby-'+item.id:item.id;}
 function purchase(item,n,error=''){const qty=n*item.quantity,total=n*item.cost;let ids;if(!Number.isSafeInteger(n)||n<1||!Number.isSafeInteger(qty)||!Number.isSafeInteger(total))ids=['invalid'];else ids=['exchange',itemId(item),...numbers(qty),item.unit==='只'?'animal':item.unit==='包'?'pack':'portion','need',...numbers(total),'stars',...(error?['short']:[])];return play(ids.map(clip));}
 function stock(id,n){return play(['assets/cooking/voice/ingredient-'+id+'.mp3',clip('stock'),...numbers(n).map(clip),clip('portion')]);}
 function bindStock(el,id,n,name){el.dataset.stockTier=n<=0?'empty':n<=5?'low':n<=20?'medium':'high';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',`${name}，仓库里有 ${n} 份，点击听一听`);el.classList.add('stock-speaker');el.addEventListener('click',e=>{if(!e.target.closest('a'))stock(id,n);});el.addEventListener('keydown',e=>{if(e.target===el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();stock(id,n);}});}
 window.addEventListener('garden-audio-start',e=>{if(e.detail!=='commerce')stop();});window.addEventListener('garden-sound-changed',()=>{if(!enabled())stop();});window.addEventListener('storage',e=>{if(e.key===key&&!enabled())stop();});window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 window.GardenCommerceVoice={stop,purchase,stock,bindStock,numbers,dish:id=>play([clip(id)]),success:()=>play(['assets/commerce/exchange.mp3',clip('success')]),failed:()=>play([clip('failed')])};
})();
