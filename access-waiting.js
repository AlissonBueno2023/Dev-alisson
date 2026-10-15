(()=>{
'use strict';
const API='https://sayure-tv.alissonbueno2012.workers.dev/api';
let loaded=false;
function ensureGifBox(){
 const gate=document.getElementById('accessGate'),card=gate&&gate.querySelector('.auth-card'),text=document.getElementById('accessGateText');
 if(!gate||!card)return null;
 let wrap=document.getElementById('accessWaitingGif');
 if(!wrap){wrap=document.createElement('div');wrap.id='accessWaitingGif';wrap.className='access-waiting-gif';wrap.innerHTML='<img id="accessWaitingGifImg" alt="GIF engraçado enquanto aguarda aprovação"><small>Enquanto isso... um GIF pra ajudar na espera 😂</small>';if(text)text.insertAdjacentElement('afterend',wrap);else card.prepend(wrap)}
 return wrap;
}
async function loadWaitingGif(){
 const gate=document.getElementById('accessGate'),wrap=ensureGifBox(),img=document.getElementById('accessWaitingGifImg');
 if(!gate||!wrap||!img||gate.classList.contains('hidden')||loaded)return;
 loaded=true;
 try{
  const r=await fetch(`${API}/gif/reaction?title=${encodeURIComponent('waiting for approval')}&mood=waiting`,{cache:'no-store'});
  if(!r.ok)throw new Error('GIF unavailable');
  const d=await r.json();
  if(d&&d.gif&&d.gif.url){img.src=d.gif.url;img.alt=d.gif.title||'GIF engraçado enquanto aguarda aprovação';wrap.classList.add('show');return}
  throw new Error('No GIF');
 }catch(_){wrap.innerHTML='<div class="access-waiting-fallback">⏳😂</div><small>Enquanto isso... seguimos esperando 😅</small>';wrap.classList.add('show')}
}
const observer=new MutationObserver(()=>{const gate=document.getElementById('accessGate');if(gate&&!gate.classList.contains('hidden'))loadWaitingGif()});
function init(){const gate=document.getElementById('accessGate');if(!gate)return;ensureGifBox();observer.observe(gate,{attributes:true,attributeFilter:['class']});if(!gate.classList.contains('hidden'))loadWaitingGif()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();