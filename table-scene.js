/* Display-only: never changes cooked counts, ingredients, medals or ledger tokens. */
(()=>{
 const root=document.getElementById('family-dishes'),room=root.closest('.dining-room');
 const pager=document.createElement('nav');pager.className='table-pages';pager.setAttribute('aria-label','餐桌与架子上的菜品数量');room.after(pager);
 const mobile=matchMedia('(max-width:680px)');let items=[],counts={},lastToken='',cancelDrag=null;
 const KEY='learning-garden-table-layout-v1',validIds=new Set(GardenRewards.recipes.map(d=>d.id));
 const blank=()=>({version:1,desktop:{},mobile:{}});let layout=blank(),pending={desktop:{},mobile:{}},blocked=false;
 const controls=document.createElement('div');controls.className='table-arrange-tools';controls.innerHTML='<p id="table-arrange-hint">🖐️ 拖动盘子，摆出喜欢的餐桌 · 也可选中盘子后按方向键移动</p><button id="table-reset" type="button">↺ 恢复这桌摆放</button><p id="table-layout-status" role="status" aria-live="polite"></p>';pager.after(controls);
 const shelf=document.createElement('section');shelf.className='dish-shelf';shelf.id='dish-shelf';shelf.setAttribute('aria-label','菜品架');shelf.innerHTML='<h3>🍽️ 菜品架</h3><p>餐桌摆满 15 道啦，其他美味先放在这里。点一点，听听是什么菜。</p><div class="shelf-dishes"></div>';controls.after(shelf);
 let voiceTimer=null,hoverPlate=null;
 function stopDishVoice(){clearTimeout(voiceTimer);if(hoverPlate)GardenCommerceVoice.stop();hoverPlate=null;}
 function nameOnHover(plate,d){const say=()=>{stopDishVoice();hoverPlate=plate;voiceTimer=setTimeout(()=>{if(hoverPlate===plate&&plate.isConnected&&!document.hidden)GardenCommerceVoice.dish(d.id);},180);};plate.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')say();});plate.addEventListener('focus',say);plate.addEventListener('click',()=>{if(!elDragging(plate))say();});plate.addEventListener('pointerleave',()=>{if(hoverPlate===plate)stopDishVoice();});plate.addEventListener('blur',()=>{if(hoverPlate===plate)stopDishVoice();});}
 const elDragging=plate=>plate.closest('.is-dragging');
 window.addEventListener('pagehide',stopDishVoice);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopDishVoice();});
 const message=text=>document.getElementById('table-layout-status').textContent=text;
 function readLayout(){const raw=localStorage.getItem(KEY);if(!raw)return blank();const data=JSON.parse(raw);if(data.version!==1||!['desktop','mobile'].every(mode=>data[mode]&&typeof data[mode]==='object'&&!Array.isArray(data[mode])&&Object.entries(data[mode]).every(([id,pos])=>validIds.has(id)&&pos&&['x','y'].every(k=>Number.isFinite(pos[k])&&pos[k]>=0&&pos[k]<=100))))throw Error('invalid layout');return data;}
 try{layout=readLayout();}catch{blocked=true;message('摆盘记录暂时无法读取。可以移动盘子，原记录会保留。');}
 const mode=()=>mobile.matches?'mobile':'desktop';
 function persist(){if(blocked)return false;try{const latest=readLayout();for(const key of ['desktop','mobile'])for(const [id,pos] of Object.entries(pending[key])){if(pos===null)delete latest[key][id];else latest[key][id]=pos;}localStorage.setItem(KEY,JSON.stringify(latest));layout=latest;pending={desktop:{},mobile:{}};message('摆好啦！下次回来还在这里。');return true;}catch{message('这次摆放暂时没有保存成功，盘子可以继续移动；学习和食材记录不会受影响。');return false;}}
 function remember(id,pos){layout[mode()][id]=pos;pending[mode()][id]=pos;persist();updateReset();}
 function updateReset(){document.getElementById('table-reset').disabled=blocked||![...root.children].some(el=>layout[mode()][el.dataset.dish]);}
 function place(el,pos,base){const scale=Math.max(.4,Math.min(1.2,base.scale+(pos.y-base.y)*.003));el.style.setProperty('--dish-x',pos.x+'%');el.style.setProperty('--dish-y',pos.y+'%');el.style.setProperty('--dish-scale',scale);el.style.zIndex=String(Math.round(pos.y));}
 // Bound the complete vessel and its labels to the wooden surface, including after resizing.
 function bounded(el,pos,base){place(el,pos,base);const box=el.getBoundingClientRect(),surface=room.getBoundingClientRect(),plane=root.getBoundingClientRect();const left=surface.left+surface.width*.025,right=surface.right-surface.width*.025,top=surface.top+surface.height*.33,bottom=surface.top+surface.height*.90;
  const dx=box.left<left?left-box.left:box.right>right?right-box.right:0,dy=box.top<top?top-box.top:box.bottom>bottom?bottom-box.bottom:0;
  const result={x:Math.max(0,Math.min(100,pos.x+dx/plane.width*100)),y:Math.max(0,Math.min(100,pos.y+dy/plane.height*100))};place(el,result,base);return result;
 }
 function dishBox(el){const boxes=[el,...el.querySelectorAll('.table-plate,strong')].map(n=>n.getBoundingClientRect());return {left:Math.min(...boxes.map(b=>b.left)),right:Math.max(...boxes.map(b=>b.right)),top:Math.min(...boxes.map(b=>b.top)),bottom:Math.max(...boxes.map(b=>b.bottom))};}
 const intersects=(a,b,gap=4)=>a.left<b.right+gap&&a.right+gap>b.left&&a.top<b.bottom+gap&&a.bottom+gap>b.top;
 function collides(el){const box=dishBox(el);return [...root.children].some(other=>other!==el&&intersects(box,dishBox(other)));}
 function safePosition(el,wanted,base,fallback){const result=bounded(el,wanted,base);if(!collides(el))return result;place(el,fallback,base);return {...fallback};}
 function quantity(d){const n=document.createElement('span');n.className='dish-quantity';n.textContent=String(counts[d.id]);n.setAttribute('aria-label','数量 '+counts[d.id]);return n;}
 function draggable(el,plate,d,base){let pos=safePosition(el,layout[mode()][d.id]||{x:base.x,y:base.y},base,{x:base.x,y:base.y});

  plate.setAttribute('aria-label','摆放'+d.name+'，数量 '+counts[d.id]+'，按方向键移动');plate.setAttribute('aria-describedby','table-arrange-hint');
  plate.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;cancelDrag?.();el.classList.remove('just-served');const origin={...pos},start={x:e.clientX,y:e.clientY},pointer=e.pointerId,plane=root.getBoundingClientRect();let moved=false;
   const cancel=()=>{el.classList.remove('is-dragging');pos=origin;place(el,pos,base);clean();};
   const move=e=>{if(e.pointerId!==pointer)return;if(!moved&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<4)return;moved=true;el.classList.add('is-dragging');pos=safePosition(el,{x:origin.x+(e.clientX-start.x)/plane.width*100,y:origin.y+(e.clientY-start.y)/plane.height*100},base,pos);el.style.zIndex='1000';e.preventDefault();};
   const up=e=>{if(e.pointerId!==pointer)return;el.classList.remove('is-dragging');place(el,pos,base);clean();if(moved)remember(d.id,pos);};
   function clean(){plate.removeEventListener('pointermove',move);plate.removeEventListener('pointerup',up);plate.removeEventListener('pointercancel',cancel);plate.removeEventListener('lostpointercapture',cancel);cancelDrag=null;if(plate.hasPointerCapture(pointer))plate.releasePointerCapture(pointer);}
   cancelDrag=cancel;plate.addEventListener('pointermove',move);plate.addEventListener('pointerup',up);plate.addEventListener('pointercancel',cancel);plate.addEventListener('lostpointercapture',cancel);plate.setPointerCapture(pointer);plate.focus({preventScroll:true});
  });
  plate.addEventListener('keydown',e=>{const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},direction=arrows[e.key];if(!direction)return;e.preventDefault();cancelDrag?.();el.classList.remove('just-served');const step=e.shiftKey?5:2;pos=safePosition(el,{x:pos.x+direction[0]*step,y:pos.y+direction[1]*step},base,pos);remember(d.id,pos);});
 }
 document.getElementById('table-reset').onclick=()=>{cancelDrag?.();for(const el of root.children){delete layout[mode()][el.dataset.dish];pending[mode()][el.dataset.dish]=null;}const saved=persist();draw();if(saved)message('餐桌已经恢复整齐摆放，架子上的菜保持原样。');};
 let resizeFrame=0;window.addEventListener('resize',()=>{cancelDrag?.();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>draw());});window.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrag?.();});window.addEventListener('pagehide',()=>cancelDrag?.());document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelDrag?.();});
 window.addEventListener('storage',e=>{if(e.key!==KEY)return;cancelDrag?.();try{layout=readLayout();for(const m of ['desktop','mobile'])for(const [id,pos] of Object.entries(pending[m])){if(pos===null)delete layout[m][id];else layout[m][id]=pos;}blocked=false;draw();}catch{blocked=true;message('摆盘记录已变更，暂时无法读取；原记录会保留。');updateReset();}});
 const slots6=[[22,23,.82,-3],[51,19,.78,2],[80,25,.84,-2],[19,73,1.04,2],[50,69,1,-2],[81,75,1.06,3]];
 const slots4=[[29,18,.79,-3],[73,20,.8,2],[27,78,1.03,2],[74,76,1.01,-2]];
 function draw(highlight){
  cancelDrag?.();stopDishVoice();
  const visible=items.slice(0,15),overflow=items.slice(15);root.replaceChildren();pager.replaceChildren();document.getElementById('table-empty').hidden=items.length>0;
  room.classList.toggle('table-has-dishes',items.length>0);root.dataset.table='1';
  let slots=visible.length<=6?(mobile.matches&&visible.length<=4?slots4:slots6):Array.from({length:15},(_,i)=>{const cols=mobile.matches?3:5,rows=Math.ceil(visible.length/cols),row=Math.floor(i/cols),col=i%cols;return [10+col*80/(cols-1),12+row*72/Math.max(1,rows-1),(mobile.matches?.62:.76)+row*(mobile.matches?.03:.04),(i%3-1)*2];});
  room.classList.toggle('table-crowded',visible.length>6);
  if(visible.length===1)slots=[[50,49,1.18,-2]];
  else if(visible.length===2)slots=[[29,47,1,-3],[72,50,1.06,3]];
  else if(visible.length===3)slots=[[26,22,.83,-3],[74,24,.85,2],[50,76,1.05,-2]];
  const arrangements=[];visible.forEach((d,i)=>{
   const [x,y,scale,angle]=slots[i],el=document.createElement('article');el.className='table-dish'+(d.id===highlight?' just-served':'');el.dataset.dish=d.id;
   el.style.cssText=`--dish-x:${x}%;--dish-y:${y}%;--dish-scale:${scale};--dish-angle:${angle}deg;z-index:${Math.round(y)}`;
   const plate=document.createElement('button');plate.type='button';plate.className='table-plate';
   const img=document.createElement('img');img.src='assets/dishes/table/'+d.id+'.webp';img.alt=d.name;img.draggable=false;img.decoding='async';img.width=512;img.height=512;plate.append(img);plate.insertAdjacentHTML('beforeend',GardenCookingPlay.steam(d.method));
   const label=document.createElement('strong');label.textContent=d.name;plate.append(quantity(d));el.append(plate,label);root.append(el);arrangements.push({el,plate,d,base:{x,y,scale}});nameOnHover(plate,d);
  });
  // Start from a spaced layout; old conflicting positions are ignored visually, never rewritten on load.
  for(let attempt=0;attempt<14;attempt++){
    for(const {el,base} of arrangements)bounded(el,{x:base.x,y:base.y},base);
    if(!arrangements.some(({el})=>collides(el)))break;
    for(const {base} of arrangements)base.scale*=.94;
  }
  for(const {el,base} of arrangements){base.x=parseFloat(el.style.getPropertyValue('--dish-x'));base.y=parseFloat(el.style.getPropertyValue('--dish-y'));base.scale=parseFloat(el.style.getPropertyValue('--dish-scale'));}
  for(const {el,plate,d,base} of arrangements)draggable(el,plate,d,base);
  pager.hidden=items.length===0;controls.hidden=items.length===0;updateReset();
  const count=document.createElement('span');count.id='table-page-count';count.setAttribute('role','status');count.textContent=`餐桌 ${visible.length}/15 道 · 架子 ${overflow.length} 道`;pager.append(count);
  shelf.hidden=overflow.length===0;const rack=shelf.querySelector('.shelf-dishes');rack.replaceChildren();
  for(const d of overflow){const el=document.createElement('article');el.className='shelf-dish'+(d.id===highlight?' just-served':'');el.dataset.dish=d.id;const plate=document.createElement('button');plate.type='button';plate.className='shelf-plate';plate.setAttribute('aria-label','听听'+d.name);const img=document.createElement('img');img.src='assets/dishes/table/'+d.id+'.webp';img.alt=d.name;img.loading='lazy';const label=document.createElement('strong');label.textContent=d.name;plate.append(img,label,quantity(d));el.append(plate);rack.append(el);nameOnHover(plate,d);}
 }

 function render(served,cooked,latest={}){items=served;counts=cooked;let highlight=null;if(latest.token&&latest.token!==lastToken){lastToken=latest.token;const index=items.findIndex(d=>d.id===latest.id);if(index>=0){highlight=latest.id;}}draw(highlight);}
 mobile.addEventListener('change',()=>draw());globalThis.GardenTableScene={render};
})();
