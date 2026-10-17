(() => {
  const r=GardenRewards,$=id=>document.getElementById(id);
  let tool='plant',seed=null,cropGroup='全部',query='';
  const toolList=[['plant','🌱','播种'],['water','💧','浇水'],['fertilize','🪴','施肥'],['harvest','🖐️','收获']];
  const cropPhoto=(id,stage,alt,cls='')=>`<img src="assets/plants/${id}-${stage}.webp" alt="${alt}" class="crop-photo ${cls}" data-crop="${id}" data-growth-stage="${stage}" decoding="async" loading="${['market-crop','store-crop'].includes(cls)?'lazy':'eager'}">`;
  const producePhoto=(id,alt,cls='')=>`<img src="assets/produce/${id}.webp" alt="${alt}" class="crop-photo ${cls}" data-crop="${id}" data-produce="harvested" decoding="async" loading="${['market-crop','store-crop'].includes(cls)?'lazy':'eager'}">`;
  const hints={plant:'选一种种子，再点空菜地。',water:'点还没成熟的作物，浇水长大一步。',fertilize:'点作物，补充营养长大两步。每块地只能施一次肥。',harvest:'点金黄色的成熟菜地，把收成送到食材仓库。'};
  function chooseSeed(id){const state=r.farmState();if(state.error||!state.farm.seeds[id])return;seed=id;tool='plant';$('seed-dialog').close();render();$('reward-message').textContent='选好了 '+r.crops.find(c=>c.id===id).name+'，点一块空地播种吧！';}
  function act(action,index,id){const harvested=action==='harvest'?r.farmState().farm.plots[index]?.crop:null;const result=r.farmAction(action,index,id);$('reward-message').textContent=result.ok?result.message:result.error;if(!result.ok)GardenFarmFX.shortage(result.error);render();if(result.ok&&['plant','water','fertilize','harvest'].includes(action))GardenFarmFX.show($('plot-'+index),action,{crop:harvested});if(result.ok&&action==='harvest'){$('harvest-total').classList.remove('celebrate');void $('harvest-total').offsetWidth;$('harvest-total').classList.add('celebrate');}}
  function render(){
    const focused=document.activeElement?.id,s=r.farmState(),f=s.farm;
    $('balance').textContent=s.error||`⭐ ${s.balance} 颗星星`;
    $('inventory').textContent=`💧 水 ${f.water}　🪴 肥料 ${f.fertilizer}`;
    $('tools').replaceChildren();
    const seedTotal=Object.values(f.seeds).reduce((a,b)=>a+b,0);
    for(const [id,icon,name] of toolList){const b=document.createElement('button');b.id='tool-'+id;b.className='tool';const count=id==='plant'?seedTotal:id==='water'?f.water:id==='fertilize'?f.fertilizer:f.plots.filter(p=>p?.stage===3).length;
      const art='<img src="assets/ranch/'+(id==='water'?'water':id==='harvest'?'harvest':id==='fertilize'?'fertilizer':'feed')+'.webp" alt="">';
      b.innerHTML='<span class="tool-icon" aria-hidden="true">'+art+'</span><strong>'+name+'</strong><small>× '+count+'</small>';b.setAttribute('aria-label',name+'，'+count+(id==='plant'?'包种子':id==='harvest'?'块成熟菜地':'份'));b.setAttribute('aria-pressed',tool===id);b.disabled=!!s.error;const empty=(id==='plant'||id==='water'||id==='fertilize')&&!count;b.classList.toggle('empty-tool',empty);b.onclick=()=>{tool=id;render();if(empty)$('reward-message').textContent=GardenFarmFX.warn(id==='plant'?'seeds':id==='fertilize'?'fertilizer':'water');if(id==='plant')$('seed-dialog').showModal();};$('tools').append(b);}
    $('tool-hint').innerHTML=tool==='plant'&&seed?producePhoto(seed,'','hint-crop')+' 已选 '+r.crops.find(c=>c.id===seed).name+' · '+f.seeds[seed]+' 包 · 点空地播种':hints[tool];$('seed-choice').replaceChildren();
    const placeholder=new Option('请选择有库存的种子','');placeholder.disabled=true;placeholder.selected=!seed;$('seed-choice').append(placeholder);
    $('seed-grid').replaceChildren();
    for(const group of r.cropGroups.filter(g=>g!=='全部')){const optgroup=document.createElement('optgroup');optgroup.label=group;$('seed-choice').append(optgroup);for(const c of r.crops.filter(c=>c.group===group)){const count=f.seeds[c.id],option=document.createElement('option');option.value=c.id;option.textContent=`${c.name} · ${count} 包`;option.selected=seed===c.id;option.disabled=count<1||!!s.error;optgroup.append(option);
      const b=document.createElement('button');b.id='seed-'+c.id;b.className='seed-card';b.innerHTML=`<span aria-hidden="true">${producePhoto(c.id,'')}</span><strong>${c.name}</strong><small>× ${count} 包</small>`;b.disabled=count<1||!!s.error;b.setAttribute('aria-pressed',seed===c.id);b.onclick=()=>chooseSeed(c.id);$('seed-grid').append(b);
    }}
    $('seed-choice').onchange=e=>chooseSeed(e.target.value);
    $('plots').replaceChildren();
    for(let i=0;i<6;i++){
      const p=f.plots[i],c=r.crops.find(c=>c.id===p?.crop),b=document.createElement('button');b.id='plot-'+i;b.className='plot'+(p?.stage===3?' ready':'');
      const stage=p?(c.stages||['刚播种','小芽芽','长大啦','成熟啦'])[p.stage]:'空菜地';
      b.innerHTML=`<span class="plot-number">${i+1} 号地</span><span class="crop-art" aria-hidden="true">${p?cropPhoto(c.id,p.stage,c.name+' · '+stage):'＋'}</span><strong>${c?.name||'种点什么？'}</strong><span class="stage">${stage}${p?' · '+p.stage+'/3':''}</span>${p?`<span data-growth-clock='${JSON.stringify(p)}'>${GardenGrowthUI.markup(p)}</span>`:''}`;
      b.setAttribute('aria-label',`${i+1}号菜地 · ${c?.name||'空地'} · ${stage} · ${toolList.find(t=>t[0]===tool)[2]}`);b.disabled=!!s.error;
      b.onclick=e=>{if(e.detail>=2)return;if(tool==='plant'&&!seed){if(!seedTotal)$('reward-message').textContent=GardenFarmFX.warn('seeds');$('seed-dialog').showModal();return;}act(tool,i,seed);};$('plots').append(b);
    }
    $('crop-filters').replaceChildren();for(const group of r.cropGroups){const b=document.createElement('button');b.id='crop-filter-'+group;b.textContent=group;b.setAttribute('aria-pressed',cropGroup===group);b.onclick=()=>{cropGroup=group;render();};$('crop-filters').append(b);}
    const filtered=r.supplies.filter(i=>i.kind==='seed'&&((cropGroup==='全部'||i.group===cropGroup)&&i.name.includes(query)));$('crop-results').textContent=`农场共 ${r.crops.length} 种作物 · 当前显示 ${filtered.filter(i=>i.kind).length} 种`;
    $('supplies').replaceChildren();
    for(const item of filtered){
      const el=document.createElement('article');el.className='supply';const b=document.createElement('button');b.id='buy-'+item.id;b.className='shelf-product';
      const art=item.kind?`<span class="packet-art" aria-hidden="true"><img class="packet-paper" src="assets/market/seed-packet.webp" alt="">${producePhoto(item.id,'','market-crop')}<span class="packet-name">${item.name}</span></span>`:`<span class="shelf-tool" aria-hidden="true"><img src="assets/ranch/${item.id==='water'?'water':'fertilizer'}.webp" alt=""></span>`;
      const n=item.kind?f.seeds[item.id]:item.id==='water'?f.water:f.fertilizer;
      b.innerHTML=`<span class="shelf-quantity">× ${n}</span>${art}<strong>${item.name}${item.kind==='seed'?(item.group==='菌菇'?'菌种':'种子'):''}</strong><span class="shelf-price">⭐ ${item.cost} · 兑换</span>`;
      b.title=item.story;b.setAttribute('aria-label',`兑换${item.name} · ${item.cost}颗星星`);b.disabled=!!s.error||s.balance<item.cost;b.onclick=e=>{if(e.detail<2)GardenPurchase.open({kind:'farm',id:item.id,name:item.name+(item.kind==='seed'?'种子':''),cost:item.cost,quantity:item.quantity,unit:item.kind==='seed'?'包':'份',packLabel:'组',image:item.kind?'assets/produce/'+item.id+'.webp':'assets/ranch/'+(item.id==='water'?'water':'fertilizer')+'.webp',onResult:result=>{$('reward-message').textContent=result.message;render();}});};el.append(b);$('supplies').append(el);
    }
    const collected=s.homestead?.cropTotal||f.harvest,total=Object.values(collected).reduce((a,b)=>a+b,0),types=r.crops.filter(c=>collected[c.id]>0).length;
    $('harvest-total').textContent=`🧺 收获 ${total} 份 · 点亮 ${types} / ${r.crops.length} 种作物`;
    $('harvest').replaceChildren();for(const c of [...r.crops].sort((a,b)=>Number(f.harvest[b.id]>0)-Number(f.harvest[a.id]>0))){const el=document.createElement('div');el.className='harvest-item'+(collected[c.id]?' collected':'')+(f.harvest[c.id]===0?' stock-empty':'');el.innerHTML=`<span class="basket-quantity" aria-label="可用 ${f.harvest[c.id]} 份">× ${f.harvest[c.id]}</span><span class="produce-basket" aria-hidden="true"><img class="basket-body" src="assets/market/produce-basket.webp" alt="">${producePhoto(c.id,'','store-crop')}</span><strong>${c.name}</strong><small>${collected[c.id]?'可用 × '+f.harvest[c.id]+' · 累计收获 '+collected[c.id]+' 份':'等你种出来'}</small>${c.id==='wheat'?'<a class="harvest-mill-link" href="kitchen.html#wheat-mill">🌾 去磨面粉</a>':''}`;GardenCommerceVoice.bindStock(el,c.id,f.harvest[c.id],c.name);$('harvest').append(el);}
    $('collection-note').textContent=types===r.crops.length?'🌈 全部作物都点亮啦！你是多彩小农夫！':types>=3?'🌷 三种植物开派对，继续探索不同种子吧！':'收获第一份，开启你的小小植物图鉴。';
    if(s.error)$('reward-message').textContent=s.error;
    if(focused)document.getElementById(focused)?.focus({preventScroll:true});
  }
  if(r.snapshot().farm)$('reward-message').textContent='先看播种口袋里的数量，选择种子或菌种，再点空菜地。';
  $('crop-search').oninput=e=>{query=e.target.value.trim();render();};
  $('close-seeds').onclick=()=>$('seed-dialog').close();
  function showArea(area){const ranch=area==='ranch';document.title=(ranch?'开心牧场':'开心农场')+' · 儿童学习乐园';document.querySelector('.farm-heading h1').textContent=ranch?'开心牧场':'开心农场';document.querySelector('.farm-heading h1+p').textContent=ranch?'照顾小伙伴，收获好食材。':'种下期待，收获快乐。今天想种什么？';$('plant-panel').hidden=ranch;$('ranch').hidden=!ranch;$('farm-tab-plant').setAttribute('aria-pressed',!ranch);$('farm-tab-ranch').setAttribute('aria-pressed',ranch);}
  $('farm-tab-plant').onclick=()=>{showArea('plant');history.replaceState(null,'','#plant');};$('farm-tab-ranch').onclick=()=>{showArea('ranch');history.replaceState(null,'','#ranch');};
  window.addEventListener('hashchange',()=>showArea(location.hash.slice(1)));showArea(location.hash.slice(1));
  for(const link of document.querySelectorAll('.farm-building'))link.addEventListener('click',()=>{const section=document.querySelector(link.getAttribute('href'));requestAnimationFrame(()=>section.focus({preventScroll:true}));});
  GardenFarmFX.attachCursor($('plots'),()=>tool==='harvest'?'<img src="assets/ranch/harvest.webp" alt="">':tool==='plant'?`<img src="assets/market/seed-packet.webp" alt="">${seed?producePhoto(seed,'','cursor-seed'):''}`:`<img src="assets/ranch/${tool==='water'?'water':'fertilizer'}.webp" alt="">`);
  render();window.addEventListener('storage',render);window.addEventListener('pageshow',render);
window.addEventListener('garden-rewards-changed',render);
})();
