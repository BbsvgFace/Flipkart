// npm install --no-save playwright (development only), then node tests/browser.test.cjs
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.SAATH_TEST_URL||pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const out=process.env.SAATH_QA_OUTPUT||path.resolve(__dirname,'artifacts');fs.mkdirSync(out,{recursive:true});
const passed=[],errors=[];
let browser,page;
const ok=name=>{passed.push(name);console.log('PASS',name)};
const act=(name)=>page.locator(`[data-action="${name}"]`).first();
const nav=async route=>{await page.goto(base+'#'+route);await page.locator('#main').waitFor()};
const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('saath.prototype.v1')));
const clickGo=async route=>page.locator(`[data-action="go"][data-path="${route}"]`).first().click();
async function login(role,id){
  await nav('/settings');if(await act('logout').count())await act('logout').click();else await nav('/roles');
  await page.locator(`[data-action="role"][data-role="${role}"]`).click();
  if(role==='civilian'){await page.locator('#phone').fill(id||'9000000001');await page.locator('#login-form button[type=submit]').click();await page.locator('#otp').fill('123456');}
  else {await page.locator('#volunteer-id').fill(id||'SAATH-V101');await page.locator('#volunteer-pin').fill('2468');}
  await page.locator('#login-form button[type=submit]').click();
  await page.waitForURL(/#\/(home|overview)$/);
  await page.locator(role==='civilian'?'.hero-report':'.hero-overview').waitFor();
  await page.evaluate(()=>document.fonts.ready);
}
async function intake(voice=false){
  await page.locator(`[data-action="begin"][data-mode="${voice?'voice':'manual'}"]`).first().click();
  await page.locator('[name=danger][value=no]').check();await act('safety-next').click();
  if(voice){await act('record').click();await act('voice-example').click();await page.locator('#voice-form button[type=submit]').click();}
  else {await page.locator('#main [data-action=open-selection][data-field=criteria]').click();await page.locator('[name=criteria][value=essentials]').check();await page.locator('#dialog [data-action=close-dialog]').first().click();await page.locator('#main [data-action=open-selection][data-field=needs]').click();await page.locator('[name=needs][value=food]').check();await page.locator('#dialog [data-action=close-dialog]').first().click();}
  await page.locator('#relation').selectOption('neighbor');await page.locator('#evidence').selectOption('observed');await page.locator('#landmark').fill('Fictional house 18, near the community library');await page.locator('#subjectConsent').selectOption('yes');
  await page.locator('#intake-form button[type=submit]').click();await page.waitForURL(/#\/review$/);await page.locator('[name=confirm]').check();await page.locator('#review-form button[type=submit]').click();await page.waitForURL(/#\/receipt\//);
  const id=(await data()).records[0].id;
  await page.locator('.case-number').filter({hasText:id}).waitFor();
  return id;
}
(async()=>{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await ctx.addInitScript(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined;});
  page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(base);await page.locator('#language-input').waitFor();
  assert.match(await page.title(),/SAATH/);ok('Portable file entry renders');
  await page.screenshot({path:path.join(out,'01-language-mobile.png'),fullPage:true});
  await page.locator('[data-action=language][data-lang=hi]').click();assert.equal(await page.locator('html').getAttribute('lang'),'hi');await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'hi');await act('toggle-lang').click();ok('English/Hindi switching persists across reload');
  await page.locator('#language-input').fill('Hindi');await page.locator('#language-form button[type=submit]').click();await page.locator('#dialog [data-action=confirm-language]').click();assert.equal(await page.locator('html').getAttribute('lang'),'hi');await act('toggle-lang').click();ok('Typed language detection requires confirmation');
  await login('civilian');ok('Separate civilian phone and demo OTP entrance');
  await page.screenshot({path:path.join(out,'02-civilian-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(out,'03-civilian-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});
  await page.locator('[data-action=begin][data-mode=manual]').click();await page.locator('[name=danger][value=yes]').check();assert((await page.locator('#main').innerText()).includes('Do not wait for a SAATH report'));await page.locator('[name=danger][value=no]').check();await act('safety-next').click();await page.locator('#name').fill('Fictional neighbour');await page.locator('#intake-form button[type=submit]').click();assert(await page.locator('.notice.red').count());assert.equal((await data()).records.length,4);await act('save-draft').click();await act('resume').click();assert.equal(await page.locator('#name').inputValue(),'Fictional neighbour');await nav('/home');ok('Safety referral, incomplete-form validation and saved-draft resume');
  const id=await intake(true);assert.equal((await data()).records[0].transport,'ack');ok('Voice unsupported fallback → shared form → review → acknowledged receipt');
  await page.screenshot({path:path.join(out,'04-receipt-mobile.png'),fullPage:true});
  await page.reload();assert.equal((await data()).records[0].id,id);ok('Submitted report survives reload');
  await login('volunteer');ok('Separate volunteer ID entrance');
  await page.screenshot({path:path.join(out,'05-volunteer-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(out,'06-volunteer-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});
  await nav('/cases');assert(await page.locator(`[data-path="/case/${id}"]`).count());assert.equal(await page.locator('[data-path="/case/ST-2044"]').count(),0);ok('Civilian report appears only in eligible volunteer zone');
  await clickGo('/case/'+id);assert(!(await page.locator('#main').innerText()).includes('Fictional house 18'));await act('ack').click();let c=(await data()).records.find(c=>c.id===id);assert.equal(c.tasks[0].status,'available');ok('Pre-assignment personal details hidden; acknowledgement does not accept');
  await nav('/case/ST-2042');assert(await act('accept').isDisabled());await nav('/case/ST-2043');assert(await act('accept').isDisabled());ok('General volunteer blocked from specialist and protected child tasks');
  await nav('/case/'+id);const task=(await data()).records.find(c=>c.id===id).tasks.find(t=>t.type==='essentials');await page.locator(`[data-action=accept][data-task="${task.id}"]`).click();assert((await page.locator('#main').innerText()).includes('Fictional house 18'));ok('Eligible acceptance unlocks case details');
  await clickGo(`/check/${id}/${task.id}`);await page.locator('#contact').selectOption('reached');await page.locator('#consent').selectOption('yes');await page.locator('#note').fill('Spoke directly; person requested a meal and water. No medical assessment.');await page.locator('#check-form button[type=submit]').click();await page.waitForURL(new RegExp('#/case/'+id+'$'));
  await clickGo(`/outcome/${id}/${task.id}`);await page.locator('#note').fill('Delivered one meal and drinking water. Recipient confirmed receipt.');await page.locator('#confirmation').selectOption('confirmed');await page.locator('#next').fill('Check food and water access tomorrow; another meal may be needed.');await page.locator('#outcome-form button[type=submit]').click();await page.waitForURL(new RegExp('#/case/'+id+'$'));
  c=(await data()).records.find(c=>c.id===id);assert.equal(c.care,'followup');assert.equal(c.tasks.find(t=>t.id===task.id).status,'completed');assert.equal(c.tasks.at(-1).owner,null);ok('Welfare check → confirmed assistance → open, unclaimed continuing-care task');
  await page.screenshot({path:path.join(out,'07-care-relay-mobile.png'),fullPage:true});
  await act('handoff').click();await act('confirm-handoff').click();assert.equal((await data()).records.find(c=>c.id===id).care,'continuing');ok('Explicit simulated Care Relay handoff');
  await nav('/chat/coordinator');const prior=(await data()).records.find(c=>c.id===id).care;await page.locator('[name=message]').fill('Please note tomorrow’s follow-up need.');await page.locator('#chat-form button').click();assert.equal(await page.locator('.bubble').count(),3);assert.equal((await data()).records.find(c=>c.id===id).care,prior);ok('Functional scripted chat preserves independent case state');
  await login('civilian');await nav('/case/'+id);assert((await page.locator('#main').innerText()).includes('Continuing-care responsibility confirmed'));ok('Civilian sees accepted task, outcome and continuing-care status');
  await nav('/settings');await page.locator('#network').selectOption('offline');await nav('/home');const offlineId=await intake(false);assert.equal((await data()).records[0].transport,'queued');assert((await page.locator('#main').innerText()).includes('Still not sent'));ok('Manual intake works offline with explicit unsent receipt');
  await nav('/relay/'+offlineId);await act('relay-share').click();await act('relay-share').click();assert.equal((await data()).relay.length,1);await act('relay-fail').click();assert.equal((await data()).records[0].transport,'queued');await act('relay-share').click();await act('relay-expire').click();assert.equal((await data()).relay.length,0);await act('relay-share').click();await act('relay-gateway').click();await act('relay-gateway').click();assert.equal((await data()).records.filter(c=>c.id===offlineId).length,1);assert.equal((await data()).records[0].transport,'ack');ok('Interactive relay: peer copy, deduplication, failure, expiry, receipt & cleanup');
  await nav('/settings');await page.locator('#network').selectOption('online');await login('volunteer');await nav('/case/'+offlineId);const checkTask=(await data()).records.find(c=>c.id===offlineId).tasks[0];await act('accept').click();await nav('/settings');await page.locator('#network').selectOption('offline');await nav(`/check/${offlineId}/${checkTask.id}`);await page.locator('#contact').selectOption('no-answer');await page.locator('#consent').selectOption('unknown');await page.locator('#note').fill('No response to a safe check; welfare unknown.');await page.locator('#check-form button[type=submit]').click();await page.waitForURL(new RegExp('#/case/'+offlineId+'$'));assert.equal((await data()).records.find(c=>c.id===offlineId).verification,'reported');assert.equal((await data()).pending.length,1);await act('conflict').click();await nav('/settings');await page.locator('#network').selectOption('online');await act('sync').click();c=(await data()).records.find(c=>c.id===offlineId);assert(c.conflict);assert(c.events.some(e=>e.kind==='conflict'));ok('Offline welfare log withheld from civilian; conflicting histories preserved');
  await nav('/case/ST-2041');await act('accept').click();c=(await data()).records.find(c=>c.id==='ST-2041');await nav(`/check/${c.id}/${c.tasks[0].id}`);await page.locator('#contact').selectOption('no-answer');await page.locator('#consent').selectOption('unknown');await page.locator('#note').fill('No answer at the door; unable to verify.');await page.locator('#check-form button[type=submit]').click();await page.waitForURL(/#\/case\/ST-2041$/);c=(await data()).records.find(c=>c.id==='ST-2041');assert.equal(c.verification,'unable');assert.equal(c.tasks[0].status,'escalated');ok('No-answer UI path records escalation, never safety or completion');
  for(const route of ['/team','/map','/guides','/notifications','/chats','/settings']){await nav(route);assert(!(await page.locator('#main').innerText()).includes('This case is not available'));}
  await nav('/guides');await page.locator('#guide-search').fill('offline');assert.equal(await page.locator('.guide-row').count(),1);await page.locator('.guide-row').click();await page.goBack();assert.match(page.url(),/#\/guides$/);ok('Supporting screens, guide search and browser Back');
  await nav('/settings');const soundBefore=(await data()).prefs.sound;await page.locator('.toggle[data-action=sound]').click();assert.notEqual((await data()).prefs.sound,soundBefore);await page.locator('.toggle[data-action=sound]').click();assert.equal((await data()).prefs.sound,soundBefore);ok('Sound toggle persists and mutes');
  for(const width of [320,390,430,1024,1440]){await page.setViewportSize({width,height:900});for(const route of ['/overview','/cases','/team','/map','/settings']){await nav(route);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${route}`)}}ok('No horizontal overflow at 320, 390, 430, 1024 and 1440 pixels');
  await page.setViewportSize({width:390,height:844});await nav('/overview');await act('toggle-lang').click();await page.screenshot({path:path.join(out,'08-volunteer-hindi.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await act('toggle-lang').click();ok('Hindi volunteer layout fits mobile');
  await login('volunteer','SAATH-V102');await nav('/case/ST-2042');assert(!(await act('accept').isDisabled()));await act('accept').click();ok('Separately authorized medical volunteer can accept medical referral');
  await nav('/settings');await act('reset').click();await act('close-dialog').click();assert((await data()).records.length>4);await act('reset').click();await act('confirm-reset').click();assert.equal((await data()).records.length,4);assert.equal((await data()).session,null);ok('Reset requires confirmation; cancellation preserves data');
  await nav('/roles');await page.locator('[data-action=role][data-role=civilian]').click();await act('unverified').click();await act('enter-unverified').click();assert.equal((await data()).session.verified,false);ok('Limited unverified civilian entrance');
  // A fresh isolated page tests denied storage without altering the completed flow.
  const deny=await browser.newContext();await deny.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage denied')}}));const dp=await deny.newPage();await dp.goto(base);assert(await dp.locator('.storage-warning').count());assert(await dp.locator('#language-input').count());await deny.close();ok('Unavailable storage renders explicit temporary-mode warning');
  const cleanErrors=errors.filter(e=>!e.includes('favicon.ico'));
  assert.deepEqual(cleanErrors,[],'Unexpected browser errors');ok('No unexpected browser runtime errors');
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({base,passed,errors,at:new Date().toISOString()},null,2));
  console.log(`\n${passed.length} browser scenarios passed.`);
})().catch(async e=>{console.error(e);if(page)await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({base,passed,errors,failure:String(e),at:new Date().toISOString()},null,2));process.exitCode=1}).finally(async()=>{await browser?.close()});
