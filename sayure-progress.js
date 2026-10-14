(()=>{
'use strict';
const STORE='sayure-library-v3';
const API='https://sayure-tv.alissonbueno2012.workers.dev/api';
const CACHE='sayure-progress-cache-v1';
const cache=(()=>{try{return JSON.parse(localStorage.getItem(CACHE)||'{}')}catch(_){return{}}})();
function library(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(_){return[]}}
function lang(){return localStorage.getItem('sayure-lang')||'pt-BR'}
function api(path){return fetch(`${API}${path}${path.includes('?')?'&':'?'}language=${lang()}`).then(r=>{if(!r.ok)throw Error(`API ${r.status}`);return r.json()})}
function clamp(n){return Math.max(0,Math.min(100,Math.round(Number(n)||0)))}
function watchedBeforeSeason(seasons,current){return seasons.filter(s=>s.season_number>0&&s.season_number<current).reduce((n,s)=>n+(s.episode_count||0),0)}
function calculate(item,d){if(item.status==='completed')return 100;if(item.media_type==='movie')return clamp(item.progress);if(!item.verified||!item.season||!item.episode)return 0;const seasons=(d.seasons||[]).filter(s=>s.season_number>0);const total=seasons.reduce((n,s)=>n+(s.episode_count||0),0);if(!total)return clamp(item.progress);const watched=watchedBeforeSeason(seasons,Number(item.season))+Math.max(0,Number(item.episode)||0);return clamp(watched/total*100)}
async function ensure(item){if(item.media_type!=='tv')return clamp(item.progress);const k=String(item.id),now=Date.now();let entry=cache[k];if(!entry||now-entry.time>86400000){const d=await api(`/tv/${item.id}`);entry={time:now,seasons:(d.seasons||[]).filter(s=>s.season_number>0).map(s=>({season_number:s.season_number,episode_count:s.episode_count||0}))};cache[k]=entry;localStorage.setItem(CACHE,JSON.stringify(cache))}return calculate(item,{seasons:entry.seasons})}
function paint(item,pct){document.querySelectorAll('.card').forEach(card=>{const h=card.querySelector('h3');if(!h||h.textContent.trim()!==item.name)return;const bar=card.querySelector('.progressbar');if(bar){const fill=bar.querySelector('i');if(fill)fill.style.width=`${pct}%`;let label=card.querySelector('.progress-percent');if(!label){label=document.createElement('div');label.className='progress-percent';bar.insertAdjacentElement('afterend',label)}label.textContent=lang()==='pt-BR'?`${pct}% assistido`:`${pct}% watched`}})}
async function refresh(){const items=library();for(const item of items){try{const pct=await ensure(item);paint(item,pct)}catch(_){paint(item,clamp(item.progress))}}}
window.sayureProgress={calculate,refresh};
const observer=new MutationObserver(()=>{clearTimeout(refresh.t);refresh.t=setTimeout(refresh,80)});
function init(){const w=document.getElementById('watchlist');if(w)observer.observe(w,{childList:true,subtree:true});refresh()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();