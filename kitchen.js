(() => {
 const r=GardenRewards,$=id=>document.getElementById(id);let animal='chicken',feed='feed',filter='全部',dish=null,selected=new Set(),phase=0,token='',side='',cooking={count:0};
 const groups=['全部','可以做','未点亮','蔬菜','蛋奶','禽肉','鱼鲜','肉香'];
 const methods={蒸:'♨️',煮:'🥘',炒:'🍳',烤:'🔥',拌:'🥗',煎:'🍳',炖:'🍲'};
 const ingredientArt=i=>i.source==='crop'?`<img class="ingredient-photo" src="assets/produce/${i.id}.webp" data-produce="${i.id}" alt="" decoding="async">`:`<span class="ingredient-symbol">${i.symbol}</span>`;
 function button(id,label,fn,disabled=false){const b=document.createElement('button');b.id=id;b.textContent=label;b.disabled=disabled;b.onclick=e=>{if(e.detail<2)fn();};return b;}
 function run(action,index,id){const res=r.homeAction(action,index,id);$('home-message').textContent=res.ok?res.message:res.error;render();}
 function render(){
  const focus=document.activeElement?.id,s=r.kitchenState(),h=s.homestead,f=s.farm;
  $('home-balance').textContent=s.error||`⭐ ${s.balance} 颗星星`;
  const medals=Object.values(h.cooked).filter(n=>n>0).length;
  $('medal-count').textContent=`🏅 ${medals} / ${r.recipes.length} 枚勋章`;$('dish-progress').textContent=`点亮 ${medals} / ${r.recipes.length} 道菜`;
  const served=r.recipes.filter(d=>(h.cooked[d.id]||0)>0);$('table-count').textContent=`已上桌 ${served.length} 道菜 · 共做了 ${Object.values(h.cooked).reduce((a,b)=>a+b,0)} 份`;
  $('family-dishes').replaceChildren();$('table-empty').hidden=served.length>0;
  for(const d of served){const plate=document.createElement('article');plate.className='table-dish';plate.dataset.dish=d.id;plate.innerHTML=`<div class="table-plate"><img src="${d.image}" alt="${d.name}" loading="lazy" decoding="async">${GardenCookingPlay.steam(d.method)}</div><strong>${d.name}</strong><small>做过 ${h.cooked[d.id]} 次</small>`;$('family-dishes').append(plate);}
  $('food-stock').replaceChildren();for(const i of r.ingredients){const n=i.source==='crop'?f.harvest[i.id]:h.ingredients[i.id],el=document.createElement('div');el.className='food-item'+(n?' in-stock':'');el.innerHTML=`<span class="basket-quantity" aria-label="可用 ${n} 份">× ${n}</span><span class="produce-basket" aria-hidden="true"><img class="basket-body" src="assets/market/produce-basket.webp" alt="">${ingredientArt(i)}</span><strong>${i.name}</strong><small>× ${n}</small>`;$('food-stock').append(el);}
  $('recipe-filters').replaceChildren();for(const name of groups){const b=button('filter-'+name,name,()=>{filter=name;render();});b.setAttribute('aria-pressed',filter===name);$('recipe-filters').append(b);}
  $('recipe-list').replaceChildren();const list=r.recipes.filter(d=>filter==='全部'||(filter==='可以做'&&!r.missing(s,d).length)||(filter==='未点亮'&&!h.cooked[d.id])||d.group===filter);
  for(const d of list){const done=h.cooked[d.id]||0,lack=r.missing(s,d),el=document.createElement('article');el.className='recipe'+(done?' unlocked':'');
   el.innerHTML=`<div class="dish-photo"><img src="${d.image}" alt="${d.name}的成品效果图" width="1024" height="1024" loading="lazy" decoding="async">${done?'<span class="photo-medal" aria-label="勋章已点亮">🏅</span>':''}</div><span class="recipe-tag">${d.group} · ${d.method}</span><h3>${d.name}</h3><p>${Object.keys(d.needs).map(id=>{const i=r.ingredients.find(i=>i.id===id);return '<span class="recipe-ingredient">'+ingredientArt(i)+' '+i.name+'</span>';}).join(' + ')}</p><small>${done?'勋章已点亮 · 做过 '+done+' 次':'勋章待点亮'}</small><p class="recipe-stock">${lack.length?'还缺：'+lack.map(i=>i.name+' × '+i.quantity).join('、'):'食材齐啦，可以开工！'}</p>`;
   if(d.id==='dish-51'){const origin=document.createElement('p');origin.className='recipe-origin';origin.textContent='农场准备：种草莓，养鸡取蛋，养牛取奶。';el.append(origin);}
   el.append(button('recipe-'+d.id,lack.length?'看看菜谱':'👩‍🍳 开始做菜',()=>openDish(d),!!s.error));$('recipe-list').append(el);
  }
  if(!list.length){const p=document.createElement('p');p.textContent='这一页还没有菜谱。先去农场收获、牧场领取食材，再回来看看吧！';$('recipe-list').append(p);}
  if(s.error)$('home-message').textContent=s.error;
  if(focus)document.getElementById(focus)?.focus({preventScroll:true});
  if($('cook-dialog').open&&dish)drawCook();
 }
 function openDish(d){dish=d;selected=new Set();phase=0;token=crypto.randomUUID();side='';cooking={count:0};$('cook-feedback').textContent='';drawCook();$('cook-dialog').showModal();}
 function drawCook(){
  const s=r.kitchenState(),lack=r.missing(s,dish),screen=$('cook-screen');screen.replaceChildren();
  const top=document.createElement('div');top.innerHTML=`<p class="eyebrow">小厨师的料理小冒险</p><h2 id="cook-title">${dish.name}</h2>${phase<2?`<img class="cook-dish-photo" src="${dish.image}" alt="${dish.name}的成品效果图" width="1024" height="1024">`:""}<p class="cook-steps">${phase===0?'① 配好食材':phase===1?'② 选对做法':phase===2?'③ '+GardenCookingPlay.describe(dish.method).energy+' · 20 格':'🏅 做菜完成'}</p>`;screen.append(top);if(dish.id==='dish-51'){const origin=document.createElement('p');origin.className='recipe-origin';origin.innerHTML='需要种植 <strong>草莓</strong>，养 <strong>鸡</strong>取鸡蛋，养 <strong>牛</strong>取牛奶。面粉、糖、黄油和淡奶油由厨房提供。';screen.append(origin);}
  if(phase===3){const el=document.createElement('div');el.className='dish-finish';el.innerHTML=`<div class="served-preview"><img src="${dish.image}" alt="刚端出来的${dish.name}">${GardenCookingPlay.steam(dish.method)}</div><h3>🏅 ${dish.name}做好啦！</h3><p>菜已经端到家里的餐桌上啦！这枚菜品勋章也会一直保留。</p>`;screen.append(el);screen.append(button('finish-cook','去看家里的餐桌',()=>{$('cook-dialog').close();$('family-table').scrollIntoView({block:'start'});$('table-title').focus({preventScroll:true});}));return;}
  if(lack.length){const p=document.createElement('p');p.textContent='还缺：'+lack.map(i=>i.name+' × '+i.quantity).join('、');screen.append(p);const links=document.createElement('p');links.innerHTML='<a href="rewards.html">🌱 去种植收获</a>　<a href="rewards.html#ranch" id="go-ranch">🐮 去养殖领取</a>';screen.append(links);links.querySelector('#go-ranch').onclick=()=>{$('cook-dialog').close();};return;}
  if(phase===0){
   const p=document.createElement('p');p.textContent='照着菜谱，把这些食材放进料理盆，每种一份。';screen.append(p);
   const tray=document.createElement('div');tray.className='ingredient-tray';
   for(const id of Object.keys(dish.needs)){const i=r.ingredients.find(i=>i.id===id),b=button('ingredient-'+id,`${i.symbol} ${i.name} × 1${selected.has(id)?' ✓':''}`,()=>{selected.add(id);$('cook-feedback').textContent=i.name+'放进料理盆啦！';drawCook();},selected.has(id));b.innerHTML=ingredientArt(i)+`<span>${i.name} × 1${selected.has(id)?' ✓':''}</span>`;tray.append(b);}screen.append(tray);
   const bowl=document.createElement('div');bowl.className='mixing-bowl';bowl.innerHTML=selected.size?[...selected].map(id=>ingredientArt(r.ingredients.find(i=>i.id===id))).join(' '):'🥣';bowl.setAttribute('aria-label','料理盆里有 '+selected.size+' 种食材');screen.append(bowl);
   if(dish.pantry){const p=document.createElement('p');p.textContent='厨房帮你备好：'+dish.pantry+'和少量调味料（免费）。';screen.append(p);}
   if(dish.sides.length){const label=document.createElement('label');label.className='side-choice';label.textContent='加一点农场配料（可选，每种一份）';const select=document.createElement('select');select.id='side-choice';select.append(new Option('这次不加配料',''));for(const id of dish.sides){const c=r.crops.find(c=>c.id===id),n=s.farm.harvest[id],o=new Option(`${c.name} · 库存 ${n} 份`,id);o.disabled=n<1;select.append(o);}select.value=side;select.onchange=e=>{side=e.target.value;};label.append(select);screen.append(label);}
   screen.append(button('mix-food','🥄 搅一搅，准备好啦',()=>{phase=1;$('cook-feedback').textContent='看看菜谱：这道菜要“'+dish.method+'”。';drawCook();},selected.size!==Object.keys(dish.needs).length));
  }else if(phase===1){const p=document.createElement('p');p.textContent='菜谱小提示：用“'+dish.method+'”的方法，让食材变成这道菜。';screen.append(p);const grid=document.createElement('div');grid.className='method-grid';for(const [name,icon] of Object.entries(methods))grid.append(button('method-'+name,icon+' '+name,()=>{if(name!==dish.method){$('cook-feedback').textContent='换一种做法试试吧！这道菜需要“'+dish.method+'”。';return;}phase=2;$('cook-feedback').textContent=GardenCookingPlay.describe(dish.method).tip;drawCook();}));screen.append(grid);
  }else{
   const caption=document.createElement('p');caption.className='ready-caption';caption.id='cooking-ready';caption.hidden=cooking.count<20;caption.textContent='✨ '+GardenCookingPlay.describe(dish.method).energy+'满啦！'+dish.name+'可以上桌了。';
   GardenCookingPlay.mount(screen,{dish,state:cooking,ingredients:r.ingredients,ingredientArt,side,onChange:count=>{const serve=$('serve-dish');if(serve)serve.disabled=count<20;caption.hidden=count<20;}});screen.append(caption);
   const p=document.createElement('p');p.textContent='端上桌时使用菜谱里的食材各一份。'+(side?'另外搭配 '+r.crops.find(c=>c.id===side).name+'一份。':'');screen.append(p);
   screen.append(button('serve-dish','🍽️ 端到家里的餐桌',()=>{if(cooking.count<20)return;const result=r.homeAction('cook',null,dish.id,token,side);$('cook-feedback').textContent=result.ok?result.message:result.error;if(result.ok){phase=3;$('home-message').textContent=dish.name+'上桌啦！'+(dish.method==='拌'?'清爽可口，':'热气腾腾，')+'家里又多了一道菜。';render();}else drawCook();},cooking.count<20));
  }
 }
 $('close-cook').onclick=()=>$('cook-dialog').close();$('cook-dialog').addEventListener('close',()=>{GardenCookingPlay.dispose($('cook-screen'));dish=null;});
 render();window.addEventListener('storage',render);window.addEventListener('pageshow',render);
window.addEventListener('garden-rewards-changed',render);
})();
