/* SAATH local demo domain. No network, identity or authority integration. */
(function (root) {
  'use strict';
  const VERSION = 1;
  const KEY = 'saath.prototype.v1';
  const now = () => new Date().toISOString();
  const id = prefix => prefix + '-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 9));
  const copy = value => JSON.parse(JSON.stringify(value));
  const roster = [
    { id: 'SAATH-V101', name: 'Rohan Mehta', initials: 'RM', zone: 'A', badges: ['general', 'military'], permissions: ['welfare', 'essentials'], note: 'Welfare checks & essentials', color: 'blue' },
    { id: 'SAATH-V102', name: 'Dr. Asha Rao', initials: 'AR', zone: 'A', badges: ['general', 'medical'], permissions: ['welfare', 'essentials', 'medical'], note: 'Authorized medical referrals', color: 'green' },
    { id: 'SAATH-V103', name: 'Farah Khan', initials: 'FK', zone: 'B', badges: ['general', 'psychologist'], permissions: ['welfare', 'essentials'], note: 'Zone B · welfare support', color: 'amber' },
    { id: 'SAATH-V104', name: 'Neel Iyer', initials: 'NI', zone: 'A', badges: ['general', 'legal'], permissions: ['welfare'], note: 'Welfare checks · legal referral', color: 'teal' }
  ];
  function event(c, kind, actor, detail = '') {
    c.events.push({ id: id('EV'), at: now(), kind, actor, detail });
    c.revision++;
  }
  function task(type, approved = true) { return { id: id('TASK'), type, status: 'available', approved, owner: null }; }
  function seed() {
    const make = (n, fields) => ({ id: 'ST-' + n, createdAt: now(), reporter: 'seed', verifiedReporter: true, relation: 'neighbor', evidence: 'observed', criteria: ['essentials'], needs: ['food', 'water'], name: '', age: '', gender: '', landmark: '', zone: 'A', notes: '', danger: 'no', subjectConsent: 'unknown', context: '', transport: 'ack', verification: 'reported', care: 'open', priority: 'routine', tasks: [task('welfare'), task('essentials')], events: [], revision: 0, followUp: null, readers: [], ackBy: [], ...fields });
    return { version: VERSION, prefs: { lang: 'en', sound: false, network: 'online' }, session: null, drafts: {}, pending: [], relay: [], chats: {}, notices: [], records: [
      make('2041', { name: 'Ananya Devi', landmark: 'House 18, Neem Lane, behind the community library', notes: 'Usual caregiver is unavailable. Requests drinking water and a meal. Can answer the door.', criteria: ['daily', 'essentials'], needs: ['food', 'water'], followUp: { required: true, owner: 'Ward response team', status: 'unassigned', due: new Date(Date.now()+86400000).toISOString(), note: 'Check daily food and water access.' } }),
      make('2042', { name: 'Imran Ali', landmark: 'Flat 4, Gulmohar Court', criteria: ['medical'], needs: ['medication'], priority: 'high', notes: 'Requests support accessing an existing prescription. No treatment or dosing advice recorded.', tasks: [task('medical', true)] }),
      make('2043', { name: '', landmark: 'East gate of Shanti School', criteria: ['child'], needs: ['safeguarding'], priority: 'critical', context: 'Responsible adult unavailable; current safety not confirmed.', notes: 'Protected referral. Exact details require an authorized child-protection responder.', tasks: [task('safeguarding', false)], care: 'review' }),
      make('2044', { zone: 'B', name: 'Suresh Nair', landmark: '12 Lake Road', criteria: ['unreachable'], needs: ['welfare'], notes: 'Neighbor could not make contact this morning.', tasks: [task('welfare')], priority: 'high' })
    ] };
  }
  function load(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return { db: seed(), warning: '' };
      const db = JSON.parse(raw);
      if (db.version !== VERSION || !Array.isArray(db.records) || !Array.isArray(db.pending) || !Array.isArray(db.relay) || !db.drafts || !db.prefs || !db.chats || !Array.isArray(db.notices) || db.records.some(c => !c.id || !Array.isArray(c.tasks) || !Array.isArray(c.events) || !Array.isArray(c.criteria) || !Array.isArray(c.needs) || !Array.isArray(c.readers) || !Array.isArray(c.ackBy))) throw Error('Invalid stored state');
      return { db, warning: '' };
    } catch (_) { return { db: seed(), warning: 'storage' }; }
  }
  function save(db, storage) { storage.setItem(KEY, JSON.stringify(db)); }
  function volunteer(db) { return roster.find(v => db.session?.role === 'volunteer' && v.id === db.session.account); }
  function online(db) { return db.prefs.network === 'online'; }
  function visible(db) {
    const v = volunteer(db);
    if (v) return db.records.filter(c => c.transport === 'ack' && c.zone === v.zone);
    if (db.session?.role === 'civilian') return db.records.filter(c => c.reporter === db.session.account);
    return [];
  }
  function record(db, caseId) {
    const c = visible(db).find(c => c.id === caseId);
    if (!c) throw Error('access');
    return c;
  }
  function sensitive(db, c) { const v = volunteer(db); return db.session?.role === 'civilian' ? c.reporter === db.session.account : !!v && c.zone === v.zone && c.readers.includes(v.id); }
  function notice(db, c, kind) { db.notices.unshift({ id: id('N'), caseId: c.id, account: c.reporter, zone: c.zone, kind, at: now(), readBy: [] }); }
  function validate(d) {
    const errors = [];
    if (!['yes','no','unsure'].includes(d.danger)) errors.push('danger');
    if (!Array.isArray(d.criteria) || !d.criteria.length || d.criteria.some(x=>!['daily','child','medical','essentials','unreachable','other'].includes(x))) errors.push('criteria');
    if (!Array.isArray(d.needs) || !d.needs.length || d.needs.some(x=>!['food','water','supplies','daily','medication','welfare','safeguarding','other'].includes(x))) errors.push('needs');
    if (!d.landmark?.trim()) errors.push('landmark');
    if (!['A','B'].includes(d.zone)) errors.push('zone');
    if (!['family','friend','neighbor','caregiver','professional','volunteer','bystander','other'].includes(d.relation)) errors.push('relation');
    if (!['spoke','observed','third-party','unreachable','unknown'].includes(d.evidence)) errors.push('evidence');
    if (!['yes','no','unable','unknown'].includes(d.subjectConsent)) errors.push('subjectConsent');
    if ((d.criteria?.some(x => ['child','medical','unreachable'].includes(x)) || d.danger !== 'no') && !d.context?.trim()) errors.push('context');
    if (d.age && (!/^\d{1,3}$/.test(d.age) || +d.age > 120)) errors.push('age');
    return errors;
  }
  function submit(db, d) {
    if (db.session?.role !== 'civilian') throw Error('access');
    if (validate(d).length || d.confirm !== true) throw Error('invalid');
    const existing = db.records.find(c => c.id === d.id);
    if (existing) { if(existing.reporter!==db.session.account)throw Error('access'); return existing; }
    const protectedCase = d.criteria.includes('child') || d.danger !== 'no';
    const c = { ...copy(d), id: d.id || id('ST').slice(0, 14).toUpperCase(), createdAt: now(), reporter: db.session.account, verifiedReporter: !!db.session.verified, transport: online(db) ? 'ack' : db.prefs.network === 'fail' ? 'failed' : 'queued', verification: 'reported', care: protectedCase || !db.session.verified ? 'review' : 'open', priority: protectedCase ? 'critical' : d.criteria.includes('medical') ? 'high' : 'routine', tasks: [], events: [], revision: 0, readers: [], ackBy: [], followUp: null };
    const authorized = !protectedCase && c.verifiedReporter;
    c.tasks.push(task(protectedCase ? 'safeguarding' : 'welfare', authorized));
    if(d.needs.some(n => ['food','water','supplies'].includes(n))) c.tasks.push(task('essentials', authorized));
    if(d.criteria.includes('medical')) c.tasks.push(task('medical', false));
    delete c.confirm;
    event(c, c.transport === 'ack' ? 'received' : 'unsent', 'Civilian');
    db.records.unshift(c); delete db.drafts[db.session.account]; notice(db, c, c.transport === 'ack' ? 'received' : 'unsent');
    return c;
  }
  function acknowledge(db, caseId) {
    const c = record(db, caseId), v = volunteer(db);
    if(!v || !online(db)) throw Error('offline');
    if(!c.ackBy.includes(v.id)) { c.ackBy.push(v.id); event(c, 'acknowledged', v.id); }
  }
  function eligibility(db, c, t) {
    const v = volunteer(db);
    if (!v || c.zone !== v.zone || c.transport !== 'ack') return 'access';
    if (!online(db)) return 'offline';
    if (c.conflict) return 'conflict';
    if (t.status !== 'available') return 'claimed';
    if (!t.approved) return 'approval';
    if (!v.permissions.includes(t.type)) return 'qualification';
    return '';
  }
  function accept(db, caseId, taskId) {
    const c = record(db, caseId), t = c.tasks.find(t => t.id === taskId);
    if (!t) throw Error('access');
    const reason = eligibility(db, c, t); if(reason) throw Error(reason);
    const v = volunteer(db); t.owner = v.id; t.status = 'accepted'; c.care = 'receiving';
    if(!c.readers.includes(v.id)) c.readers.push(v.id);
    event(c, 'accepted', v.id, t.type); notice(db,c,'accepted');
  }
  function applyField(db,c,action,actor,payload) {
    const t = c.tasks.find(t => t.id === payload.taskId);
    if(action === 'check') {
      if(!t || t.owner !== actor || !['accepted','in-progress'].includes(t.status)) throw Error('access');
      if(!['reached','no-answer','unsafe','declined'].includes(payload.contact) || !['yes','no','unknown'].includes(payload.consent) || !payload.note?.trim()) throw Error('invalid');
      t.contact = payload.contact; t.consent = payload.consent; t.status = 'in-progress';
      c.verification = payload.contact === 'reached' ? 'verified-limited' : 'unable';
      if(payload.contact !== 'reached' || payload.consent !== 'yes') { t.status='escalated'; c.care='review'; event(c,'escalated',actor,payload.contact); }
      event(c,'check',actor,copy(payload)); notice(db,c,'check');
    } else if(action === 'outcome') {
      if(!t || t.owner !== actor || t.status !== 'in-progress' || t.contact !== 'reached' || t.consent !== 'yes') throw Error('access');
      if(!payload.note?.trim() || !['confirmed','unconfirmed','partial','not-fulfilled'].includes(payload.confirmation)) throw Error('invalid');
      if (payload.recurring && (!payload.due || !Number.isFinite(Date.parse(payload.due)) || Date.parse(payload.due)<=Date.now() || !payload.next?.trim())) throw Error('followup');
      t.status = payload.confirmation === 'confirmed' ? 'completed' : 'unable'; t.outcome=copy(payload);
      const unresolved = c.tasks.some(x => !['completed'].includes(x.status));
      c.care = payload.recurring || unresolved || payload.confirmation !== 'confirmed' ? 'followup' : 'review';
      if(payload.recurring) {
        c.followUp = { required: true, owner: 'Ward response team', status:'unassigned', due:payload.due, note:payload.next };
        const next=task(t.type,t.approved); next.followup=true; next.due=payload.due; c.tasks.push(next);
      }
      event(c,'outcome',actor,copy(payload)); notice(db,c,'outcome');
    } else if(action === 'escalate') {
      if(!payload.note?.trim()) throw Error('invalid');
      c.care='review'; event(c,'escalated',actor,payload.note); notice(db,c,'escalated');
    } else throw Error('invalid');
  }
  function field(db,caseId,action,payload) {
    const c=record(db,caseId), v=volunteer(db); if(!v) throw Error('access');
    if(action !== 'escalate' && !sensitive(db,c)) throw Error('access');
    // Validate the full transition before storing a queued event.
    const trial=copy(db); applyField(trial,trial.records.find(x=>x.id===caseId),action,v.id,payload);
    if(!online(db)) {
      if(db.pending.some(p=>p.caseId===caseId && p.actor===v.id)) throw Error('pending');
      db.pending.push({id:id('LOCAL'),caseId,action,payload:copy(payload),actor:v.id,baseRevision:c.revision,at:now()}); return 'queued';
    }
    applyField(db,c,action,v.id,payload); return 'applied';
  }
  function retry(db,caseId) {
    const c=record(db,caseId); if(db.session.role!=='civilian' || c.transport==='ack') return false;
    if(!online(db)) { if(db.prefs.network==='fail') c.transport='failed'; return false; }
    ackTransport(db,c); return true;
  }
  function ackTransport(db,c) {
    if(c.transport==='ack') return;
    c.transport='ack'; event(c,'received','Demo receiver'); notice(db,c,'received'); db.relay=db.relay.filter(p=>p.caseId!==c.id);
  }
  function sync(db) {
    if(!online(db)) throw Error('offline');
    const account=db.session?.account;
    if(db.session?.role==='civilian') db.records.filter(c=>c.reporter===account&&c.transport!=='ack').forEach(c=>ackTransport(db,c));
    const pending=db.pending.filter(p=>p.actor===account);
    for(const p of pending) {
      const c=db.records.find(c=>c.id===p.caseId);
      if(!c) continue;
      if(c.revision!==p.baseRevision) { c.conflict=true; c.care='review'; event(c,'conflict',p.actor,p); notice(db,c,'conflict'); }
      else applyField(db,c,p.action,p.actor,p.payload);
    }
    db.pending=db.pending.filter(p=>p.actor!==account);
  }
  function relay(db,caseId,action) {
    const c=record(db,caseId); if(db.session.role!=='civilian') throw Error('access');
    if(c.transport==='ack') return 'duplicate';
    if(action==='share') {
      if(!db.relay.some(p=>p.caseId===c.id)) db.relay.push({caseId:c.id,peer:'Neighbour device 02',expires:Date.now()+3600000});
      c.transport='peer'; event(c,'peer','Relay simulation');
    } else if(action==='gateway') {
      if(!db.relay.some(p=>p.caseId===c.id)) throw Error('no-peer');
      ackTransport(db,c);
    } else if(action==='expire' || action==='fail') { db.relay=db.relay.filter(p=>p.caseId!==c.id); c.transport='queued'; event(c,action==='expire'?'expired':'relay-failed','Relay simulation'); }
  }
  function expire(db) { const expired=db.relay.filter(p=>p.expires<=Date.now()); db.relay=db.relay.filter(p=>p.expires>Date.now()); for(const p of expired){const c=db.records.find(c=>c.id===p.caseId);if(c&&c.transport==='peer'){c.transport='queued';event(c,'expired','Relay simulation');}} }
  function conflict(db,caseId) {
    const c=record(db,caseId); if(!volunteer(db) || !db.pending.some(p=>p.caseId===caseId&&p.actor===db.session.account)) throw Error('pending-required');
    event(c,'remote-update','Demo coordinator','A separate response update was recorded. Local history is retained.');
  }
  function handoff(db,caseId) {
    const c=record(db,caseId); if(!volunteer(db)||!sensitive(db,c)||!c.followUp||!online(db)||c.conflict) throw Error('access');
    c.followUp.status='responsibility-confirmed'; c.care='continuing'; event(c,'handoff','Demo coordinator','Response team accepted continuing-care responsibility; tasks remain open.');notice(db,c,'handoff');
  }
  function extract(text) {
    const out={notes:text,criteria:[],needs:[]};
    if(/food|meal|खाना|भोजन/i.test(text)){out.needs.push('food');out.criteria.push('essentials');}
    if(/water|पानी/i.test(text)){out.needs.push('water');out.criteria.push('essentials');}
    if(/medicine|medication|prescription|दवा/i.test(text)){out.criteria.push('medical');out.needs.push('medication');}
    if(/daily care|caregiver|देखभाल/i.test(text))out.criteria.push('daily');
    if(/child|infant|बच्च/i.test(text)){out.criteria.push('child');out.needs.push('safeguarding');}
    if(/unreachable|no answer|संपर्क नहीं/i.test(text)){out.criteria.push('unreachable');out.needs.push('welfare');}
    if(/neighbou?r|पड़ोसी/i.test(text))out.relation='neighbor';
    const location=text.match(/(?:location|landmark|स्थान)\s*:\s*([^\n.;]+)/i); if(location)out.landmark=location[1].trim();
    out.criteria=[...new Set(out.criteria)];out.needs=[...new Set(out.needs)]; return out;
  }
  const api={VERSION,KEY,now,id,copy,roster,seed,load,save,volunteer,online,visible,record,sensitive,validate,submit,acknowledge,eligibility,accept,field,retry,sync,relay,expire,conflict,handoff,extract};
  root.Saath=api; if(typeof module!=='undefined')module.exports=api;
})(globalThis);
