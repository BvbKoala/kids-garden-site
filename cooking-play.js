/* In-memory cooking gestures; serving remains the ledger's atomic operation. */
(() => {
 const verbs={炒:'翻炒',煎:'翻面',拌:'拌匀',煮:'搅拌',炖:'搅拌',蒸:'调整火候',烤:'调整火候'};
 const steam=()=>'<span class="dish-steam" aria-hidden="true"><i></i><i></i><i></i></span>';
 function mount(root,{dish,state,ingredients,ingredientArt,side,onChange}){
  const verb=verbs[dish.method]||'翻炒',section=document.createElement('section');section.className='cooking-play'+(dish.method==='烤'?' baking-play':'');section.setAttribute('aria-label','亲手料理 '+dish.name);
  const items=[...Object.keys(dish.needs),...(side?[side]:[])];
  section.innerHTML=`<div class="cooking-energy"><label for="cook-energy">美味能量</label><strong id="cook-action-count" role="status" aria-live="polite"></strong><progress id="cook-energy" max="20" value="${state.count}"></progress></div><div class="cooking-stage" id="cooking-stage"><img class="little-chef" src="assets/cooking/little-chef.webp" alt="正在帮你做饭的小厨师" draggable="false"><img class="cooking-pan-art" src="assets/cooking/${dish.method==='烤'?'baking-oven':'cooking-pan'}.webp" alt="${dish.method==='烤'?'食材进入烤箱啦':'食材下锅啦'}" draggable="false"><div class="pan-ingredients" aria-hidden="true">${items.map(id=>ingredientArt(ingredients.find(i=>i.id===id))).join('')}</div><img class="cooking-spatula" src="assets/cooking/wooden-spatula.webp" alt="" draggable="false">${steam()}${dish.method==='烤'?`<img class="oven-ready-dish" src="${dish.image}" alt="${dish.name}烤好啦">`:""}<div id="pan-gesture" class="pan-gesture" aria-label="${dish.method==='烤'?'拖动调节烤箱火候':'拖动锅里的食材'}，亲手${verb}"></div><span class="chef-message">一起做出香喷喷的菜！</span></div><p class="cooking-tip">${dish.method==='烤'?'在烤箱前拖动调节火候':'在锅里拖动'}，或者点下面的按钮。${verb} 20 次，美味能量就满啦！</p><button id="stir-food" type="button">${verb}一次</button>`;
  root.append(section);const stage=section.querySelector('#cooking-stage'),control=section.querySelector('#stir-food'),zone=section.querySelector('#pan-gesture');let pointer=null;
  function update(){const ready=state.count>=20;section.querySelector('#cook-energy').value=state.count;section.querySelector('#cook-action-count').textContent=`${state.count} / 20`;control.disabled=ready;control.textContent=ready?'熟啦！可以端上桌':verb+'一次';stage.classList.toggle('food-ready',ready);stage.querySelector('.chef-message').textContent=ready?'香喷喷，准备上桌！':'一起做出香喷喷的菜！';onChange(state.count);}
  function stir(){if(state.count>=20||!section.isConnected)return;state.count++;stage.classList.remove('is-stirring');void stage.offsetWidth;stage.classList.add('is-stirring');update();}
  control.onclick=stir;
  zone.addEventListener('pointerdown',e=>{if(state.count>=20||pointer||e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,length:0};zone.setPointerCapture(e.pointerId);});
  zone.addEventListener('pointermove',e=>{if(pointer?.id!==e.pointerId)return;pointer.length+=Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y);pointer.x=e.clientX;pointer.y=e.clientY;stage.style.setProperty('--spatula-shift',Math.max(-25,Math.min(25,(e.clientX-zone.getBoundingClientRect().left-zone.clientWidth/2)*.2))+'px');});
  zone.addEventListener('pointerup',e=>{if(pointer?.id!==e.pointerId)return;const length=pointer.length;pointer=null;stage.style.removeProperty('--spatula-shift');if(zone.hasPointerCapture(e.pointerId))zone.releasePointerCapture(e.pointerId);if(length>=32)stir();});
  for(const event of ['pointercancel','lostpointercapture'])zone.addEventListener(event,()=>{pointer=null;stage.style.removeProperty('--spatula-shift');});
  update();return section;
 }
 window.GardenCookingPlay={mount,steam};
})();
