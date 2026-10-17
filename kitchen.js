(() => {
 const r=GardenRewards,goal=GardenCookingPlay.goal,voice=GardenKitchenVoice,$=id=>document.getElementById(id);let animal='chicken',feed='feed',filter='全部',query='',dish=null,selected=new Set(),phase=0,token='',side='',cooking={count:0},lastNarration='',justAdded=null,serving=false,servedClose=false;
 const groups=['全部','可以做','未点亮','蔬菜','蛋奶','禽肉','鱼鲜','肉香','甜品'];
 const methods={蒸:'♨️',煮:'🥘',炒:'🍳',烤:'🔥',拌:'🥗',煎:'🍳',炖:'🍲'};
 const ingredientArt=i=>i.source!=='animal'?`<img class="ingredient-photo" src="assets/produce/${i.id}.webp" data-produce="${i.id}" alt="" decoding="async">`:`<span class="ingredient-symbol">${i.symbol}</span>`;
 function button(id,label,fn,disabled=false){const b=document.createElement('button');b.id=id;b.textContent=label;b.disabled=disabled;b.onclick=e=>{if(e.detail<2)fn();};return b;}
 function run(action,index,id){const res=r.homeAction(action,index,id);$('home-message').textContent=res.ok?res.message:res.error;render();}
 function render(){
  const focus=document.activeElement?.id,s=r.kitchenState(),h=s.homestead,f=s.farm;
  $('home-balance').textContent=s.error||`⭐ ${s.balance} 颗星星`;
  const medals=Object.values(h.cooked).filter(n=>n>0).length;
  $('recipe-count-label').textContent=r.recipes.length+' LITTLE DISHES';
  $('medal-count').textContent=`🏅 ${medals} / ${r.recipes.length} 枚勋章`;$('dish-progress').textContent=`点亮 ${medals} / ${r.recipes.length} 道菜`;
  const served=Object.keys(h.cooked).filter(id=>h.cooked[id]>0).map(id=>r.recipes.find(d=>d.id===id)).filter(Boolean);$('table-count').textContent=`餐桌 ${Math.min(15,served.length)} 道 · 架子 ${Math.max(0,served.length-15)} 道 · 共做了 ${Object.values(h.cooked).reduce((a,b)=>a+b,0)} 份`;
  GardenTableScene.render(served,h.cooked,{id:phase===3?dish?.id:null,token:phase===3?token:null});
  const stockOf=i=>i.source==='crop'?f.harvest[i.id]:h.ingredients[i.id];
  $('food-stock').replaceChildren();for(const i of [...r.ingredients].sort((a,b)=>Number(stockOf(b)>0)-Number(stockOf(a)>0))){const n=i.source==='crop'?f.harvest[i.id]:h.ingredients[i.id],el=document.createElement('div');el.className='food-item'+(n?' in-stock':'');el.innerHTML=`<span class="basket-quantity" aria-label="可用 ${n} 份">× ${n}</span><span class="produce-basket" aria-hidden="true"><img class="basket-body" src="assets/market/produce-basket.webp" alt="">${ingredientArt(i)}</span><strong>${i.name}</strong><small>× ${n}</small>`;GardenCommerceVoice.bindStock(el,i.id,n,i.name);$('food-stock').append(el);}
  $('recipe-filters').replaceChildren();for(const name of groups){const b=button('filter-'+name,name,()=>{filter=name;render();});b.setAttribute('aria-pressed',filter===name);$('recipe-filters').append(b);}
  $('recipe-list').replaceChildren();const list=r.recipes.filter(d=>filter==='全部'||(filter==='可以做'&&!r.missing(s,d).length)||(filter==='未点亮'&&!h.cooked[d.id])||d.group===filter||(filter==='甜品'&&['dish-14','dish-16','dish-19','dish-20','dish-51'].includes(d.id))).filter(d=>!query||d.name.includes(query)||Object.keys(d.needs).some(id=>r.ingredients.find(i=>i.id===id).name.includes(query)));
  for(const d of list){const done=h.cooked[d.id]||0,lack=r.missing(s,d),el=document.createElement('article');el.className='recipe'+(done?' unlocked':'')+(!lack.length?' cookable':'');
   el.innerHTML=`<div class="dish-photo"><img src="${d.image}" alt="${d.name}的成品效果图" width="1024" height="1024" loading="lazy" decoding="async">${done?'<span class="photo-medal" aria-label="勋章已点亮">🏅</span>':''}</div><span class="recipe-tag">${d.group} · ${d.method}</span><h3>${d.name}</h3><p>${Object.keys(d.needs).map(id=>{const i=r.ingredients.find(i=>i.id===id);return '<span class="recipe-ingredient">'+ingredientArt(i)+' '+i.name+'</span>';}).join(' + ')}</p><small>${done?'勋章已点亮 · 做过 '+done+' 次':'勋章待点亮'}</small><p class="recipe-stock">${lack.length?'还缺：'+lack.map(i=>i.name+' × '+i.quantity).join('、'):'食材齐啦，可以开工！'}</p>`;
   if(d.id==='dish-51'){const origin=document.createElement('p');origin.className='recipe-origin';origin.textContent='农场准备：种草莓和小麦，小麦磨成面粉，养鸡取蛋，养牛取奶。';el.append(origin);}
   el.append(button('recipe-'+d.id,lack.length?'看看菜谱':'👩‍🍳 开始做菜',()=>openDish(d),!!s.error));$('recipe-list').append(el);
  }
  if(!list.length){const p=document.createElement('p');p.textContent='这一页还没有菜谱。先去农场收获、牧场领取食材，再回来看看吧！';$('recipe-list').append(p);}
  if(s.error)$('home-message').textContent=s.error;
  if(focus)document.getElementById(focus)?.focus({preventScroll:true});
  if($('cook-dialog').open&&dish&&!serving)drawCook();
 }
 function openDish(d){GardenServing.stop();serving=false;voice.stop();lastNarration='';justAdded=null;dish=d;selected=new Set();phase=0;token=crypto.randomUUID();side='';cooking={count:0};$('cook-feedback').textContent='';drawCook();$('cook-dialog').showModal();}
 function narrate(lack){const key=dish.id+':'+phase+':'+[...selected].join(',')+':'+lack.map(i=>i.id).join(',');if(key===lastNarration)return;lastNarration=key;let clips=[];
  if(lack.length)clips=['missing-ingredients',...lack.map(i=>'ingredient-'+i.id)];
  else if(phase===0){const remaining=Object.keys(dish.needs).filter(id=>!selected.has(id));clips=justAdded?['ingredient-'+justAdded,'ingredient-added']:[];clips.push(...(remaining.length?[justAdded?'next-ingredients':'select-ingredients',...remaining.map(id=>'ingredient-'+id)]:['ingredients-ready']));justAdded=null;}
  else if(phase===1)clips=['method-'+GardenCookingPlay.describe(dish.method).key];
  if(clips.length)voice.play(clips);
 }
 function drawCook(){
  const s=r.kitchenState(),lack=r.missing(s,dish),screen=$('cook-screen');narrate(lack);screen.replaceChildren();
  $('cook-dialog').classList.toggle('cooking-active',phase===2);$('cook-dialog').classList.toggle('cooking-is-ready',phase===2&&cooking.count>=goal);$('cook-dialog').scrollTop=0;
  const top=document.createElement('div');top.innerHTML=`${phase<2?'<p class="eyebrow">小厨师的料理小冒险</p>':''}<h2 id="cook-title">${dish.name}</h2>${phase<2?`<img class="cook-dish-photo" src="${dish.image}" alt="${dish.name}的成品效果图" width="1024" height="1024">`:""}${phase<2?`<p class="cook-steps">${phase===0?'① 配好食材':'② 选对做法'}</p>`:''}`;screen.append(top);if(dish.id==='dish-51'&&phase===0){const origin=document.createElement('p');origin.className='recipe-origin';origin.innerHTML='需要种植 <strong>草莓和小麦</strong>，小麦磨成 <strong>面粉</strong>，养 <strong>鸡</strong>取鸡蛋，养 <strong>牛</strong>取牛奶。糖、黄油和淡奶油由厨房提供。';screen.append(origin);}
  if(lack.length){const p=document.createElement('p');p.textContent='还缺：'+lack.map(i=>i.name+' × '+i.quantity).join('、');screen.append(p);const links=document.createElement('p');links.innerHTML=(lack.some(i=>i.id==='flour')?'<a href="#wheat-mill" id="go-mill">🌾 去小磨坊磨面粉</a>　':'')+'<a href="rewards.html">🌱 去种植收获</a>　<a href="rewards.html#ranch" id="go-ranch">🐮 去养殖领取</a>';screen.append(links);if(links.querySelector('#go-mill'))links.querySelector('#go-mill').onclick=()=>{voice.stop();$('cook-dialog').close();};links.querySelector('#go-ranch').onclick=()=>{$('cook-dialog').close();};return;}
  if(phase===0){
   const p=document.createElement('p');p.textContent='照着菜谱，把这些食材放进料理盆，每种一份。';screen.append(p);
   const tray=document.createElement('div');tray.className='ingredient-tray';
   for(const id of Object.keys(dish.needs)){const i=r.ingredients.find(i=>i.id===id),b=button('ingredient-'+id,`${i.symbol} ${i.name} × 1${selected.has(id)?' ✓':''}`,()=>{selected.add(id);justAdded=id;$('cook-feedback').textContent=i.name+'放进料理盆啦！';drawCook();},selected.has(id));b.innerHTML=ingredientArt(i)+`<span>${i.name} × 1${selected.has(id)?' ✓':''}</span>`;tray.append(b);}screen.append(tray);
   const bowl=document.createElement('div');bowl.className='mixing-bowl';bowl.innerHTML=selected.size?[...selected].map(id=>ingredientArt(r.ingredients.find(i=>i.id===id))).join(' '):'🥣';bowl.setAttribute('aria-label','料理盆里有 '+selected.size+' 种食材');screen.append(bowl);
   if(dish.pantry){const p=document.createElement('p');p.textContent='厨房帮你备好：'+dish.pantry+'和少量调味料（免费）。';screen.append(p);}
   if(dish.sides.length){const label=document.createElement('label');label.className='side-choice';label.textContent='加一点农场配料（可选，每种一份）';const select=document.createElement('select');select.id='side-choice';select.append(new Option('这次不加配料',''));for(const id of dish.sides){const c=r.crops.find(c=>c.id===id),n=s.farm.harvest[id],o=new Option(`${c.name} · 库存 ${n} 份`,id);o.disabled=n<1;select.append(o);}select.value=side;select.onchange=e=>{side=e.target.value;};label.append(select);screen.append(label);}
   screen.append(button('mix-food','🥄 搅一搅，准备好啦',()=>{phase=1;$('cook-feedback').textContent='看看菜谱：这道菜要“'+dish.method+'”。';drawCook();},selected.size!==Object.keys(dish.needs).length));
  }else if(phase===1){const p=document.createElement('p');p.textContent='菜谱小提示：用“'+dish.method+'”的方法，让食材变成这道菜。';screen.append(p);const grid=document.createElement('div');grid.className='method-grid';for(const [name,icon] of Object.entries(methods))grid.append(button('method-'+name,icon+' '+name,()=>{if(name!==dish.method){$('cook-feedback').textContent='换一种做法试试吧！这道菜需要“'+dish.method+'”。';voice.play(['wrong-method','method-'+GardenCookingPlay.describe(dish.method).key]);return;}phase=2;$('cook-feedback').textContent='';drawCook();}));screen.append(grid);
  }else{
   const caption=document.createElement('p');caption.className='ready-caption';caption.id='cooking-ready';caption.hidden=cooking.count<goal;caption.textContent='✨ 做好啦！';
   GardenCookingPlay.mount(screen,{dish,state:cooking,ingredients:r.ingredients,ingredientArt,side,onGuide:cue=>voice.play([cue]),onChange:count=>{const serve=$('serve-dish');if(serve){const newlyReady=serve.disabled&&count>=goal;serve.disabled=count<goal;serve.hidden=count<goal;if(newlyReady)$('cook-feedback').textContent='';}$('cook-dialog').classList.toggle('cooking-is-ready',count>=goal);caption.hidden=count<goal;}});screen.append(caption);
   const serve=button('serve-dish','🍽️ 端上桌',serveDish,cooking.count<goal);serve.hidden=cooking.count<goal;serve.innerHTML=`<img src="assets/dishes/table/${dish.id}.webp" alt=""><span>🍽️ 端上桌</span>`;screen.append(serve);
  }
 }
 function serveDish(){
  if(serving||!dish||phase!==2||cooking.count<goal)return;
  const meal=dish,origin=$('cooking-stage')?.getBoundingClientRect();serving=true;$('serve-dish').disabled=true;
  const result=r.homeAction('cook',null,meal.id,token,side);$('cook-feedback').textContent=result.ok?result.message:result.error;
  if(!result.ok){serving=false;drawCook();return;}
  phase=3;$('home-message').textContent=meal.name+'上桌啦！';render();
  servedClose=true;$('cook-dialog').close();GardenCookingPlay.dispose($('cook-screen'));
  $('family-table').scrollIntoView({block:'start',behavior:'instant'});
  const target=document.querySelector('[data-dish="'+meal.id+'"] .table-plate,[data-dish="'+meal.id+'"] .shelf-plate');if(target?.classList.contains('shelf-plate')){target.scrollIntoView({block:'center',behavior:'instant'});$('home-message').textContent=meal.name+'做好啦！餐桌满了，先放到菜品架上。';}
  GardenServing.play(meal,origin,target);voice.play(['served']);serving=false;
 }
 $('close-cook').onclick=()=>{voice.stop();$('cook-dialog').close();};$('cook-dialog').addEventListener('cancel',()=>voice.stop());$('cook-dialog').addEventListener('close',()=>{if(!servedClose)voice.stop();servedClose=false;lastNarration='';GardenCookingPlay.dispose($('cook-screen'));dish=null;});
 $('cook-repeat').onclick=()=>voice.repeat();$('cook-sound').onclick=()=>voice.toggle();voice.ui();
 $('recipe-search').oninput=e=>{query=e.target.value.trim();render();};
 render();window.addEventListener('storage',render);window.addEventListener('pageshow',render);
window.addEventListener('garden-rewards-changed',render);
})();
