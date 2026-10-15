try {
  const keys = {};
  for (const key of ['abc-garden-v1', 'abc-garden-v2', 'learning-garden-rewards-v1', 'learning-garden-study-v1', 'learning-garden-literacy-v2', 'learning-garden-poetry-v1', 'learning-garden-mistakes-v1']) {
    const value = localStorage.getItem(key);
    if (value !== null) keys[key] = value;
  }
  const backup = { format:'children-learning-garden-backup', version:1, origin:location.origin, exportedAt:new Date().toISOString(), keys };
  const data = JSON.stringify(backup, null, 2);
  document.querySelector('#record-data').value = data;
  const progress = JSON.parse(keys['abc-garden-v2'] || keys['abc-garden-v1'] || '{}');
  document.querySelector('#summary').textContent = `已接触 ${progress.seen?.length || 0} 个单词 · 首次独立答对 ${Object.values(progress.correct || {}).reduce((a,b)=>a+b,0)} 次\n完成 ${progress.rounds || 0} 个游戏 · ${progress.stickers?.length || 0} 颗星星`;
  document.querySelector('#download-records').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([data], { type:'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learning-records.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
} catch {
  document.querySelector('#summary').textContent = '无法读取本浏览器的学习记录。请使用原来的本地地址和浏览器。';
  document.querySelector('#download-records').disabled = true;
}
