(()=>{'use strict';
const STORE='sayure-library-v3';
const $=s=>document.querySelector(s);
function sb(){return window.sayureSupabase||null}
function toast(text){const t=$('#toast');if(!t)return;t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)}
async function session(){const c=sb();if(!c)return null;const {data}=await c.auth.getSession();return data&&data.session?data.session:null}
async function clearMine(){const s=await session();if(!s)return toast('Entre novamente para continuar.');if(!confirm('Isso vai apagar toda a sua biblioteca, progresso, favoritos e títulos salvos. Sua conta, senha e foto serão mantidas. Continuar?'))return;if(!confirm('Última confirmação: deseja realmente ZERAR seu Sayure TV?'))return;const c=sb();const {error}=await c.from('library').delete().eq('user_id',s.user.id);if(error){console.error(error);return toast('Não foi possível limpar seus dados.')}localStorage.removeItem(STORE);toast('Seu Sayure TV foi zerado ✓');setTimeout(()=>location.reload(),900)}
function inject(){const card=$('#accountModal .account-card');if(!card||$('#dataPrivacySection'))return;const logout=$('#logout');const wrap=document.createElement('div');wrap.id='dataPrivacySection';wrap.className='data-privacy-section';wrap.innerHTML=`<hr><h3>Dados e privacidade</h3><p>Controle seus dados do Sayure TV.</p><button id="clearMySayure" class="danger-data-btn" type="button">Zerar meu Sayure TV</button><small>Apaga biblioteca, progresso e favoritos. Login, senha e foto continuam salvos.</small>`;card.insertBefore(wrap,logout);$('#clearMySayure').addEventListener('click',clearMine)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',inject):inject();
})();