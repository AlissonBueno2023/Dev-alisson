(()=>{'use strict';
const STORE='sayure-library-v3';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function items(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(_){return[]}}
function renderAll(){
 const box=$('#watchlist'),empty=$('#empty'),count=$('#count');if(!box||!empty||!count)return;
 const list=items(),pt=document.documentElement.lang!=='en';
 document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
 box.innerHTML='';empty.style.display=list.length?'none':'block';
 count.textContent=`${list.length} ${pt?(list.length===1?'título':'títulos'):(list.length===1?'title':'titles')}`;
 list.forEach((x,i)=>{
  const card=document.createElement('article');card.className='card';
  const type=x.media_type==='movie'?(pt?'Filme':'Movie'):(pt?'Série':'Series');
  const status=x.status==='completed'?(pt?'Concluído ✓':'Completed ✓'):x.status==='watchlist'?(pt?'Quero assistir':'Watchlist'):x.media_type==='movie'?(pt?'Assistindo':'Watching'):x.verified?`T${x.season} • E${x.episode}`:(pt?'Escolha onde parou':'Choose your episode');
  card.innerHTML=`<img src="${esc(x.image||'')}" alt=""><div class="card-info"><span class="kind">${type}</span><h3>${esc(x.name||'')}</h3><div class="meta">${status}</div><div class="progressbar"><i style="width:${x.status==='completed'?100:(x.progress||0)}%"></i></div><button class="episodebtn" data-open="${i}">${pt?'Abrir detalhes':'Open details'}</button><button class="editbtn" data-fav="${i}">${x.favorite?(pt?'♥ Favorito':'♥ Favorite'):(pt?'♡ Favoritar':'♡ Favorite')}</button></div>`;
  box.appendChild(card);
 });
 $('#continueSection')?.scrollIntoView({behavior:'smooth'});
}
function init(){const nav=$('#navList');if(!nav)return;nav.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();renderAll()},true)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();