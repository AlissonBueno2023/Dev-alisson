(()=>{'use strict';
const $=id=>document.getElementById(id);
const sb=()=>window.sayureSupabase||null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadAuthorizedUsers(){
 const box=$('accessApprovedUsers'),client=sb();if(!box||!client)return;
 const {data:{session}}=await client.auth.getSession();if(!session)return;
 const {data:me,error:meErr}=await client.from('access_profiles').select('user_id,role,status').eq('user_id',session.user.id).maybeSingle();
 if(meErr||!me||me.status!=='approved'||!['owner','admin'].includes(me.role))return;
 box.innerHTML='<p>Carregando usuários...</p>';
 const {data,error}=await client.from('access_profiles').select('user_id,email,role,status').eq('status','approved').order('email',{ascending:true});
 if(error){box.innerHTML='<p>Não foi possível carregar os usuários autorizados.</p>';return}
 const people=(data||[]).filter(p=>p.role!=='owner'&&p.user_id!==session.user.id&&(me.role==='owner'||p.role==='user'));
 if(!people.length){box.innerHTML='<p>Nenhum outro usuário autorizado para gerenciar.</p>';return}
 box.innerHTML=people.map(p=>'<div class="access-request"><div><b>'+esc(p.email||'Usuário')+'</b><small>'+(p.role==='admin'?'Administrador':'Acesso autorizado')+'</small></div><div><button type="button" class="access-revoke" data-user-id="'+esc(p.user_id)+'" data-user-email="'+esc(p.email||'este usuário')+'">Remover acesso</button></div></div>').join('');
 box.querySelectorAll('.access-revoke').forEach(btn=>btn.addEventListener('click',async()=>{
  const id=btn.dataset.userId,email=btn.dataset.userEmail;
  if(!confirm('Remover o acesso de '+email+'? Essa pessoa deixará de poder usar o Sayure TV.'))return;
  btn.disabled=true;
  try{const {error}=await client.rpc('revoke_user_access',{target_user_id:id});if(error)throw error;await loadAuthorizedUsers();alert('Acesso removido. A conta não poderá mais acessar a biblioteca.')}
  catch(err){console.error('Sayure revoke access',err);alert('Não foi possível remover o acesso. Confirme se a atualização SQL foi aplicada no Supabase.')}
  finally{btn.disabled=false}
 }));
}
function init(){const modal=$('accountModal');if(!modal)return;new MutationObserver(()=>{if(modal.classList.contains('open'))loadAuthorizedUsers()}).observe(modal,{attributes:true,attributeFilter:['class']});const refresh=$('refreshRequests');if(refresh)refresh.addEventListener('click',loadAuthorizedUsers)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();