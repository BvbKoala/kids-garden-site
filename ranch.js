(() => {
 const r=GardenRewards,$=id=>document.getElementById(id);let animal='chicken',feed='feed';const busy=new Set();
 const image=(id,alt,cls='')=>`<img src="assets/ranch/${id}.webp" alt="${alt}" class="${cls}" decoding="async">`;
 function button(id,label,fn,disabled=false,icon){const b=document.createElement('button');b.id=id;if(icon)b.innerHTML=image(icon,'','action-icon')+'<span>'+label+'</span>';else b.textContent=label;b.disabled=disabled;b.onclick=e=>{if(e.detail<2)fn();};return b;}
 function run(action,index,id){if(busy.has(index))return;const res=r.homeAction(action,index,id);$('ranch-message').textContent=res.ok?res.message:res.error;
  if(res.ok&&Number.isInteger(index)){busy.add(index);render();const kind=action.startsWith('collect-')?'harvest':action;GardenFarmFX.show($('pen-'+index),kind);setTimeout(()=>{busy.delete(index);render();},1100);}else render();
 }
 function render(){const s=r.kitchenState(),h=s.homestead,f=s.farm,focus=document.activeElement?.id;
  $('ranch-stock').innerHTML=image('feed','','stock-icon')+'<span>饲料 × '+h.feed+'</span>'+image('water','','stock-icon')+'<span>水 × '+f.water+'</span>';
  $('animal-choice').replaceChildren();for(const a of r.animals){const o=document.createElement('option');o.value=a.id;o.textContent=`${a.name}宝宝 × ${h.animals[a.id]}`;o.selected=a.id===animal;$('animal-choice').append(o);}
  $('animal-choice').onchange=e=>{animal=e.target.value;render();};$('feed-choice').value=feed;$('feed-choice').onchange=e=>{feed=e.target.value;};
  $('pens').replaceChildren();for(let i=0;i<4;i++){
   const p=h.pens[i],a=r.animals.find(a=>a.id===p?.animal),isPond=(a?.id||animal)==='fish',el=document.createElement('article');el.id='pen-'+i;el.className='pen ranch-plot'+(isPond?' pond':'')+(p?.stage===3?' grown':'');
   el.innerHTML=`<div class="pen-stage" aria-label="${i+1}号${isPond?'池塘':'围栏'}${a?'，住着'+a.name:'，空位'}"><span class="pen-sign">${i+1}号${isPond?'池塘':'围栏'}</span>${image(isPond?'pond':'pen',isPond?'石头边小池塘':'木围栏和草地','pen-ground')}${a?image(a.id,a.name+'伙伴','animal-art animal-stage-'+p.stage):'<span class="empty-pen-label">欢迎入住</span>'}${p?.stage===3?'<span class="ready-spark" aria-hidden="true">✦</span>':''}</div><div class="pen-info"><h3>${a?a.name+'伙伴':'欢迎小伙伴'}</h3><p>${p?['刚入住 · 0/3','吃饱啦 · 1/3','喝饱啦 · 2/3','长大啦 · 3/3'][p.stage]:'选动物，再点入住'}</p><div class="pen-actions"></div></div>`;
   const actions=el.querySelector('.pen-actions'),locked=!!s.error||busy.has(i);
   if(!p)actions.append(button('adopt-'+i,'入住',()=>run('adopt',i,animal),locked||!h.animals[animal],'pen'));
   else if(p.stage<3){const water=p.stage===1;actions.append(button('care-'+i,water?'添水':'喂食',()=>run(water?'water':'feed',i,feed),locked,water?'water':'feed'));}
   else{actions.append(button('meat-'+i,`领取${r.ingredients.find(x=>x.id===a.meat).name} × 2`,()=>run('collect-meat',i),locked,'harvest'));if(a.extra)actions.append(button('extra-'+i,`收${r.ingredients.find(x=>x.id===a.extra).name} × 1`,()=>run('collect-extra',i),locked,'harvest'));}
   $('pens').append(el);
  }
  $('animal-shop').replaceChildren();for(const a of [...r.animals,r.feedSupply]){const el=document.createElement('article');el.innerHTML=image(a.id,a.name,'shop-animal')+`<strong>${a.name}${a.id==='feed'?'':'宝宝'}</strong>`;el.append(button('ranch-buy-'+a.id,`⭐ ${a.cost} · 兑换`,()=>run('buy',null,a.id),!!s.error||s.balance<a.cost));$('animal-shop').append(el);}
  if(s.error)$('ranch-message').textContent=s.error;
  if(focus)document.getElementById(focus)?.focus({preventScroll:true});
 }
 render();window.addEventListener('storage',render);window.addEventListener('pageshow',render);window.addEventListener('garden-rewards-changed',render);
})();
