// Loaded into the controller scope by test-recovery.cjs. No browser is simulated beyond DOM events.
const checks=[],metrics={};function passed(label){checks.push(label);console.log('PASS',label)}
const originalTrack=trackFrame,originalWork=work,originalRead=readFrame;
let calls=0,resets=0;work=async(type,payload,transfer)=>{if(type==='frame')calls++;if(type==='reset')resets++;return originalWork(type,payload,transfer)};
const countedWork=work;
function tapROI(p){$('diameter').value=String(2*p.r);canvas.dispatch('pointerdown',{clientX:p.x,clientY:p.y,pointerId:1});canvas.dispatch('pointerup',{});assert(state.draft)}
function truth(i){return{x:250+i*.13,y:184-i*.024,r:73-i*.025}}
function candidateButton(id,label){return $('anchors').children.find(row=>row.children[0].textContent.includes('候補 #'+id+' ·')).children.find(e=>e.textContent===label)}
await demo();$('end').value='143';
trackFrame=(p,a)=>{const tr=originalTrack(p,a);if(state.frame===60){tr.edgeScore=0;tr.edgeCoverage=0}return tr};
await $('analyze').click();
assert.equal(state.failure.kind,'boundary');assert.equal(state.frame,60);assert.equal(state.run.next,60);assert.equal(state.rows.length,60);assert.equal(state.frameReady,true);assert.equal($('navFields').disabled,false);assert.equal($('saveResume').disabled,false);assert.equal($('resume').disabled,true);assert($('recoveryTitle').textContent.includes('60'));assert($('frameLabel').textContent.includes('60'));
const prefix=state.rows.slice(),before=calls;
await $('analyze').click();assert.equal(calls,before);assert($('status').textContent.includes('同じ条件'));
passed('Boundary failure opens exact frame, unlocks editing, preserves prefix and blocks unchanged retry');
tapROI({...truth(60),x:80});await $('addAnchor').click();const wrong=activeAnchor(60).id;
tapROI(truth(60));await $('addAnchor').click();const right=activeAnchor(60).id;
assert.equal(state.anchors.filter(a=>a.frame===60).length,2);assert.equal(state.anchors.filter(a=>a.frame===60&&a.active).length,1);
await candidateButton(wrong,'使用する').click();assert.equal(activeAnchor(60).id,wrong);
await candidateButton(right,'使用する').click();assert.equal(activeAnchor(60).id,right);assert.equal($('resume').disabled,false);
await $('resume').click();
assert(!state.result.error,state.result.error);assert.equal(resets,1);assert.equal(state.rows.length,144);assert.equal(state.result.total,143);assert.equal(new Set(state.rows.map(r=>r.frame)).size,144);prefix.forEach((r,i)=>assert.strictEqual(state.rows[i],r));assert.equal(state.rows[60].trackingMethod,'manual');assert.equal(state.rows[60].candidateId,right);assert.equal(state.rows[60].x,truth(60).x);assert.equal(state.rows[60].edgeScore,null);
assert(!eligible().hz);$('reviewed').checked=true;renderResult();assert(eligible().hz);assert(Math.abs(state.result.hz-5)<.05);assert(Math.abs(state.result.axis-60)<3);
metrics.recovered={hz:state.result.hz,axis:state.result.axis,frames:state.rows.length};
passed('Same-frame candidates persist, use buttons select one, resume uses its exact circle without boundary rejection or duplicate frames');
trackFrame=originalTrack;
// Quality rejection exercises the real engine with a textureless image, then retries with real synthetic pixels.
await demo();$('end').value='143';let blank=true;
work=async(type,payload,transfer)=>{if(type==='frame'&&state.frame===37&&blank){payload.rgba.fill(180);for(let j=3;j<payload.rgba.length;j+=4)payload.rgba[j]=255}return countedWork(type,payload,transfer)};
await analyze();assert.equal(state.failure.kind,'texture');assert.equal(state.frame,37);assert.equal(state.rows.length,37);const texturePrefix=state.rows.slice();
// Saving an auto prediction as manual allows one meaningful retry; repeating the identical manual circle then blocks.
await $('saveResume').click();assert.equal(state.failure.kind,'texture');assert.equal(state.failure.manual,true);assert($('recoveryNext').textContent.includes('手動指定した円でも'));const afterManualFailure=calls;await $('saveResume').click();assert.equal(calls,afterManualFailure);assert.equal(state.rows.length,37);
blank=false;tapROI(truth(37));await $('saveResume').click();assert(!state.result.error,state.result.error);assert.equal(state.rows.length,144);assert.equal(state.result.total,143);texturePrefix.forEach((r,i)=>assert.strictEqual(state.rows[i],r));assert(Math.abs(state.rows[37].pair.dt-1/240)<1e-12);assert(Math.abs(state.rows[38].pair.dt-1/240)<1e-12);
passed('Rejected texture never mutates engine history; manual failure gives specific advice; identical saved candidate is not retried; corrected position resumes');
work=countedWork;
// Editing accepted history invalidates the checkpoint; choosing an inactive candidate does not destroy others.
await demo();$('end').value='95';trackFrame=(p,a)=>{const tr=originalTrack(p,a);if(state.frame===20){tr.edgeScore=0;tr.edgeCoverage=0}return tr};await analyze();
await navigate(0);tapROI(truth(0));await $('addAnchor').click();assert.equal(state.run,null);assert.equal(state.failure,null);assert.equal(state.rows.length,0);assert.equal(state.anchors.filter(a=>a.frame===0).length,2);
passed('Editing a previously accepted frame invalidates the checkpoint for a clean restart');
trackFrame=originalTrack;
// Interpolation requires a saved position at the final sampled frame.
await demo();$('end').value='144';$('stride').value='2';$('trackingMode').value='interpolate';$('trackingMode').onchange();state.anchors=state.anchors.filter(a=>a.frame===0);const noRunCalls=calls;
await analyze();assert.equal(calls,noRunCalls);assert.equal(state.frame,144);assert($('status').textContent.includes('144'));
tapROI(truth(144));await $('addAnchor').click();trackFrame=()=>{throw Error('Interpolation must not call contour search')};
await analyze();assert(!state.result.error,state.result.error);assert.equal(state.rows.length,73);assert(state.rows.every(r=>r.trackingMethod==='manual'||r.trackingMethod==='interpolated'));assert.equal(state.rows[30].frame,60);assert(Math.abs(state.rows[30].x-truth(60).x)<1e-6);assert.equal(state.result.settings.trackingMode,'interpolate');
passed('Interpolation requires bounding anchors, follows their coordinates and does not call automatic contour search');
// Small-ball and off-screen errors remain mandatory even with manual positions.
await demo();$('stride').value='1';$('end').value='95';state.roi={x:250,y:184,r:15};saveAnchor();await analyze();assert.equal(state.failure.kind,'small');assert($('recoveryNext').textContent.includes('不自然に広げても'));assert.equal(state.rows.length,0);assert.equal($('trimEnd').disabled,true);
state.roi={x:20,y:184,r:73};saveAnchor();await analyze();assert.equal(state.failure.kind,'outside');assert.equal(state.rows.length,0);assert.equal(state.anchors.filter(a=>a.frame===0).length,3);
const deleted=activeAnchor(0).id;await candidateButton(deleted,'削除').click();assert(!state.anchors.some(a=>a.id===deleted));assert.equal(state.anchors.filter(a=>a.frame===0&&a.active).length,1);
passed('Manual positions retain small-ball and out-of-frame quality gates; candidate deletion is individual with fallback');
// Shortening cannot silently produce too short a result.
await demo();$('end').value='95';trackFrame=(p,a)=>{const tr=originalTrack(p,a);if(state.frame===20){tr.edgeScore=0;tr.edgeCoverage=0}return tr};await analyze();await $('trimEnd').click();assert.equal(Number($('end').value),19);assert($('status').textContent.includes('最低48枚'));assert.equal(state.run,null);
passed('Trim ends at the last accepted frame and gives actionable guidance when fewer than 48 frames remain');
// A decoding failure never allows the stale preview to be saved as the failed frame.
await demo();$('end').value='95';trackFrame=originalTrack;readFrame=async i=>{if(i===20)throw Error('test decode failure');return originalRead(i)};await analyze();assert.equal(state.failure.kind,'decode');assert.equal(state.failure.frame,20);assert.equal(state.frameReady,false);assert.equal($('saveResume').disabled,true);const anchorsBefore=state.anchors.length;assert.equal(saveAnchor(),false);assert.equal(state.anchors.length,anchorsBefore);
readFrame=originalRead;await navigate(20);assert.equal(state.frameReady,true);await $('resume').click();assert(!state.result.error,state.result.error);assert.equal(state.rows.length,96);assert.equal(state.result.total,95);
passed('Decode failures do not allow saving a stale preview and can resume after decoding recovers');
// Cancel pauses between frames without losing accepted data.
await demo();$('end').value='95';work=async(type,payload,transfer)=>{const value=await countedWork(type,payload,transfer);if(type==='frame'&&state.frame===20)state.cancel=true;return value};await analyze();assert.equal(state.failure.kind,'paused');assert.equal(state.run.next,21);const pausedRows=state.rows.slice();work=countedWork;await $('resume').click();assert(!state.result.error);assert.equal(state.rows.length,96);pausedRows.forEach((r,i)=>assert.strictEqual(state.rows[i],r));
passed('Cancel/resume retains accepted frames and retries the next unprocessed frame');
// Public results are still gated by timing and review confirmation.
$('reviewed').checked=true;state.meta.verified=false;assert(!eligible().hz);state.meta.verified=true;state.confirmedFrames=0;assert(!eligible().hz);state.confirmedFrames=state.rows.length;$('timingConfirmed').checked=false;assert(!eligible().hz);
assert(pristineHTML.includes("connect-src 'none'"));assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon\s*\(/.test(pristineHTML));assert(pristineHTML.includes('研究・実験用 v1.1'));
passed('Timing, review and no-network constraints remain');
fs.writeFileSync(outputPath,JSON.stringify({version:'1.1',environment:'Node.js + native Canvas + mock DOM; not a browser or Safari',checks,metrics,realVideoTest:false,iPadTest:false},null,2));
