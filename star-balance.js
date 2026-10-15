/* One spendable balance for all subjects; English stickers remain collectibles. */
(() => {
  function refresh(){
    const state=GardenRewards.snapshot();
    for(const node of document.querySelectorAll('[data-star-balance]')){
      const value=state.error?'暂不可用':String(state.balance);
      if(node.textContent!==value)node.textContent=value;
      const link=node.closest('.star-balance');
      link?.setAttribute('aria-label',state.error?'农场星星暂不可用，请家长检查记录':`农场可用星星：${state.balance} 颗，查看农场`);
      if(link)link.title=state.error||'四科每通关一次获得1颗星星，每日不限；每天四科齐了额外送5颗，可兑换农场物品。';
    }
  }
  refresh();window.addEventListener('garden-rewards-changed',refresh);
  window.addEventListener('storage',e=>{if(!e.key||e.key==='learning-garden-rewards-v1')refresh();});
  window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
})();
