/* Local action sounds and transient visual feedback. Inventory remains in the ledger. */
(() => {
 const key='learning-garden-farm-sound-v1';let enabled=true,playing=null,warning=null;
 try{enabled=localStorage.getItem(key)!=='off';}catch{}
 const icons={water:'water',feed:'feed',harvest:'harvest',adopt:'pen',plant:'feed',fertilize:'feed'};
 function update(){const button=document.getElementById('ranch-sound');if(button){button.textContent=enabled?'声音：开启':'声音：关闭';button.setAttribute('aria-pressed',String(enabled));}}
 function sound(kind){if(!enabled)return;warning=null;playing?.pause();playing=new Audio('assets/ranch/sounds/'+(kind==='water'?'water':kind==='harvest'?'harvest':'feed')+'.mp3');playing.volume=.55;playing.play().catch(()=>{});}
 const warnings={water:'清水用完啦，去种子铺兑换一些水吧。',fertilizer:'肥料用完啦，去种子铺兑换一些肥料吧。',seeds:'种子用完啦，去种子铺兑换喜欢的种子吧。',feed:'食物不够啦，去牧场商店兑换饲料，或者收获一些蔬菜吧。'};
 function warn(kind){const text=warnings[kind];if(!text)return '';if(!enabled||warning===kind)return text;playing?.pause();warning=kind;const clip=new Audio('assets/ranch/sounds/need-'+kind+'.mp3');playing=clip;clip.onended=clip.onerror=()=>{if(playing===clip){playing=null;warning=null;}};clip.play().catch(()=>{if(playing===clip){playing=null;warning=null;}});return text;}
 function shortage(error){const kind=/清水用完|清水不够/.test(error)?'water':/肥料用完/.test(error)?'fertilizer':/种子用完/.test(error)?'seeds':/饲料用完|这种作物还没收获/.test(error)?'feed':null;if(kind)warn(kind);}
 function show(target,kind){if(!target)return;target.classList.remove('action-water','action-feed','action-harvest','action-adopt');void target.offsetWidth;target.classList.add('action-'+kind);
  const burst=document.createElement('div');burst.className='farm-action-burst burst-'+kind;burst.setAttribute('aria-hidden','true');
  const icon=document.createElement('img');icon.src='assets/ranch/'+(icons[kind]||'harvest')+'.webp';icon.alt='';burst.append(icon);
  for(let i=0;i<8;i++){const dot=document.createElement('span');dot.style.setProperty('--i',i);burst.append(dot);}target.append(burst);sound(kind);
  setTimeout(()=>{burst.remove();target.classList.remove('action-'+kind);},1100);
 }
 document.getElementById('ranch-sound')?.addEventListener('click',()=>{enabled=!enabled;if(!enabled){playing?.pause();playing=null;warning=null;}try{localStorage.setItem(key,enabled?'on':'off');}catch{}update();});
 window.addEventListener('pagehide',()=>{playing?.pause();playing=null;warning=null;});window.addEventListener('storage',e=>{if(e.key===key){enabled=e.newValue!=='off';if(!enabled){playing?.pause();playing=null;warning=null;}update();}});
 window.GardenFarmFX={show,warn,shortage};update();
})();
