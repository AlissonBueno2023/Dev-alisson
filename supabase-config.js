const SUPABASE_URL='https://pywmdluvbgqcbnvfpnve.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_7eO0H5cWNVRqRh0TSOp3TA_QKFe_IA0';
window.sayureSupabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const authSyncScript=document.createElement('script');authSyncScript.src='auth-sync.js?v=2';authSyncScript.defer=true;document.head.appendChild(authSyncScript);