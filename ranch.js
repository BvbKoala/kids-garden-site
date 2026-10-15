(() => {
 const r=GardenRewards,$=id=>document.getElementById(id);let animal='chicken',feed='feed';const busy=new Set();
 const image=(id,alt,cls='')=>`<img src="assets/ranch/${id}.webp" alt="${alt}" class="${cls}" decoding="async">`;
 function button(id,label,fn,disabled=false,icon){const b=document.createElement('button');b.id=id;if(icon)b.innerHTML=image(icon,'','action-icon')+'<span>'+label+'</span>';else b.textContent=label;b.disabled=disabled;b.onclick=e=>{if(e.detail<2)fn();};return b;}
 function run(action,index,id){if(busy.has(index))return;const res=r.homeAction(action,index,id);$('ranch-message').textContent=res.ok?res.message:res.error;if(!res.ok)GardenFarmFX.shortage(res.error);
  if(res.ok&&Number.isInteger(index)){busy.add(index);render();const kind=action.startsWith('collect-')?'harvest':action;GardenFarmFX.show($('pen-'+index),kind);setTimeout(()=>{busy.delete(index);render();},1100);}else render();
 }
 function render(){const s=r.kitchenState(),h=s.homestead,f=s.farm,focus=document.activeElement?.id;
  $('ranch-stock').innerHTML=image('feed','','stock-icon')+'<span>饲料 × '+h.feed+'</span>'+image('water','','stock-icon')+'<span>水 × '+f.water+'</span>';
  function choice(group,id,name,quantity,src,selected,onSelect){
   const b=document.createElement('button');b.type='button';b.id=group+'-'+id;b.className='pocket-card'+(quantity?'':' empty');b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',name+'，现有 '+quantity+'，'+(selected?'已选中':'点击选择'));
   b.innerHTML=`<img src="${src}?v=1.10.1" alt="${name}" width="85" height="75" decoding="async"><strong>${name}</strong><span class="pocket-count">× ${quantity}</span><span class="pocket-check" aria-hidden="true">${selected?'✓':''}</span>`;b.onclick=()=>{onSelect();render();};return b;
  }
  $('animal-choice').replaceChildren(...r.animals.map(a=>choice('choose-animal',a.id,a.name+'宝宝',h.animals[a.id],'assets/ranch/'+a.id+'.webp',animal===a.id,()=>{animal=a.id;})));
  $('feed-choice').replaceChildren(...['feed','corn','carrot','pumpkin'].map(id=>{const name=id==='feed'?'饲料':r.crops.find(c=>c.id===id).name;return choice('choose-feed',id,name,id==='feed'?h.feed:f.harvest[id],id==='feed'?'assets/ranch/feed.webp':'assets/produce/'+id+'.webp',feed===id,()=>{feed=id;});}));
  $('pens').replaceChildren();for(let i=0;i<4;i++){
   const p=h.pens[i],a=r.animals.find(a=>a.id===p?.animal),isPond=(a?.id||animal)==='fish',el=document.createElement('article');el.id='pen-'+i;el.className='pen ranch-plot'+(isPond?' pond':'')+(p?.stage===3?' grown':'');
   const ready=p?.stage===3&&a?.extra&&(p.productionFeeds===undefined||p.productionFeeds===3),producing=p?.stage===3&&a?.extra&&!ready;
   const product=a?.extra&&r.ingredients.find(x=>x.id===a.extra);
   el.innerHTML=`<div class="pen-stage" aria-label="${i+1}号${isPond?'池塘':'围栏'}${a?'，住着'+a.name:'，空位'}"><span class="pen-sign">${i+1}号${isPond?'池塘':'围栏'}</span>${image(isPond?'pond':'pen',isPond?'石头边小池塘':'木围栏和草地','pen-ground')}${a?image(a.id,a.name+'伙伴','animal-art animal-stage-'+p.stage):'<span class="empty-pen-label">欢迎入住</span>'}${ready?`<button type="button" class="pen-product" id="product-${i}" aria-label="收获${product.name}，1份" ${busy.has(i)||s.error?'disabled':''}><img src="assets/ranch/${a.extra.toLowerCase().includes('egg')?'eggs-ready':'milk-ready'}.webp" alt="${product.name}"><span>${product.name} × 1 · 点击收获</span></button>`:''}${p?.stage===3&&(!a.extra||ready)?'<span class="ready-spark" aria-hidden="true">✦</span>':''}</div><div class="pen-info"><h3>${a?a.name+'伙伴':'欢迎小伙伴'}</h3><p>${p?(producing?'成年伙伴 · 再产喂养 '+p.productionFeeds+'/3':['幼崽 · 先喂食','成长中 · 接着添水','快长大啦 · 再喂食',ready?'成年 · 蛋奶待收获':'成年 · 可以收获'][p.stage]):'选动物，再点入住'}</p><div class="pen-actions"></div></div>`;
   const actions=el.querySelector('.pen-actions'),locked=!!s.error||busy.has(i);
   if(ready)el.querySelector('.pen-product').onclick=()=>run('collect-extra',i);
   if(!p)actions.append(button('adopt-'+i,'入住',()=>run('adopt',i,animal),locked||!h.animals[animal],'pen'));
   else if(p.stage<3){const water=p.stage===1;actions.append(button('care-'+i,water?'添水':'喂食',()=>run(water?'water':'feed',i,feed),locked,water?'water':'feed'));}
   else{if(producing)actions.append(button('care-'+i,`喂养 · ${p.productionFeeds}/3`,()=>run('feed',i,feed),locked,'feed'));actions.append(button('meat-'+i,`领取${r.ingredients.find(x=>x.id===a.meat).name} × 2`,()=>run('collect-meat',i),locked,'harvest'));if(ready)actions.append(button('extra-'+i,`收${r.ingredients.find(x=>x.id===a.extra).name} × 1`,()=>run('collect-extra',i),locked,'harvest'));}
   $('pens').append(el);
  }
  $('animal-shop').replaceChildren();for(const a of [...r.animals,r.feedSupply]){const el=document.createElement('article');el.innerHTML=image(a.id,a.name,'shop-animal')+`<strong>${a.name}${a.id==='feed'?'':'宝宝'}</strong>`;el.append(button('ranch-buy-'+a.id,`⭐ ${a.cost} · 兑换`,()=>GardenPurchase.open({kind:'ranch',id:a.id,name:a.name+(a.id==='feed'?'':'宝宝'),cost:a.cost,quantity:a.quantity||1,unit:a.id==='feed'?'份':'只',packLabel:'组',image:'assets/ranch/'+a.id+'.webp',onResult:result=>{$('ranch-message').textContent=result.message;render();}}),!!s.error||s.balance<a.cost));$('animal-shop').append(el);}
  if(s.error)$('ranch-message').textContent=s.error;
  if(focus)document.getElementById(focus)?.focus({preventScroll:true});
 }
 render();window.addEventListener('storage',render);window.addEventListener('pageshow',render);window.addEventListener('garden-rewards-changed',render);
})();
