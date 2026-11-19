/* V.A.D. Home Assistant automation JSON -> read-only visual graph.
 * Pure conversion: never invokes HA APIs or executes imported templates.
 * Source is retained for lossless inspection; NOT a YAML round-trip exporter.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADImporter=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function clone(v){return JSON.parse(JSON.stringify(v))}
function isObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function label(v,limit=90){let s=typeof v==='string'?v:JSON.stringify(v);return (s||'').slice(0,limit)}
function normalize(raw){if(!isObject(raw))throw Error('Automation must be an object');if(!Array.isArray(raw.actions)&&!Array.isArray(raw.action))throw Error('Automation actions/action must be an array');return raw}
function importAutomation(raw){
const source=clone(normalize(raw));const nodes=[],edges=[];let serial=0;
function make(type,title,original,path,depth){const id='ha_'+(++serial);nodes.push({id,type,label:label(title,200),x:80+depth*250,y:60+(serial-1)*115,config:{},ha:{path,original:clone(original),readOnly:true}});return id}
function link(from,to,relation='next'){if(from&&to)edges.push({from,to,relation})}
function walkSteps(steps,from,path,depth){let tail=from;for(let i=0;i<steps.length;i++){const step=steps[i],p=path.concat(i);if(!isObject(step)){const id=make('note','Unsupported action',step,p,depth);link(tail,id);tail=id;continue}
let type='action',title='Action';
if(step.choose){type='condition';title='Choose ('+step.choose.length+' branches)'}
else if(step.if){type='condition';title='If / then / else'}
else if(step.delay!==undefined){type='timer';title='Delay '+label(step.delay)}
else if(step.wait_template!==undefined||step.wait_for_trigger){type='timer';title='Wait'}
else if(step.repeat){type='condition';title='Repeat'}
else if(step.parallel){type='condition';title='Parallel'}
else if(step.service||step.action){title='Call '+label(step.service||step.action)}
else if(step.scene){title='Scene '+label(step.scene)}
else if(step.event){title='Event '+label(step.event)}
else if(step.stop){title='Stop'}
else if(step.variables){type='note';title='Variables'}
else{type='note';title='Unsupported action'}
const id=make(type,title,step,p,depth);link(tail,id);tail=id;
if(Array.isArray(step.choose)){step.choose.forEach((branch,j)=>{const b=make('condition','Choice '+(j+1)+' conditions',branch.conditions||[],p.concat('choose',j,'conditions'),depth+1);link(id,b,'choice '+(j+1));walkSteps(branch.sequence||[],b,p.concat('choose',j,'sequence'),depth+2)});if(Array.isArray(step.default))walkSteps(step.default,id,p.concat('default'),depth+1)}
if(Array.isArray(step.then))walkSteps(step.then,id,p.concat('then'),depth+1);
if(Array.isArray(step.else))walkSteps(step.else,id,p.concat('else'),depth+1);
if(isObject(step.repeat)&&Array.isArray(step.repeat.sequence))walkSteps(step.repeat.sequence,id,p.concat('repeat','sequence'),depth+1);
if(Array.isArray(step.parallel))step.parallel.forEach((branch,j)=>walkSteps(Array.isArray(branch)?branch:[branch],id,p.concat('parallel',j),depth+1));
}return tail}
const start=make('note',source.alias||source.id||'Automation',source,[],0);
const triggers=source.triggers||source.trigger||[];let tail=start;
if(!Array.isArray(triggers))throw Error('Triggers must be an array');
triggers.forEach((t,i)=>{const id=make('trigger',isObject(t)?'Trigger: '+label(t.platform||t.trigger||'unknown'):'Trigger',t,['triggers',i],1);link(start,id,'trigger');tail=id});
const conditions=source.conditions||source.condition||[];
if(!Array.isArray(conditions))throw Error('Conditions must be an array');
conditions.forEach((c,i)=>{const id=make('condition',isObject(c)?'Condition: '+label(c.condition||'unknown'):'Condition',c,['conditions',i],2);link(tail,id);tail=id});
walkSteps(source.actions||source.action,tail,['actions'],3);
return {version:1,nodes,edges,source:{format:'home-assistant-automation-json',automation:source,readOnly:true},capabilities:{nativeExport:false,simulation:false}};
}
function importCollection(raw){if(Array.isArray(raw))return raw.map(importAutomation);return [importAutomation(raw)]}
return {importAutomation,importCollection};
});