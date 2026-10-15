// Sayure TV — secure API proxy for Cloudflare Workers
// Worker secrets required: TMDB_TOKEN and GIPHY_KEY. Never commit tokens to GitHub.
const TMDB='https://api.themoviedb.org/3';
const GIPHY='https://api.giphy.com/v1/gifs/search';
const ALLOWED=['/search/multi','/trending/all/week','/movie/popular','/tv/popular','/discover/tv'];
const TRUSTED_ORIGINS=new Set(['https://sayuretv.com','https://www.sayuretv.com','https://sayure-tv.alissonbueno2012.workers.dev']);
function corsFor(request){const origin=request.headers.get('Origin');const allowed=!origin||TRUSTED_ORIGINS.has(origin);return{allowed,headers:{'Access-Control-Allow-Origin':origin&&TRUSTED_ORIGINS.has(origin)?origin:'https://sayuretv.com','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'}}}
export default {async fetch(request,env){
 const cors=corsFor(request);
 if(!cors.allowed)return json({error:'Origin not allowed'},403,cors.headers);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors.headers});
 if(request.method!=='GET')return json({error:'Method not allowed'},405,cors.headers);
 const u=new URL(request.url);
 const path=u.pathname.replace(/^\/api/,'');
 if(path==='/gif/reaction')return gifReaction(u,env,cors.headers);
 if(!env.TMDB_TOKEN)return json({error:'TMDB_TOKEN not configured'},503,cors.headers);
 if(!ALLOWED.includes(path)&&!/^\/(movie|tv)\/\d+(\/season\/\d+)?$/.test(path))return json({error:'Route not allowed'},404,cors.headers);
 const target=new URL(TMDB+path);u.searchParams.forEach((v,k)=>target.searchParams.set(k,v));if(!target.searchParams.has('language'))target.searchParams.set('language','pt-BR');
 try{const r=await fetch(target,{headers:{Authorization:`Bearer ${env.TMDB_TOKEN}`,accept:'application/json'}});const body=await r.text();return new Response(body,{status:r.status,headers:{...cors.headers,'Content-Type':'application/json;charset=UTF-8','Cache-Control':'public,max-age=300'}})}catch{return json({error:'TMDB unavailable'},502,cors.headers)}
}};
async function gifReaction(u,env,cors){
 if(!env.GIPHY_KEY)return json({error:'GIPHY_KEY not configured'},503,cors);
 const title=(u.searchParams.get('title')||'').trim().slice(0,100);
 const mood=u.searchParams.get('mood')==='bad'?'bad':'good';
 if(!title)return json({error:'Missing title'},400,cors);
 const good=['happy reaction','celebration reaction','excited reaction','yes reaction','win reaction'];
 const bad=['funny fail reaction','disappointed reaction','confused reaction','facepalm reaction','shocked reaction'];
 const moods=mood==='good'?good:bad;
 const query=`${title} ${moods[Math.floor(Math.random()*moods.length)]}`;
 try{
  let items=await giphySearch(query,env.GIPHY_KEY);
  if(!items.length)items=await giphySearch(mood==='good'?'happy celebration reaction':'funny fail reaction',env.GIPHY_KEY);
  if(!items.length)return json({gif:null},{status:200,cache:'no-store',cors});
  const pool=items.slice(0,Math.min(items.length,15));
  const g=pool[Math.floor(Math.random()*pool.length)];
  const url=g?.images?.fixed_height?.url||g?.images?.downsized_medium?.url||g?.images?.original?.url||null;
  return json({gif:url?{url,title:g.title||'Reaction GIF',source:'GIPHY'}:null},{status:200,cache:'no-store',cors});
 }catch{return json({error:'GIPHY unavailable'},502,cors)}
}
async function giphySearch(q,key){const target=new URL(GIPHY);target.searchParams.set('api_key',key);target.searchParams.set('q',q);target.searchParams.set('limit','20');target.searchParams.set('rating','pg-13');target.searchParams.set('lang','en');const r=await fetch(target);if(!r.ok)throw new Error('GIPHY '+r.status);const d=await r.json();return d.data||[]}
function json(data,options=200,cors={}){let status=200,cache='no-store',headers=cors;if(typeof options==='number')status=options;else{status=options.status||200;cache=options.cache||cache;headers=options.cors||headers}return new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json;charset=UTF-8','Cache-Control':cache}})}