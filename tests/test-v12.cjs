const fs=require('fs'),path=require('path'),assert=require('assert');
const tests=fs.readFileSync(path.join(__dirname,'test-engine.cjs'),'utf8');
const start=tests.indexOf('function render('),end=tests.indexOf('function run(');
const render=new Function(tests.slice(start,end)+';return render')();
const s=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const create=new Function([...s.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]+';return createEngine;')();
const report={};function compact(r){return {axis:r.axis,hz:r.hz,axisMethod:r.axisMethod,confidenceAxis:r.confidenceAxis,confidenceHz:r.confidenceHz,axisReasons:r.axisReasons,hzReasons:r.hzReasons,methods:r.methods,maxGap:r.maxGap,irregular:r.irregular,support:r.correlationSupport}}
let e=create(),time=0;for(let i=0;i<200;i++){if(i)time+=(.62+(.5+.5*Math.sin(i*.37))*.76)/240;e.handle({type:'frame',payload:{rgba:render(time*240),n:96,time}})}let r=e.handle({type:'finish'});console.log('VFR',compact(r));report.vfr=compact(r);assert.equal(r.hzReasons.length,0);assert(Math.abs(r.hz-5)<.1);assert(r.irregular);
e=create();for(let i=0;i<210;i++){const t=i/240,turns=1.8*t+4*t*t;e.handle({type:'frame',payload:{rgba:render(turns*48),n:96,time:t}})}r=e.handle({type:'finish'});console.log('ACCELERATION',compact(r));report.acceleration=compact(r);assert.equal(r.axisReasons.length,0);assert(r.hzReasons.length);assert.equal(r.axisMethod,'stable-axis');assert(Math.abs(r.axis-60)<3);
fs.writeFileSync(path.join(__dirname,'v12-results.json'),JSON.stringify(report,null,2));
