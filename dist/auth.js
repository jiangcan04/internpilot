/* Account interaction prototype. No passwords, identity verification or cloud sync. */
const DEMO_SESSION='internpilot-demo-session-v1';
const demoAccounts=[{id:'primary',label:'主体验账号',name:'示例同学',hint:'保留你此前在本浏览器中的岗位与档案记录',mark:'示'},{id:'secondary',label:'独立体验账号',name:'体验同学',hint:'独立的求职空间，首次进入从空岗位池开始',mark:'体'}];
const legacyAccountState=structuredClone(state);
const workspaceRender=render,workspaceSave=save;
let activeAccount=null,loginAccount='primary',loginNotice='',loginError='';
function accountSessionReady(){return Boolean(activeAccount)}
function accountKey(id){return 'internpilot-account-'+id+'-v1'}
function readAccount(id){
 const raw=localStorage.getItem(accountKey(id));
 if(raw){const x=JSON.parse(raw);if(!x?.profile||!Array.isArray(x.jobs)||!Array.isArray(x.messages)||!Array.isArray(x.history))throw Error('invalid-account');return {...fresh(),...x,profile:{...initialProfile,...x.profile}}}
 if(id==='primary')return structuredClone(legacyAccountState);
 const next=fresh();next.profile={...next.profile,name:'体验同学',resume:'',resumeName:'',experiences:[]};next.jobs.forEach(j=>{j.inPool=false;j.archived=false;j.saved=false;j.status='pending';delete j.date;delete j.note;delete j.greeting});next.history=[];next.messages=[];return next;
}
function clearAccountRuntime(){
 clearInterval(taskTimer);clearTimeout(window.queryTimer);clearTimeout(toastTimer);taskTimer=null;task={running:false,step:0,status:'idle'};
 resetExperienceUi();manualJobDraft=null;searchDraft=null;lastUndo=null;selected.clear();chatContext=null;chatOpen=false;drawerJob=null;drawerTab='match';modal=null;onboardDraft={};onboardStep=1;greetingStyle='natural';page='dashboard';filter=defaultFilters();
 document.getElementById('overlay-root').innerHTML='';document.getElementById('toast-root').innerHTML='';document.body.style.overflow='';
}
function loginPage(){
 return `<main class="login-shell"><section class="login-story"><div class="logo"><span class="logo-mark">${icon('send')}</span>InternPilot</div><div class="login-story-copy"><span class="login-eyebrow">YOUR NEXT CHAPTER</span><h1>找到值得跟进的机会，<br>走好求职的每一步。</h1><p>从发现岗位、核对匹配依据，到收藏重点机会、记录投递进度，让你的实习求职有迹可循。</p><div class="login-feature-list">${[['search','发现适合的机会','获取与初筛岗位，保留判断依据'],['brief','管理自己的岗位池','自主选择、收藏重点、追踪进度'],['user','逐步完善个人档案','确认并保存你的真实经历与能力']].map(([i,t,d])=>`<div><span class="login-feature-icon">${icon(i)}</span><div><strong>${t}</strong><small>${d}</small></div></div>`).join('')}</div></div><small class="login-story-footer">为大学生的实习探索而设计</small></section><section class="login-panel"><div class="login-card"><span class="tag purple">交互原型 · 演示登录</span><h2>欢迎来到 InternPilot</h2><p class="login-subtitle">选择一个演示账号，进入你的求职工作台。</p>${loginNotice?`<div class="login-notice" role="status">${esc(loginNotice)}</div>`:''}<fieldset class="login-accounts"><legend>选择演示账号</legend>${demoAccounts.map(a=>`<label class="login-account ${loginAccount===a.id?'selected':''}"><input type="radio" name="demo-account" value="${a.id}" ${loginAccount===a.id?'checked':''} onchange="chooseLoginAccount(this.value)"><span class="avatar">${a.mark}</span><span><strong>${a.label}</strong><small>${a.hint}</small></span>${icon('check')}</label>`).join('')}</fieldset>${loginError?`<p class="login-error" role="alert">${esc(loginError)}</p>`:''}<button class="button primary login-submit" onclick="loginDemo()">登录并进入工作台 ${icon('arrow')}</button><div class="login-boundary">${icon('info')}<p>这是演示账号体验，无需输入手机号或密码。记录仅保存在当前浏览器；尚未接入真实身份认证与跨设备同步。</p></div><p class="login-platform-note">此处登录 InternPilot，与招聘平台账号登录相互独立。</p></div><small class="login-panel-footer">实习岗位匹配与求职管理助手</small></section></main>`
}
function chooseLoginAccount(id){if(!demoAccounts.some(a=>a.id===id))return;loginAccount=id;loginError='';render()}
render=function(){if(!activeAccount){document.title='登录 · InternPilot';document.getElementById('app').innerHTML=loginPage();return}workspaceRender()};
save=function(){if(!activeAccount)return false;try{if(localStorage.getItem(DEMO_SESSION)!==activeAccount){toast('账号会话已变化，请重新登录后操作。');return false}}catch{toast('无法读取浏览器存储，请重试。');return false}return workspaceSave()};
function loginDemo(id=loginAccount){
 if(!demoAccounts.some(a=>a.id===id))return false;
 let next;try{next=readAccount(id);localStorage.setItem(accountKey(id),JSON.stringify(next));localStorage.setItem(DEMO_SESSION,id)}catch{loginError='无法读取或保存此账号的数据，请检查浏览器存储后重试。原有数据未清除。';render();return false}
 clearAccountRuntime();activeAccount=id;STORAGE=accountKey(id);state=next;migratePool();syncExperienceFlags();loginError='';loginNotice='';render();return true;
}
function openAccountMenu(){if(!activeAccount)return;modal='account';const a=demoAccounts.find(a=>a.id===activeAccount);showModal(`${modalHead('账号管理','当前为浏览器本地的演示账号。')}<div class="account-profile"><span class="avatar">${esc(state.profile.name.slice(-1))}</span><div><strong>${esc(state.profile.name)}</strong><small>${esc(a.label)} · 演示登录</small></div></div><div class="account-menu-actions"><button onclick="closeOverlay();nav('profile')">${icon('user')}个人档案 ${icon('chevron')}</button><button onclick="requestAccountExit('switch')">${icon('refresh')}切换账号 ${icon('chevron')}</button><button class="danger-text" onclick="requestAccountExit('logout')">${icon('logout')}退出登录 ${icon('chevron')}</button></div><p class="account-menu-note">不同演示账号的岗位池、档案和投递记录分别保存。此功能用于演示账号流程，不提供真实访问权限保护。</p>`)}
function requestAccountExit(mode){if(!activeAccount)return;modal='account-exit';showModal(`${modalHead(mode==='switch'?'切换到其他账号？':'退出当前账号？','已保存的岗位、个人档案和投递记录会保留。')}<div class="info-note">${icon('info')}<span>正在进行的演示搜索将停止。未提交的输入和草稿不会保存，请先完成需要保留的编辑。</span></div><div class="footer"><button class="button" onclick="closeOverlay()">继续使用</button><button class="button primary" onclick="finishAccountExit('${mode==='switch'?'switch':'logout'}')">${mode==='switch'?'前往切换账号':'确认退出登录'}</button></div>`)}
function finishAccountExit(mode){
 if(!activeAccount)return false;if(!save())return false;
 const previous=activeAccount;try{localStorage.removeItem(DEMO_SESSION)}catch{toast('退出未完成，请检查浏览器存储后重试。');return false}
 clearAccountRuntime();activeAccount=null;state=fresh();STORAGE='internpilot-signed-out';loginAccount=mode==='switch'?demoAccounts.find(a=>a.id!==previous).id:previous;loginNotice=mode==='switch'?'已保留当前记录，选择另一个演示账号继续。':'你已退出登录，已保存记录会在下次登录时恢复。';loginError='';render();return true;
}
window.addEventListener?.('storage',e=>{if(e.key!==DEMO_SESSION)return;clearAccountRuntime();activeAccount=null;state=fresh();STORAGE='internpilot-signed-out';loginNotice='账号状态已在其他标签页发生变化，请重新选择账号登录。';loginError='';render()});
function bootAccountSession(){
 try{const id=localStorage.getItem(DEMO_SESSION);if(demoAccounts.some(a=>a.id===id)){const next=readAccount(id);activeAccount=id;STORAGE=accountKey(id);state=next;migratePool();syncExperienceFlags()}else{activeAccount=null;state=fresh();STORAGE='internpilot-signed-out'}}catch{activeAccount=null;state=fresh();STORAGE='internpilot-signed-out';loginError='上次会话未能恢复，请重新选择演示账号。'}
 render();
}
bootAccountSession();
