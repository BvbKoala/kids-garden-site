/* Local action sounds and transient visual feedback. Inventory remains in the ledger. */
(() => {
 const key='learning-garden-farm-sound-v1';let enabled=true,playing=null,warning=null;
 try{enabled=localStorage.getItem(key)!=='off';}catch{}
 const icons={water:'water',feed:'feed',harvest:'harvest',adopt:'pen',plant:'feed',fertilize:'feed'};
 function update(){const button=document.getElementById('ranch-sound');if(button){button.textContent=enabled?'声音：开启':'声音：关闭';button.setAttribute('aria-pressed',String(enabled));}}
 function sound(kind){if(!enabled)return;warning=null;playing?.pause();playing=new Audio('assets/ranch/sounds/'+(kind==='water'?'water':kind==='harvest'?'harvest':'feed')+'.mp3');playing.volume=.55;playing.play().catch(()=>{});}
 const warnings={water:'清水用完啦，去补给兑换站兑换一些水吧。',fertilizer:'肥料用完啦，去补给兑换站兑换一些肥料吧。',seeds:'种子用完啦，去种子铺兑换喜欢的种子吧。',feed:'食物不够啦，去补给兑换站兑换饲料，或者收获一些蔬菜吧。'};
 function warn(kind){const text=warnings[kind];if(!text)return '';if(!enabled||warning===kind)return text;playing?.pause();warning=kind;const clip=new Audio('assets/ranch/sounds/need-'+kind+'.mp3');playing=clip;clip.onended=clip.onerror=()=>{if(playing===clip){playing=null;warning=null;}};clip.play().catch(()=>{if(playing===clip){playing=null;warning=null;}});return text;}
 function shortage(error){const kind=/清水用完|清水不够/.test(error)?'water':/肥料用完/.test(error)?'fertilizer':/种子用完/.test(error)?'seeds':/饲料用完|这种作物还没收获/.test(error)?'feed':null;if(kind)warn(kind);}
 function confirmMeat(animal){if(!enabled||!GardenRewards.animals.some(a=>a.id===animal))return ()=>{};playing?.pause();warning=null;const clip=new Audio('assets/ranch/sounds/confirm-meat-'+animal+'.mp3');playing=clip;clip.play().catch(()=>{});return ()=>{clip.pause();if(playing===clip)playing=null;};}
 function basket(crop){const valid=GardenRewards.crops.some(c=>c.id===crop);return `<span class="filled-harvest-basket"><img class="basket-back" src="assets/ranch/harvest.webp" alt="">${valid?[0,1,2].map(i=>`<img class="basket-fruit fruit-${i}" src="assets/produce/${crop}.webp" alt="">`).join(''):''}<img class="basket-front" src="assets/ranch/harvest.webp" alt=""></span>`;}
 function attachCursor(surface,resolve){if(!surface)return;const cursor=document.createElement('div');cursor.className='farm-tool-cursor';cursor.setAttribute('aria-hidden','true');cursor.hidden=true;document.body.append(cursor);let active=null,art='';
  const hide=()=>{cursor.hidden=true;active?.classList.remove('farm-cursor-active');active=null;};
  surface.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!matchMedia('(hover:hover) and (pointer:fine)').matches||document.querySelector('dialog[open]')){hide();return;}const target=e.target.closest('.plot,.pen');if(!target||!surface.contains(target)){hide();return;}const next=resolve(target);if(!next){hide();return;}if(active!==target){active?.classList.remove('farm-cursor-active');active=target;active.classList.add('farm-cursor-active');}if(next!==art){cursor.innerHTML=next;art=next;}cursor.style.left=Math.min(innerWidth-68,Math.max(0,e.clientX+10))+'px';cursor.style.top=Math.min(innerHeight-68,Math.max(0,e.clientY+10))+'px';cursor.hidden=false;});
  surface.addEventListener('pointerleave',hide);surface.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')hide();});window.addEventListener('garden-rewards-changed',hide);window.addEventListener('blur',hide);window.addEventListener('scroll',hide,{passive:true,capture:true});window.addEventListener('pagehide',hide);document.addEventListener('visibilitychange',hide);document.addEventListener('pointerdown',e=>{if(!surface.contains(e.target))hide();},true);
 }
 function show(target,kind,options={}){if(!target)return;target.classList.remove('action-water','action-feed','action-harvest','action-adopt');void target.offsetWidth;target.classList.add('action-'+kind);
  const burst=document.createElement('div');burst.className='farm-action-burst burst-'+kind;burst.setAttribute('aria-hidden','true');
  if(kind==='harvest'&&options.crop){const load=document.createElement('div');load.className='harvest-load';load.innerHTML=basket(options.crop);burst.append(load);}else{const icon=document.createElement('img');icon.src='assets/ranch/'+(icons[kind]||'harvest')+'.webp';icon.alt='';burst.append(icon);}
  for(let i=0;i<8;i++){const dot=document.createElement('span');dot.style.setProperty('--i',i);burst.append(dot);}target.append(burst);sound(kind);
  setTimeout(()=>{burst.remove();target.classList.remove('action-'+kind);},1100);
 }
 document.getElementById('ranch-sound')?.addEventListener('click',()=>{enabled=!enabled;if(!enabled){playing?.pause();playing=null;warning=null;}try{localStorage.setItem(key,enabled?'on':'off');}catch{}update();});
 window.addEventListener('pagehide',()=>{playing?.pause();playing=null;warning=null;});window.addEventListener('storage',e=>{if(e.key===key){enabled=e.newValue!=='off';if(!enabled){playing?.pause();playing=null;warning=null;}update();}});
 window.GardenFarmFX={show,warn,shortage,basket,attachCursor,confirmMeat};update();
})();
