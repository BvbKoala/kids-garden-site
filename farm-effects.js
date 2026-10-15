/* Local action sounds and transient visual feedback. Inventory remains in the ledger. */
(() => {
 const key='learning-garden-farm-sound-v1';let enabled=true,playing=null;
 try{enabled=localStorage.getItem(key)!=='off';}catch{}
 const icons={water:'water',feed:'feed',harvest:'harvest',adopt:'pen',plant:'feed',fertilize:'feed'};
 function update(){const button=document.getElementById('ranch-sound');if(button){button.textContent=enabled?'声音：开启':'声音：关闭';button.setAttribute('aria-pressed',String(enabled));}}
 function sound(kind){if(!enabled)return;playing?.pause();playing=new Audio('assets/ranch/sounds/'+(kind==='water'?'water':kind==='harvest'?'harvest':'feed')+'.mp3');playing.volume=.55;playing.play().catch(()=>{});}
 function show(target,kind){if(!target)return;target.classList.remove('action-water','action-feed','action-harvest','action-adopt');void target.offsetWidth;target.classList.add('action-'+kind);
  const burst=document.createElement('div');burst.className='farm-action-burst burst-'+kind;burst.setAttribute('aria-hidden','true');
  const icon=document.createElement('img');icon.src='assets/ranch/'+(icons[kind]||'harvest')+'.webp';icon.alt='';burst.append(icon);
  for(let i=0;i<8;i++){const dot=document.createElement('span');dot.style.setProperty('--i',i);burst.append(dot);}target.append(burst);sound(kind);
  setTimeout(()=>{burst.remove();target.classList.remove('action-'+kind);},1100);
 }
 document.getElementById('ranch-sound')?.addEventListener('click',()=>{enabled=!enabled;if(!enabled){playing?.pause();playing=null;}try{localStorage.setItem(key,enabled?'on':'off');}catch{}update();});
 window.addEventListener('pagehide',()=>playing?.pause());window.addEventListener('storage',e=>{if(e.key===key){enabled=e.newValue!=='off';if(!enabled)playing?.pause();update();}});
 window.GardenFarmFX={show};update();
})();
