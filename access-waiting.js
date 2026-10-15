(()=>{
'use strict';
const API='https://sayure-tv.alissonbueno2012.workers.dev/api';
let loaded=false;
async function loadWaitingGif(){
 const gate=document.getElementById('accessGate'),wrap=document.getElementById('accessWaitingGif'),img=document.getElementById('accessWaitingGifImg');
 if(!gate||!wrap||!img||gate.classList.contains('hidden')||loaded)return;
 loaded=true;
 try{
  const r=await fetch(`${API}/gif/reaction?title=${encodeURIComponent('waiting for approval')}&mood=waiting`,{cache:'no-store'});
  if(!r.ok)throw new Error('GIF unavailable');
  const d=await r.json();
  if(d&&d.gif&&d.gif.url){img.src=d.gif.url;img.alt=d.gif.title||'GIF engraçado enquanto aguarda aprovação';wrap.classList.add('show');}
 }catch(_){wrap.innerHTML='<div class="access-waiting-fallback">⏳😂</div><small>Enquanto isso... seguimos esperando 😅</small>';wrap.classList.add('show')}
}
const observer=new MutationObserver(()=>{const gate=document.getElementById('accessGate');if(gate&&!gate.classList.contains('hidden'))loadWaitingGif()});
function init(){const gate=document.getElementById('accessGate');if(!gate)return;observer.observe(gate,{attributes:true,attributeFilter:['class']});if(!gate.classList.contains('hidden'))loadWaitingGif()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();