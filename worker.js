// Sayure TV — secure API proxy for Cloudflare Workers
// Worker secrets required: TMDB_TOKEN and GIPHY_KEY. Never commit tokens to GitHub.
const TMDB='https://api.themoviedb.org/3';
const GIPHY='https://api.giphy.com/v1/gifs/search';
const ALLOWED=['/search/multi','/trending/all/week','/movie/popular','/tv/popular','/discover/tv'];
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
export default {async fetch(request,env){
 if(request.method==='OPTIONS')return new Response(null,{headers:cors});
 if(request.method!=='GET')return json({error:'Method not allowed'},405);
 const u=new URL(request.url);
 const path=u.pathname.replace(/^\/api/,'');
 if(path==='/gif/reaction')return gifReaction(u,env);
 if(!env.TMDB_TOKEN)return json({error:'TMDB_TOKEN not configured'},503);
 if(!ALLOWED.includes(path)&&!/^\/(movie|tv)\/\d+(\/season\/\d+)?$/.test(path))return json({error:'Route not allowed'},404);
 const target=new URL(TMDB+path);u.searchParams.forEach((v,k)=>target.searchParams.set(k,v));if(!target.searchParams.has('language'))target.searchParams.set('language','pt-BR');
 try{const r=await fetch(target,{headers:{Authorization:`Bearer ${env.TMDB_TOKEN}`,accept:'application/json'}});const body=await r.text();return new Response(body,{status:r.status,headers:{...cors,'Content-Type':'application/json;charset=UTF-8','Cache-Control':'public,max-age=300'}})}catch{return json({error:'TMDB unavailable'},502)}
}};
async function gifReaction(u,env){
 if(!env.GIPHY_KEY)return json({error:'GIPHY_KEY not configured'},503);
 const title=(u.searchParams.get('title')||'').trim().slice(0,100);
 const mood=u.searchParams.get('mood')==='bad'?'bad':'good';
 if(!title)return json({error:'Missing title'},400);
 const good=['happy reaction','celebration reaction','excited reaction','yes reaction','win reaction'];
 const bad=['funny fail reaction','disappointed reaction','confused reaction','facepalm reaction','shocked reaction'];
 const moods=mood==='good'?good:bad;
 const query=`${title} ${moods[Math.floor(Math.random()*moods.length)]}`;
 try{
  let items=await giphySearch(query,env.GIPHY_KEY);
  if(!items.length)items=await giphySearch(mood==='good'?'happy celebration reaction':'funny fail reaction',env.GIPHY_KEY);
  if(!items.length)return json({gif:null});
  const pool=items.slice(0,Math.min(items.length,15));
  const g=pool[Math.floor(Math.random()*pool.length)];
  const url=g?.images?.fixed_height?.url||g?.images?.downsized_medium?.url||g?.images?.original?.url||null;
  return json({gif:url?{url,title:g.title||'Reaction GIF',source:'GIPHY'}:null},{status:200,cache:'no-store'});
 }catch{return json({error:'GIPHY unavailable'},502)}
}
async function giphySearch(q,key){const target=new URL(GIPHY);target.searchParams.set('api_key',key);target.searchParams.set('q',q);target.searchParams.set('limit','20');target.searchParams.set('rating','pg-13');target.searchParams.set('lang','en');const r=await fetch(target);if(!r.ok)throw new Error('GIPHY '+r.status);const d=await r.json();return d.data||[]}
function json(data,options=200){let status=200,cache='no-store';if(typeof options==='number')status=options;else{status=options.status||200;cache=options.cache||cache}return new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json;charset=UTF-8','Cache-Control':cache}})}