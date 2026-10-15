(() => {
 const r=GardenRewards,dialog=document.createElement('dialog');dialog.id='purchase-dialog';dialog.setAttribute('aria-labelledby','purchase-title');
 dialog.innerHTML=`<button type="button" id="purchase-close" aria-label="关闭兑换弹窗">×</button><h2 id="purchase-title">确认兑换</h2><img id="purchase-image" alt=""><h3 id="purchase-name"></h3><p id="purchase-unit"></p><div class="purchase-counter"><button type="button" id="purchase-minus" aria-label="减少兑换数量">−</button><label for="purchase-quantity">兑换数量<input id="purchase-quantity" type="number" min="1" step="1" inputmode="numeric" value="1"></label><button type="button" id="purchase-plus" aria-label="增加兑换数量">＋</button></div><p id="purchase-total" aria-live="polite"></p><p id="purchase-balance"></p><p id="purchase-error" role="status" aria-live="polite"></p><div class="purchase-actions"><button type="button" id="purchase-cancel">先不换</button><button type="button" id="purchase-confirm">确认兑换</button></div>`;
 document.body.append(dialog);const $=id=>dialog.querySelector('#purchase-'+id);let current=null,submitting=false;
 function update(){if(!current)return;const s=r.snapshot(),n=Number($('quantity').value),valid=Number.isSafeInteger(n)&&n>=1,total=n*current.cost,max=Math.floor(s.balance/current.cost),ok=valid&&Number.isSafeInteger(total)&&total<=s.balance&&!s.error;
  $('quantity').max=String(max);$('total').textContent=valid&&Number.isSafeInteger(total)?`${n} ${current.packLabel} × ⭐ ${current.cost} = ⭐ ${total}，共 ${n*current.quantity} ${current.unit}`:'请输入至少 1 的整数数量';$('balance').textContent=`现有 ⭐ ${s.balance} · 兑换后 ⭐ ${ok?s.balance-total:'—'}`;
  $('error').textContent=s.error||(!valid?'数量需要是至少 1 的整数。':!ok?'星星不够啦，减少数量试试。':'');$('confirm').disabled=!ok||submitting;$('minus').disabled=submitting||!valid||n<=1;$('plus').disabled=submitting||!valid||n>=max;
 }
 function close(){dialog.close();}
 for(const id of ['close','cancel'])$(id).onclick=close;
 dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();}});
 dialog.addEventListener('close',()=>{const trigger=current?.trigger;current=null;submitting=false;if(trigger)document.getElementById(trigger)?.focus({preventScroll:true});});
 $('quantity').oninput=update;for(const [id,step]of [['minus',-1],['plus',1]])$(id).onclick=()=>{$('quantity').value=String(Number($('quantity').value)+step);update();};
 $('confirm').onclick=()=>{if(submitting||!current)return;update();if($('confirm').disabled)return;submitting=true;const item=current;$('confirm').disabled=true;const result=r.purchase(item.kind,item.id,Number($('quantity').value));if(result.ok){close();item.onResult?.(result);}else{submitting=false;update();$('error').textContent=result.error;}};
 window.addEventListener('garden-rewards-changed',()=>{if(dialog.open)update();});window.addEventListener('storage',()=>{if(dialog.open)update();});
 globalThis.GardenPurchase={open(options){if(dialog.open)return;current={...options,trigger:document.activeElement?.id};submitting=false;$('name').textContent=current.name;$('image').src=current.image;$('image').alt=current.name;$('unit').textContent=`每${current.packLabel} ${current.quantity} ${current.unit} · ⭐ ${current.cost}`;$('quantity').value='1';update();dialog.showModal();$('cancel').focus();}};
})();
