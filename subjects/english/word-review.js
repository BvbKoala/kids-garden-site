/* Local spaced practice; stages describe observed practice, not a guarantee of memory. */
(() => {
  const day = 86400000;
  const intervals = [1, 3, 7, 14, 30];
  function isDue(entry, now=Date.now()) {
    const date = new Date(now), due = new Date(entry.nextDue);
    const key = d => d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    return entry.stage < intervals.length && key(due) <= key(date);
  }
  function normalize(value, ids) {
    const result = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    for (const id of ids) {
      const entry = value[id];
      if (!entry || typeof entry !== 'object') continue;
      const number = key => Number.isFinite(entry[key]) && entry[key] >= 0 ? entry[key] : 0;
      const stage = Math.min(intervals.length, Math.floor(number('stage')));
      result[id] = {...entry, stage, mistakes:Math.max(1, Math.floor(number('mistakes'))),
        nextDue:number('nextDue'), lastMistake:number('lastMistake'), lastReviewed:number('lastReviewed'),
        masteredAt:stage === intervals.length ? number('masteredAt') : 0};
    }
    return result;
  }
  function mistake(records, id, now = Date.now()) {
    const old = records[id];
    records[id] = {...old, mistakes:(old?.mistakes || 0) + 1, stage:0, nextDue:now,
      lastMistake:now, lastReviewed:old?.lastReviewed || 0, masteredAt:0};
  }
  function settle(records, ids, failed, now = Date.now()) {
    for (const id of new Set(ids)) {
      const entry = records[id];
      if (!entry) continue;
      if (failed.has(id)) {
        Object.assign(entry, {stage:0, nextDue:now + day, lastReviewed:now, masteredAt:0});
      } else if (isDue(entry,now)) {
        // A first clean correction begins the one-day interval. Later due successes advance it.
        if (!entry.lastReviewed || entry.lastReviewed < entry.lastMistake) {
          Object.assign(entry, {stage:0, nextDue:now + day, lastReviewed:now, masteredAt:0});
        } else {
          entry.stage++;
          entry.lastReviewed = now;
          entry.masteredAt = entry.stage === intervals.length ? now : 0;
          entry.nextDue = entry.masteredAt ? 0 : now + intervals[entry.stage] * day;
        }
      }
    }
  }
  function active(records) { return Object.keys(records).filter(id => records[id].stage < intervals.length); }
  function due(records, now = Date.now()) { return active(records).filter(id => isDue(records[id],now)); }
  globalThis.GardenWordReview = Object.freeze({intervals, isDue, normalize, mistake, settle, active, due});
})();
