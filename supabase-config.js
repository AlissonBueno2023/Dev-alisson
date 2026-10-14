const SUPABASE_URL='https://pvwmdluvbqqcbnyfpnve.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_7eO0H5cWNVRqRh0TSOp3TA_QKFe_IA0';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function sayureFetch(input,init){let last;for(let attempt=0;attempt<4;attempt++){try{if(attempt)await sleep(450*attempt);return await fetch(input,init)}catch(err){last=err;const text=String(err&&err.message||err);if(!/load failed|failed to fetch|network/i.test(text)||attempt===3)throw err}}throw last}
window.sayureSupabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{global:{fetch:sayureFetch},auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});