const checks=[],metrics={};function passed(s){checks.push(s);console.log('PASS',s)}
// Actual image detector, no seeded coordinates passed into the easy workflow.
await $('demo').click();assert(state.result&&!state.result.error,state.result?.error);assert.equal(state.easyPhase,'done');assert.equal(state.rows.length,480);assert(eligible().hz);assert(eligible().axis);assert.equal($('reviewed').checked,false);assert(!$('hzValue').innerHTML.includes('—'));assert($('resultMessage').textContent.includes('5.00Hz'));assert(Math.abs(state.result.hz-5)<.05);assert(Math.abs(state.result.axis-60)<3);assert.equal(state.anchors.length,1);assert.equal(state.rows[0].trackingMethod,'auto-seed');
metrics.demo={hz:state.result.hz,axis:state.result.axis,frames:state.rows.length};passed('Demo button detects ball and range, analyzes automatically, and shows numbers without review checkbox');
// File selection uses the real MP4 metadata parser. Video decoding is substituted with synthetic pixels.
const originalRead=readFrame,originalSource=sourceImage,originalSynthetic=renderSynthetic;
readFrame=async i=>{renderSynthetic(i);return{verified:true,time:state.times[i],mediaTime:state.times[i]}};sourceImage=()=>demoCanvas;
const input=new Blob([fs.readFileSync(outputPath.replace('easy-results.json','synthetic-240fps.mp4'))]);input.name='user-test.mp4';await $('file').onchange({target:{files:[input]}});
assert(state.result&&!state.result.error,state.result?.error);assert.equal(state.result.synthetic,false);assert.equal(state.rows.length,360);assert(previewResult().hz);assert(!eligible().hz);assert.equal($('timingConfirmed').checked,false);assert.equal($('reviewed').checked,false);assert($('resultState').textContent.includes('参考値'));assert(!$('hzValue').innerHTML.includes('—'));assert($('referenceNote').textContent.includes('再生時間'));assert(!$('resultMessage').textContent.includes('得られません'));
let downloaded=null;download=(blob,name)=>downloaded={blob,name};exportCSV();const csv=await downloaded.blob.text();assert(csv.includes('"rotation_hz",""'));assert(csv.includes('"provisional_rotation_hz","5.'));assert(csv.includes('playback_time_unconfirmed'));
await $('timeNormal').click();assert(!eligible().hz);await $('confirmResult').click();assert(eligible().hz);assert($('resultState').textContent.includes('確認済み'));
const adopted=state.result.hz;exportCSV();assert((await downloaded.blob.text()).includes('"rotation_hz","'+adopted+'"'));
state.confirmedFrames=0;renderResult();assert(!previewResult().hz);assert($('hzValue').innerHTML.includes('—'));state.confirmedFrames=state.rows.length;
state.result.hzReasons.push('test insufficient evidence');renderResult();assert(!previewResult().hz);assert($('hzValue').innerHTML.includes('—'));state.result.hzReasons.pop();renderResult();
await $('timeSlow').click();assert.equal($('timingConfirmed').checked,false);assert(!eligible().hz);assert(previewResult().hz);assert($('hzHeading').textContent.includes('再生時間'));assert($('advancedSettings').open);
metrics.file={hz:state.result.hz,axis:state.result.axis,frames:state.rows.length};passed('Selecting a video starts analysis; provisional and adopted results/CSV are separate, and poor evidence is still withheld');
// True second circle rendered into a different location: require the user to disambiguate.
readFrame=originalRead;sourceImage=originalSource;await demo();renderSynthetic(0);const extra=document.createElement('canvas');extra.width=150;extra.height=150;extra.getContext('2d').drawImage(demoCanvas,175,109,150,150,0,0,150,150);
renderSynthetic=i=>{originalSynthetic(i);dc.drawImage(extra,440,40,150,150)};await startEasy();assert.equal(state.easyPhase,'tap');assert.equal(state.rows.length,0);assert($('easyTitle').textContent.includes('タップ'));assert.equal(state.busy,false);
renderSynthetic=originalSynthetic;await showFrame(0);state.roi={x:250,y:184,r:30};await easyTap();assert(state.result&&!state.result.error);assert.equal(state.easyPhase,'done');assert(state.rows.length>=48);
passed('Multiple circles require a tap; a tap alone estimates radius and starts analysis');
// A flat image cannot be claimed to contain a ball. Scan is bounded.
await demo();let flatReads=0;readFrame=async i=>{flatReads++;dc.fillStyle='#666666';dc.fillRect(0,0,640,360);return{verified:true,time:state.times[i],mediaTime:state.times[i]}};await startEasy();assert.equal(state.easyPhase,'tap');assert.equal(state.result,null);assert.equal(state.rows.length,0);assert(flatReads<=31);assert(!$('navFields').disabled);assert($('easyMessage').textContent.includes('スライダー'));
state.roi={x:250,y:184,r:70};await easyTap();assert.equal(state.easyPhase,'circle');assert.equal($('easySizeField').hidden,false);assert.equal($('easyUse').hidden,false);
passed('No ball falls back to tap and size slider after a bounded scan');
// Stop remains available while scanning and does not launch estimation afterwards.
await demo();readFrame=async i=>{const r=await originalRead(i);state.cancel=true;return r};await startEasy();assert.equal(state.result,null);assert.equal(state.busy,false);assert($('easyMessage').textContent.includes('止めました'));
readFrame=originalRead;passed('Cancel stops automatic setup and leaves controls usable');
await demo();let failed=false;readFrame=async i=>{if(i>0){failed=true;throw Error('test range decode failure')}return originalRead(i)};await startEasy();assert(failed);assert.equal(state.easyPhase,'tap');assert.equal(state.frame,0);assert(state.frameReady);assert.equal(state.busy,false);assert.equal(state.result,null);readFrame=originalRead;passed('Range decode failure restores the correct editable preview frame');
assert(pristineHTML.includes('探Qモード v1.3'));assert(pristineHTML.includes('id="advancedSettings"'));assert(pristineHTML.includes('id="positionDetails"'));assert(pristineHTML.includes('id="diagnosticDetails"'));assert(!/<details[^>]*id="(?:advancedSettings|positionDetails|diagnosticDetails)"[^>]*\bopen\b/.test(pristineHTML));
fs.writeFileSync(outputPath,JSON.stringify({version:'1.3',environment:'Node.js + native Canvas + mock DOM. File selection uses real MP4 metadata with synthetic decoded pixels. Not a browser/Safari test.',checks,metrics},null,2));
