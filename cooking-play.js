/* Method-specific play stays in memory; only serving consumes stock atomically. */
(() => {
 const recipes={
  炒:{key:'stir',verb:'翻炒',art:'cooking-pan',energy:'翻炒能量',tip:'在锅里左右来回推铲，或点按钮翻炒。每次有效动作加一格。',button:'翻炒一次'},
  煎:{key:'flip',verb:'翻面',art:'frying-pan',energy:'两面金黄',tip:'向上划一下给食材翻面，或点按钮。正反面轮流煎，翻面才加能量。',button:'翻到另一面'},
  拌:{key:'mix',verb:'拌匀',art:'mixing-bowl',energy:'拌匀程度',tip:'围着料理盆画大半圈，把食材拌匀；也可以点按钮。这里不用开火。',button:'绕圈拌一次'},
  煮:{key:'boil',verb:'煮',art:'boiling-pot',energy:'沸腾进度',heat:2,tip:'把火候调到中火，看到水冒泡后按住按钮照看沸腾。也可短按逐格操作。',button:'按住照看沸腾'},
  炖:{key:'stew',verb:'炖',art:'stewing-pot-open',closedArt:'stewing-pot',energy:'慢炖进度',heat:1,lid:true,tip:'先盖好锅盖，调到小火，再按住按钮慢炖。大火不会加进度。',button:'按住小火慢炖'},
  蒸:{key:'steam',verb:'蒸',art:'bamboo-steamer',closedArt:'bamboo-steamer-closed',energy:'蒸汽进度',heat:2,lid:true,water:true,tip:'先加水、盖好蒸笼，再调到中火。按住按钮积累蒸汽，缺水时记得补水。',button:'按住照看蒸汽'},
  烤:{key:'bake',verb:'烤',art:'baking-oven',energy:'烘烤进度',temperature:180,tray:true,tip:'放入烤盘，把温度调到 180°C，再按住按钮烘烤。温度偏高或偏低时暂停计时。',button:'按住烘烤计时'}
 };
 const surfaces={
  stir:{x:.43,y:.28,w:.43,h:.18},flip:{x:.43,y:.32,w:.43,h:.16},mix:{x:.47,y:.32,w:.39,h:.22},
  boil:{x:.50,y:.27,w:.48,h:.14},stew:{x:.56,y:.28,w:.44,h:.17},steam:{x:.63,y:.27,w:.42,h:.15},bake:{x:.54,y:.60,w:.35,h:.25}
 };
 function gestureGuide(key){
  const path=key==='stir'?'M 48 80 L 192 80':key==='flip'?'M 120 130 L 120 28':'M 175 80 A 55 44 0 1 1 80 46';
  const arrow=key==='stir'?'<path d="M 62 67 L 48 80 L 62 93 M 178 67 L 192 80 L 178 93"/>':key==='flip'?'<path d="M 105 44 L 120 28 L 135 44"/>':'<path d="M 78 63 L 80 46 L 97 49"/>';
  return `<svg class="gesture-demo" viewBox="0 0 240 160" aria-hidden="true"><path class="gesture-track" d="${path}"/>${arrow}<circle class="gesture-start" cx="${key==='stir'?48:key==='flip'?120:175}" cy="${key==='flip'?130:80}" r="11"/><circle class="gesture-finger" r="8"><animateMotion path="${path}" dur="2.2s" repeatCount="indefinite"/></circle></svg><span class="gesture-label">${{stir:'左右推一推',flip:'向上翻一面',mix:'沿着圆圈拌'}[key]}</span>`;
 }
 const goal=10,active=new WeakMap();
 const steam=method=>method==='拌'?'':'<span class="dish-steam" aria-hidden="true"><i></i><i></i><i></i></span>';
 function describe(method){return recipes[method]||recipes.炒;}
 function dispose(root){active.get(root)?.();active.delete(root);}
 function mount(root,{dish,state,ingredients,ingredientArt,side,onChange,onGuide=()=>{}}){
  dispose(root);
  const config=describe(dish.method),heatMode=!!config.heat||!!config.temperature;
  Object.assign(state,{count:Math.min(goal,Math.max(0,state.count||0)),heat:state.heat||0,temperature:state.temperature||140,lid:!!state.lid,water:state.water||0,tray:!!state.tray});
  const section=document.createElement('section');section.className=`cooking-play method-${config.key}`;section.dataset.method=dish.method;section.setAttribute('aria-label','亲手'+config.verb+' '+dish.name);
  const items=[...Object.keys(dish.needs),...(side?[side]:[])];
  section.innerHTML=`<div class="cooking-energy"><label for="cook-energy">${config.energy}</label><strong id="cook-action-count" role="status" aria-live="polite"></strong><progress id="cook-energy" max="${goal}" value="${state.count}"></progress></div><div class="cooking-stage" id="cooking-stage"><img class="little-chef" src="assets/cooking/little-chef.webp" alt="陪你${config.verb}的小厨师" draggable="false"><img class="cooking-pan-art" src="assets/cooking/${config.art}.webp" alt="${{炒:'炒锅',煎:'平底煎锅',拌:'凉拌料理盆',煮:'煮汤深锅',炖:'砂锅',蒸:'竹蒸笼',烤:'烤箱'}[dish.method]}" draggable="false"><div class="pan-ingredients" aria-hidden="true">${items.map(id=>ingredientArt(ingredients.find(i=>i.id===id))).join('')}</div>${!heatMode?'<img class="cooking-spatula" src="assets/cooking/wooden-spatula.webp" alt="" draggable="false">':''}${config.heat?'<span class="burner-fire" role="img" hidden><img src="assets/cooking/gas-flame-v1.webp" alt="" draggable="false"></span>':''}${dish.method==='煮'?'<span class="pot-bubbles" aria-hidden="true"><i></i><i></i><i></i><i></i></span>':''}${dish.method==='烤'?'<span class="oven-glow" aria-hidden="true"></span>':''}${dish.method==='拌'?'':steam()}${dish.method==='烤'?`<img class="oven-ready-dish" src="${dish.image}" alt="${dish.name}烤好啦">`:''}<div id="pan-gesture" class="pan-gesture" ${heatMode?'hidden':''} aria-label="${config.tip}">${heatMode?'':gestureGuide(config.key)}</div><span class="chef-message" role="status"></span>${dish.method==='煎'?'<span class="frying-side">现在煎：正面</span>':''}</div><p class="cooking-tip">${config.tip}</p><div class="cooking-guide" aria-label="料理操作指引"><ol id="cook-guide-steps"></ol><p id="cook-next-step" role="status" aria-live="polite"></p><p id="cook-action-feedback" role="status" aria-live="polite"></p></div><div class="method-controls">${config.water?'<button type="button" id="add-steam-water">💧 给蒸锅加水</button><p class="water-status" id="steam-water" role="status"></p>':''}${config.lid?'<button type="button" id="cook-lid" aria-pressed="false">盖上'+(dish.method==='蒸'?'蒸笼':'锅盖')+'</button>':''}${config.tray?'<button type="button" id="oven-tray" aria-pressed="false">把烤盘放进烤箱</button>':''}${config.heat?`<label for="cook-heat">火候：<output id="heat-value"></output><input id="cook-heat" type="range" min="0" max="3" step="1" value="${state.heat}"></label><p class="heat-guide">这道菜用${config.heat===1?'小':'中'}火，调对后才积累进度。</p>`:''}${config.temperature?`<label for="oven-temperature">烤箱温度：<output id="temperature-value"></output><input id="oven-temperature" type="range" min="140" max="220" step="20" value="${state.temperature}"></label><p class="heat-guide">目标 180°C · 放好烤盘后开始烘烤</p>`:''}</div><button id="stir-food" type="button">${config.button}</button>`;
  root.append(section);
  const stage=section.querySelector('#cooking-stage'),control=section.querySelector('#stir-food'),zone=section.querySelector('#pan-gesture');
  let pointer=null,timer=null,holding=false,holdSteps=0,suppressClick=false,disposed=false,lastGuide=null;
  const art=stage.querySelector('.cooking-pan-art'),chef=stage.querySelector('.little-chef');
  const feedback=section.querySelector('#cook-action-feedback');
  control.setAttribute('aria-describedby','cook-next-step');
  function alignScene(){
   if(disposed||!art.naturalWidth||!chef.naturalWidth)return;
   const box=art.getBoundingClientRect(),scene=stage.getBoundingClientRect();
   const scale=Math.min(box.width/art.naturalWidth,box.height/art.naturalHeight);
   const imageWidth=art.naturalWidth*scale,imageHeight=art.naturalHeight*scale;
   const imageLeft=box.left-scene.left+(box.width-imageWidth)/2-stage.clientLeft;
   const imageTop=box.top-scene.top+(box.height-imageHeight)/2-stage.clientTop;
   const surface={...surfaces[config.key]};
   if(state.lid&&config.key==='stew')Object.assign(surface,{x:.53,y:.20});
   if(state.lid&&config.key==='steam')Object.assign(surface,{x:.64,y:.20});
   const x=imageLeft+imageWidth*surface.x,y=imageTop+imageHeight*surface.y;
   const width=imageWidth*surface.w,height=imageHeight*surface.h;
   const food=stage.querySelector('.pan-ingredients');
   Object.assign(food.style,{left:(x-width/2)+'px',top:(y-height/2)+'px',width:width+'px',height:height+'px',right:'auto',bottom:'auto'});
   const fire=stage.querySelector('.burner-fire');
   if(fire){const anchor=config.key==='boil'?{x:.50,y:.72,w:.38,h:.11}:config.key==='stew'?(state.lid?{x:.53,y:.76,w:.34,h:.10}:{x:.56,y:.69,w:.28,h:.09}):(state.lid?{x:.53,y:.83,w:.34,h:.08}:{x:.63,y:.73,w:.34,h:.08});const height=imageHeight*anchor.h*[0,.55,.85,1.2][state.heat];Object.assign(fire.style,{left:(imageLeft+imageWidth*(anchor.x-anchor.w/2))+'px',top:(imageTop+imageHeight*anchor.y-height)+'px',width:(imageWidth*anchor.w)+'px',height:height+'px'});}
   const reach=Math.max(42,width*.43),handX=x-reach;
   // The generated portrait's working hand is at (0.72, 0.405) of its intrinsic image.
   const chefHeight=Math.max(stage.clientHeight*.77,Math.min(stage.clientHeight*.94,(stage.clientHeight-6-y)/.595));
   const chefWidth=chefHeight*chef.naturalWidth/chef.naturalHeight;
   const chefLeft=Math.max(4,handX-chefWidth*.72);
   Object.assign(chef.style,{left:chefLeft+'px',height:chefHeight+'px',width:chefWidth+'px',bottom:'6px'});
   const handY=stage.clientHeight-6-chefHeight+chefHeight*.405;
   const tool=stage.querySelector('.cooking-spatula');
   if(tool)Object.assign(tool.style,{left:(chefLeft+chefWidth*.72-16)+'px',top:(handY-12)+'px',bottom:'auto',width:Math.max(65,Math.min(105,x-handX+28))+'px'});
   const zoneWidth=Math.max(130,Math.min(stage.clientWidth*.55,width+45)),zoneHeight=Math.max(128,height+80);
   Object.assign(zone.style,{left:Math.max(0,Math.min(stage.clientWidth-zoneWidth,x-zoneWidth/2))+'px',top:Math.max(42,Math.min(stage.clientHeight-zoneHeight-10,y-zoneHeight/2))+'px',width:zoneWidth+'px',height:zoneHeight+'px',right:'auto',bottom:'auto'});
   const vapor=stage.querySelector('.dish-steam');if(vapor)Object.assign(vapor.style,{left:(x-width*.35)+'px',top:(y-63)+'px',width:(width*.7)+'px',right:'auto'});
   const bubbles=stage.querySelector('.pot-bubbles');if(bubbles)Object.assign(bubbles.style,{left:(x-width*.4)+'px',top:(y-9)+'px',width:(width*.8)+'px',bottom:'auto',right:'auto'});
   for(const node of stage.querySelectorAll('.oven-glow,.oven-ready-dish'))Object.assign(node.style,{left:(x-width/2)+'px',top:(y-height/2)+'px',width:width+'px',height:height+'px',right:'auto',bottom:'auto'});
  }
  function guideSteps(){
   const steps=[];
   if(config.water)steps.push({id:'add-steam-water',text:'给蒸锅加水',done:state.water>0});
   if(config.lid)steps.push({id:'cook-lid',text:'盖好'+(dish.method==='蒸'?'蒸笼':'锅盖'),done:state.lid});
   if(config.tray)steps.push({id:'oven-tray',text:'放入烤盘',done:state.tray});
   if(config.heat)steps.push({id:'cook-heat',text:'调到'+(config.heat===1?'小':'中')+'火',done:state.heat===config.heat});
   if(config.temperature)steps.push({id:'oven-temperature',text:'调到 180°C',done:state.temperature===config.temperature});
   steps.push({id:heatMode?'stir-food':'pan-gesture',text:heatMode?'按住按钮攒进度':{stir:'沿箭头左右推',flip:'沿箭头向上划',mix:'沿圆圈拌大半圈'}[config.key],done:state.count>=goal});
   if(state.count>=goal)for(const step of steps)step.done=true;
   const first=steps.findIndex(step=>!step.done);
   section.querySelector('#cook-guide-steps').innerHTML=steps.map((step,index)=>`<li class="${step.done?'done':index===first?'current':''}"><span>${step.done?'✓':index+1}</span>${step.text}</li>`).join('');
   for(const node of section.querySelectorAll('.guide-target'))node.classList.remove('guide-target');
   if(first>=0)section.querySelector('#'+steps[first].id)?.classList.add('guide-target');
   const text=first<0?'完成啦！可以把菜端上桌。':heatMode&&first===steps.length-1?(holding?'正在积累进度，松开按钮就暂停。':'准备好啦：按住下面的按钮不松手，能量会逐格增加。'):heatMode?`下一步：${steps[first].text}，跟着黄色提示操作。`:`跟着锅里的移动圆点${{stir:'左右推铲',flip:'向上划动翻面',mix:'画大半圈拌匀'}[config.key]}；也可以点下面的按钮。`;
   const note=section.querySelector('#cook-next-step');if(note.textContent!==text)note.textContent=text;
   const id=steps[first]?.id,cue=first<0?'ready-serve':id==='add-steam-water'?'prep-water':id==='cook-lid'?(dish.method==='蒸'?'prep-steamer-lid':'prep-lid'):id==='oven-tray'?'prep-tray':id==='cook-heat'?(config.heat===1?'prep-low-heat':'prep-medium-heat'):id==='oven-temperature'?'prep-180':'do-'+config.key;
   if(cue!==lastGuide){lastGuide=cue;onGuide(cue);}
  }
  function connected(){const dialog=section.closest('dialog');return !disposed&&section.isConnected&&(!dialog||dialog.open)&&!document.hidden;}
  function readyToCook(){return (!config.heat||state.heat===config.heat)&&(!config.temperature||state.temperature===config.temperature)&&(!config.lid||state.lid)&&(!config.water||state.water>0)&&(!config.tray||state.tray);}
  function message(){
   if(state.count>=goal)return dish.method==='拌'?'拌匀啦，清清爽爽可以上桌！':'做好啦，准备上桌！';
   if(config.water&&!state.water)return '先给蒸锅加点水，才会有蒸汽。';
   if(config.lid&&!state.lid)return '先盖好'+(dish.method==='蒸'?'蒸笼':'锅盖')+'，留住热气。';
   if(config.tray&&!state.tray)return '先把装好食材的烤盘放进去。';
   if(config.heat&&state.heat!==config.heat)return `调到${config.heat===1?'小':'中'}火，再开始${config.verb}。`;
   if(config.temperature&&state.temperature!==config.temperature)return '把温度调到 180°C，再开始烘烤。';
   return heatMode?'条件都准备好啦，按住按钮照看火候！':config.tip;
  }
  function stopHold(){if(timer!==null)clearInterval(timer);timer=null;if(holding&&holdSteps>0)suppressClick=true;holding=false;control.classList.remove('is-holding');if(section.isConnected&&!disposed)guideSteps();}
  function update(){
   const ready=state.count>=goal;
   section.querySelector('#cook-energy').value=state.count;section.querySelector('#cook-action-count').textContent=`${state.count} / ${goal}`;
   control.disabled=ready;control.textContent=ready?(dish.method==='拌'?'拌匀啦！可以端上桌':'熟啦！可以端上桌'):config.button;
   stage.classList.toggle('food-ready',ready);stage.classList.toggle('heat-working',heatMode&&readyToCook()&&!ready);stage.classList.toggle('lid-closed',state.lid);stage.classList.toggle('tray-in',state.tray);
   stage.querySelector('.chef-message').textContent=message();
   if(config.closedArt){const art=stage.querySelector('.cooking-pan-art');const src='assets/cooking/'+(state.lid?config.closedArt:config.art)+'.webp';if(art.getAttribute('src')!==src)art.src=src;}
   const sideLabel=stage.querySelector('.frying-side');if(sideLabel)sideLabel.textContent='现在煎：'+(state.count%2?'反面':'正面');
   const water=section.querySelector('#steam-water');if(water)water.textContent=`蒸锅水量 ${state.water} / 3 · 每蒸 10 格用一份水`;
   const lid=section.querySelector('#cook-lid');if(lid){lid.setAttribute('aria-pressed',String(state.lid));lid.textContent=state.lid?'揭开'+(dish.method==='蒸'?'蒸笼':'锅盖'):'盖上'+(dish.method==='蒸'?'蒸笼':'锅盖');lid.disabled=ready;}
   const tray=section.querySelector('#oven-tray');if(tray){tray.setAttribute('aria-pressed',String(state.tray));tray.textContent=state.tray?'烤盘已放好 ✓':'把烤盘放进烤箱';tray.disabled=ready||state.tray;}
   const heat=section.querySelector('#heat-value');if(heat)heat.textContent=['关火','小火','中火','大火'][state.heat];
   stage.dataset.heat=String(state.heat);const flame=stage.querySelector('.burner-fire');if(flame){flame.hidden=state.heat===0||ready;flame.setAttribute('aria-label',['关火','小火火焰','中火火焰','大火火焰'][state.heat]);}stage.style.setProperty('--oven-heat',String(Math.max(0,(state.temperature-120)/120)));
   const temperature=section.querySelector('#temperature-value');if(temperature)temperature.textContent=state.temperature+'°C';
   for(const node of section.querySelectorAll('#cook-heat,#oven-temperature,#add-steam-water'))node.disabled=ready;
   stage.classList.toggle('has-practiced',state.count>0);
   if(ready)stopHold();guideSteps();alignScene();onChange(state.count);
  }
  function step(){
   if(!connected()||state.count>=goal){stopHold();return false;}
   if(!readyToCook()){update();return false;}
   state.count++;feedback.textContent=state.count>=goal?'美味进度已满！':heatMode?'火候刚刚好，继续照看。':'做得对！再来一次。';
   if(config.water&&state.count%10===0)state.water=Math.max(0,state.water-1);
   const animation='is-'+({stir:'stirring',flip:'flipping',mix:'mixing',boil:'boiling',stew:'stewing',steam:'steaming',bake:'baking'}[config.key]);
   stage.classList.remove(animation);void stage.offsetWidth;stage.classList.add(animation);update();return true;
  }
  function startHold(){if(!heatMode||holding||state.count>=goal||!connected())return;holding=true;holdSteps=0;suppressClick=false;control.classList.add('is-holding');guideSteps();timer=setInterval(()=>{if(!connected()){stopHold();return;}if(step())holdSteps++;},400);}
  control.onclick=()=>{if(suppressClick){suppressClick=false;return;}step();};
  if(heatMode){
   control.addEventListener('pointerdown',event=>{if(event.button!==0)return;control.setPointerCapture(event.pointerId);startHold();});
   for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])control.addEventListener(event,stopHold);
   control.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;if(event.repeat){event.preventDefault();return;}if(event.key===' ')event.preventDefault();startHold();});
   control.addEventListener('keyup',event=>{if(!['Enter',' '].includes(event.key))return;const short=holdSteps===0;stopHold();if(event.key===' '){event.preventDefault();if(short)step();suppressClick=false;}});
  }
  const bind=(id,event,fn)=>{const node=section.querySelector('#'+id);if(node)node.addEventListener(event,fn);};
  bind('cook-lid','click',()=>{state.lid=!state.lid;update();});
  bind('add-steam-water','click',()=>{state.water=Math.min(3,state.water+1);update();});
  bind('oven-tray','click',()=>{state.tray=true;update();});
  bind('cook-heat','input',event=>{state.heat=Number(event.target.value);update();});
  bind('oven-temperature','input',event=>{state.temperature=Number(event.target.value);update();});
  zone.addEventListener('pointerdown',event=>{
   if(heatMode||state.count>=goal||pointer||event.button!==0)return;
   const rect=zone.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
   stage.classList.add('gesture-active');feedback.textContent='';
   pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,length:0,cx,cy,angle:Math.atan2(event.clientY-cy,event.clientX-cx),rotation:0};zone.setPointerCapture(event.pointerId);
  });
  zone.addEventListener('pointermove',event=>{
   if(pointer?.id!==event.pointerId)return;
   pointer.length+=Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y);pointer.x=event.clientX;pointer.y=event.clientY;
   const angle=Math.atan2(event.clientY-pointer.cy,event.clientX-pointer.cx),delta=Math.atan2(Math.sin(angle-pointer.angle),Math.cos(angle-pointer.angle));
   if(Math.hypot(event.clientX-pointer.cx,event.clientY-pointer.cy)>16)pointer.rotation+=delta;
   pointer.angle=angle;stage.style.setProperty('--spatula-shift',Math.max(-25,Math.min(25,(event.clientX-pointer.cx)*.2))+'px');
  });
  zone.addEventListener('pointerup',event=>{
   if(pointer?.id!==event.pointerId)return;
   const p=pointer;pointer=null;stage.classList.remove('gesture-active');stage.style.removeProperty('--spatula-shift');if(zone.hasPointerCapture(event.pointerId))zone.releasePointerCapture(event.pointerId);
   const valid=config.key==='stir'?Math.abs(event.clientX-p.startX)>=32:config.key==='flip'?p.startY-event.clientY>=35:config.key==='mix'?Math.abs(p.rotation)>=Math.PI*1.25:false;
   if(valid)step();else{const cue='try-'+config.key;if(cue!==lastGuide){lastGuide=cue;onGuide(cue);}feedback.textContent={stir:'再试试：按住圆点，左右推得远一点。',flip:'再试试：从下方圆点向上划。',mix:'再试试：沿圆圈画大半圈，直着划不会加进度。'}[config.key];}
  });
  for(const event of ['pointercancel','lostpointercapture'])zone.addEventListener(event,()=>{pointer=null;stage.classList.remove('gesture-active');stage.style.removeProperty('--spatula-shift');});
  const onVisibility=()=>{if(document.hidden)stopHold();};document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',stopHold);
  const dialog=section.closest('dialog');dialog?.addEventListener('close',stopHold);
  const observer=new MutationObserver(()=>{if(!section.isConnected)cleanup();});observer.observe(root,{childList:true});
  const resize=new ResizeObserver(alignScene);resize.observe(stage);
  art.addEventListener('load',alignScene);chef.addEventListener('load',alignScene);
  function cleanup(){disposed=true;stopHold();resize.disconnect();art.removeEventListener('load',alignScene);chef.removeEventListener('load',alignScene);observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('pagehide',stopHold);dialog?.removeEventListener('close',stopHold);}
  active.set(root,cleanup);update();return section;
 }
 window.GardenCookingPlay={goal,mount,steam,describe,dispose};
})();
