const checks=[],metrics={};function passed(s){checks.push(s);console.log('PASS',s)}
const originalTrack=trackFrame,originalRead=readFrame;let decoded=0,reads=[];
readFrame=async i=>{decoded=i;reads.push(i);return originalRead(i)};
await demo();$('end').value='143';
trackFrame=(p,a)=>{const q=originalTrack(p,a);if(decoded>=60&&decoded<=62){q.edgeScore=0;q.edgeCoverage=0}return q};
await analyze();assert(!state.result.error,state.result.error);assert.equal(state.rows.length,144);assert.equal(state.result.total,143);assert.equal(state.anchors.length,2);assert.equal(state.rows[60].trackingMethod,'auto-bridge');assert.equal(state.rows[61].trackingMethod,'auto-bridge');assert.equal(state.rows[62].trackingMethod,'auto-bridge');assert.equal(state.rows[60].recoveryTo,63);assert.equal(new Set(state.rows.map(p=>p.frame)).size,144);assert(reads.some((n,i)=>n===63&&reads.slice(i+1).includes(60)));$('reviewed').checked=true;assert(eligible().hz);assert(Math.abs(state.result.hz-5)<.05);assert(Math.abs(state.result.axis-60)<3);
metrics.bridge={hz:state.result.hz,axis:state.result.axis,recovered:state.rows.filter(p=>p.trackingMethod==='auto-bridge').map(p=>p.frame)};
passed('Three contour failures recover automatically using future frames, without new manual anchors or duplicate frames');
// Nearby shifted seed can recover without look-ahead. Only the ordinary seed is made to fail.
await demo();$('end').value='95';let failedOnce=false;trackFrame=(p,a)=>{const q=originalTrack(p,a);if(decoded===30&&!failedOnce){failedOnce=true;q.edgeScore=0;q.edgeCoverage=0}return q};await analyze();assert(!state.result.error,state.result.error);assert.equal(state.rows[30].trackingMethod,'auto-reacquired');assert.equal(state.anchors.length,2);
passed('Near-position contour re-search validates surface motion and resumes automatically');
// No arbitrary continuation through long untrackable spans.
await demo();$('end').value='95';trackFrame=(p,a)=>{const q=originalTrack(p,a);if(decoded>=30&&decoded<=50){q.edgeScore=0;q.edgeCoverage=0}return q};await analyze();assert.equal(state.failure.kind,'boundary');assert.equal(state.frame,30);assert.equal(decoded,30);assert.equal(state.rows.length,30);assert(state.failure.autoTried);assert($('recoveryDetail').textContent.includes('近傍再探索'));assert(!$('saveResume').disabled);
passed('Long tracking loss stops at the original frame with manual recovery available');
// A plausible interpolated circle over missing texture must not be accepted.
await demo();$('end').value='95';trackFrame=(p,a)=>{const q=originalTrack(p,a);if(decoded===30){q.edgeScore=0;q.edgeCoverage=0}return q};readFrame=async i=>{const result=await originalRead(i);decoded=i;if(i===30){dc.fillStyle='#777777';dc.fillRect(0,0,640,360)}return result};await analyze();assert.equal(state.rows.length,30);assert(state.result.error);assert.equal(state.frame,30);
passed('Automatic interpolation rejects invisible or textureless balls instead of inventing motion');
// VFR controller time mapping, predictions, and visibility gating.
readFrame=originalRead;trackFrame=originalTrack;await demo();$('end').value='143';state.meta.vfr=true;state.times=state.times.map((t,i)=>t+Math.sin(i*.45)*.0008);state.durations=state.times.map((t,i)=>i+1<state.times.length?state.times[i+1]-t:1/240);
const originalSynthetic=renderSynthetic;renderSynthetic=i=>originalSynthetic(state.times[i]*240);state.anchors=state.anchors.slice(0,1);await analyze();assert(!state.result.error,state.result.error);assert(state.result.irregular);$('reviewed').checked=true;assert(eligible().hz,JSON.stringify(state.result.hzReasons));assert(Math.abs(state.result.hz-5)<.1);
$('timeMode').value='capture';assert(!eligible().hz);const runBefore=state.run;await analyze();assert.equal(state.run,runBefore);assert($('status').textContent.includes('可変FPS'));$('timeMode').value='normal';
metrics.vfr={hz:state.result.hz,axis:state.result.axis};passed('VFR time-aware prediction and result gating work; inferred slow-motion multiplier is blocked');
// Larger time gaps are not filled by pixel synthesis.
const e=createEngine();e.handle({type:'frame',payload:{rgba:new Uint8ClampedArray(96*96*4),n:96,time:1}});assert.throws(()=>e.handle({type:'frame',payload:{rgba:new Uint8ClampedArray(96*96*4),n:96,time:1}}),/重複/);
assert(nextAction('有効な球面回転推定が不足しています。',{valid:4,total:80}).includes('間隔を1'));assert(nextAction('回転周期を2周期以上観測できていません。',{speed:5}).includes('0.40'));
passed('Non-increasing timestamps are rejected and result failures provide concrete next actions');
fs.writeFileSync(outputPath,JSON.stringify({version:'1.2',environment:'Node.js, native Canvas, mock DOM; not browser or iPad',checks,metrics},null,2));
