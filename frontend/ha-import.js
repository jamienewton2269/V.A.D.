/* Home Assistant JSON -> read-only visual control-flow graph.
 * Edges describe potential paths, not evaluated HA semantics. No execution.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADImporter=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clone=v=>JSON.parse(JSON.stringify(v));
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const label=v=>String(typeof v==='string'?v:JSON.stringify(v)).slice(0,160);
function importAutomation(raw){
 if(!obj(raw))throw Error('Automation must be an object');
 const actions=raw.actions??raw.action;
 if(!Array.isArray(actions))throw Error('Automation actions/action must be an array');
 const source=clone(raw),nodes=[],edges=[];let serial=0;
 function make(type,title,original,path,depth){const id='ha_'+(++serial);nodes.push({id,type,label:label(title),x:80+depth*250,y:60+(serial-1)*115,config:{},ha:{path,original:clone(original),readOnly:true}});return id}
 function link(a,b,relation='next'){if(a&&b)edges.push({from:a,to:b,relation})}
 function join(tails,path,depth){const id=make('note','Continue',null,path.concat('join'),depth);for(const t of tails)link(t,id);return id}
 function walk(steps,from,path,depth){let tail=from;for(let i=0;i<steps.length;i++){
  const step=steps[i],p=path.concat(i);
  if(!obj(step)){const id=make('note','Unsupported action',step,p,depth);link(tail,id);tail=id;continue}
  let type='action',title='Action';
  if(Array.isArray(step.choose)){type='condition';title='Choose ('+step.choose.length+' branches)'}
  else if(step.if!==undefined){type='condition';title='If / then / else'}
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
  if(Array.isArray(step.choose)){
   const tails=[];
   step.choose.forEach((branch,j)=>{const b=make('condition','Choice '+(j+1)+' conditions',branch.conditions||[],p.concat('choose',j,'conditions'),depth+1);link(id,b,'choice '+(j+1));tails.push(walk(Array.isArray(branch.sequence)?branch.sequence:[],b,p.concat('choose',j,'sequence'),depth+2))});
   if(Array.isArray(step.default))tails.push(walk(step.default,id,p.concat('default'),depth+1));
   else tails.push(id); // no matching choice
   tail=join(tails,p,depth+1);
  }else if(step.if!==undefined){
   const tails=[];
   if(Array.isArray(step.then))tails.push(walk(step.then,id,p.concat('then'),depth+1));else tails.push(id);
   if(Array.isArray(step.else))tails.push(walk(step.else,id,p.concat('else'),depth+1));else tails.push(id);
   tail=join(tails,p,depth+1);
  }else if(Array.isArray(step.parallel)){
   const tails=step.parallel.map((branch,j)=>walk(Array.isArray(branch)?branch:[branch],id,p.concat('parallel',j),depth+1));
   tail=join(tails.length?tails:[id],p,depth+1);
  }else if(obj(step.repeat)&&Array.isArray(step.repeat.sequence)){
   const body=walk(step.repeat.sequence,id,p.concat('repeat','sequence'),depth+1);
   // Avoid a false loop in the visual DAG; repeat count/until semantics remain opaque.
   tail=join([id,body],p,depth+1);
  }
 }return tail}
 const start=make('note',source.alias||source.id||'Automation',source,[],0);
 const triggers=source.triggers??source.trigger??[];
 if(!Array.isArray(triggers))throw Error('Triggers must be an array');
 const triggerTails=triggers.map((t,i)=>{const id=make('trigger',obj(t)?'Trigger: '+label(t.platform||t.trigger||'unknown'):'Trigger',t,['triggers',i],1);link(start,id,'trigger');return id});
 let tail=triggerTails.length?join(triggerTails,['triggers'],2):start;
 const conditions=source.conditions??source.condition??[];
 if(!Array.isArray(conditions))throw Error('Conditions must be an array');
 conditions.forEach((c,i)=>{const id=make('condition',obj(c)?'Condition: '+label(c.condition||'unknown'):'Condition',c,['conditions',i],2);link(tail,id);tail=id});
 walk(actions,tail,['actions'],3);
 return {version:1,nodes,edges,source:{format:'home-assistant-automation-json',automation:source,readOnly:true},capabilities:{nativeExport:false,simulation:false}};
}
function importCollection(raw){return Array.isArray(raw)?raw.map(importAutomation):[importAutomation(raw)]}
return {importAutomation,importCollection};
});