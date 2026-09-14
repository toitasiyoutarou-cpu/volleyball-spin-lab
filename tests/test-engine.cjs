/* Node-only numerical regression checks. The browser app itself has no dependencies. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
scripts.forEach(s=>new Function(s));
const make=new Function(scripts[0]+';return createEngine;')();
function render(i,{hz=5,theta=60,z=.4358898944,blank=false,symmetric=false,n=96}={}){
 const out=new Uint8ClampedArray(n*n*4),p=Math.sqrt(1-z*z),axis=[p*Math.cos(theta*Math.PI/180),p*Math.sin(theta*Math.PI/180),z],a=-2*Math.PI*hz*i/240,c=Math.cos(a),s=Math.sin(a);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const xx=(x+.5-n/2)/(n/2),yy=-(y+.5-n/2)/(n/2),rr=xx*xx+yy*yy,k=(y*n+x)*4;if(rr>=1)continue;const zz=Math.sqrt(1-rr),dot=axis[0]*xx+axis[1]*yy+axis[2]*zz;
 // Independent Rodrigues implementation: no registration or estimator calls.
 const u=xx*c+(axis[1]*zz-axis[2]*yy)*s+axis[0]*dot*(1-c),v=yy*c+(axis[2]*xx-axis[0]*zz)*s+axis[1]*dot*(1-c),w=zz*c+(axis[0]*yy-axis[1]*xx)*s+axis[2]*dot*(1-c);
 const f=symmetric?Math.sin(6*Math.atan2(v,u)):Math.sin(8*u+2*v)*Math.cos(7*v-3*w)+.65*Math.sin(10*w+2*u),t=Math.tanh(f*5),shade=.76+.24*zz,col=blank?[220,220,220]:t>.28?[248,191,45]:t<-.28?[28,97,184]:[235,235,218],detail=blank||symmetric?1:1-.1*Math.sin(19*u+13*v-7*w)*Math.sin(17*w-3*v);
 for(let c=0;c<3;c++)out[k+c]=Math.max(0,Math.min(255,col[c]*shade*detail));out[k+3]=255}return out;
}
function run(config,N){const E=make();for(let i=0;i<N;i++)E.handle({type:'frame',payload:{rgba:render(i,config),n:96,time:i/240}});return E.handle({type:'finish'})}
const compact=r=>({axis:r.axis,hz:r.hz,confidenceAxis:r.confidenceAxis,confidenceHz:r.confidenceHz,axisReasons:r.axisReasons,hzReasons:r.hzReasons,aliases:r.aliases});
const report={};
let r=run({},144);assert.equal(r.axisReasons.length,0);assert.equal(r.hzReasons.length,0);assert(Math.abs(r.axis-60)<3);assert(Math.abs(r.hz-5)<.05);report.normal=compact(r);console.log('PASS known 5 Hz / 60 degrees');
r=run({hz:0},64);assert(r.axisReasons.length>0);assert(r.hzReasons.length>0);report.stationary=compact(r);console.log('PASS stationary withheld');
r=run({blank:true},64);assert(r.hzReasons.length>0);report.blank=compact(r);console.log('PASS textureless withheld');
r=run({},48);assert(r.hzReasons.some(s=>s.includes('2周期')));report.short=compact(r);console.log('PASS short interval Hz withheld');
r=run({z:.998},144);assert(r.axisReasons.some(s=>s.includes('奥行き')));report.depth=compact(r);console.log('PASS end-on axis withheld');
r=run({z:1,symmetric:true},144);assert(r.hzReasons.length>0);report.symmetric=compact(r);console.log('PASS repeated symmetric pattern withheld');
for(const theta of[0,135,179]){const E=make(),a=E.makeFrame(render(0,{theta}),96),b=E.makeFrame(render(1,{theta}),96),p=E.register(a,b);assert(p.ok);const angle=(Math.atan2(p.w[1],p.w[0])*180/Math.PI+180)%180,error=Math.abs(((angle-theta+270)%180)-90);assert(error<5);console.log('PASS axis convention',theta,angle)}
const E=make(),raw=render(0,{});let q=raw;for(let pass=0;pass<30;pass++){const dst=new Uint8ClampedArray(q);for(let y=1;y<95;y++)for(let x=1;x<95;x++)for(let c=0;c<3;c++){let v=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)v+=q[((y+dy)*96+x+dx)*4+c];dst[(y*96+x)*4+c]=v/9}q=dst}const blurred=E.makeFrame(q,96);report.blur={edge:blurred.edge,sharpness:blurred.sharpness};assert(blurred.sharpness<.12||blurred.edge<.005);console.log('PASS severe blur rejected by sharpness gate');
// No network or persistent video storage functions in app code.
assert(!/\b(fetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(|indexedDB\b|localStorage\b)/.test(scripts.join('\n')));
assert(html.includes("connect-src 'none'"));assert(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(html));console.log('PASS no network API, CSP and inline dependencies');
fs.writeFileSync(path.join(__dirname,'numerical-results.json'),JSON.stringify(report,null,2)+'\n');
