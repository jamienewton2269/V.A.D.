/* Fail-closed native HA dry-run evaluator for explicitly supported action subset.
 * Not a substitute for Home Assistant runtime. No network or service calls.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADNativePreview=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function preflight(automation){
 let count=0;
 function checkCondition(c){if(++count>1000)throw Error('Preview size limit');if(!c||typeof c!=='object'||Array.isArray(c))throw Error('Invalid condition');
 const k=c.condition;
 if(k==='state'){if(typeof c.entity_id!=='string'||typeof c.state!=='string'||Object.keys(c).some(x=>!['condition','entity_id','state','alias'].includes(x)))throw Error('Unsupported state condition');return}
 if(k==='numeric_state'){if(typeof c.entity_id!=='string'||(!Object.prototype.hasOwnProperty.call(c,'above')&&!Object.prototype.hasOwnProperty.call(c,'below'))||Object.keys(c).some(x=>!['condition','entity_id','above','below','alias'].includes(x)))throw Error('Unsupported numeric condition');return}
 if(['and','or','not'].includes(k)){if(!Array.isArray(c.conditions))throw Error('Condition group requires array');c.conditions.forEach(checkCondition);return}
 throw Error('Unsupported HA condition: '+String(k));
 }
 function checkActions(items){if(!Array.isArray(items))throw Error('Action list required');for(const a of items){if(++count>1000)throw Error('Preview size limit');if(!a||typeof a!=='object'||Array.isArray(a))throw Error('Invalid action');
 if(Object.prototype.hasOwnProperty.call(a,'choose')){if(Object.keys(a).some(x=>!['choose','default','alias'].includes(x))||!Array.isArray(a.choose))throw Error('Unsupported choose');for(const b of a.choose){if(!b||!Array.isArray(b.conditions)||!Array.isArray(b.sequence)||Object.keys(b).some(x=>!['conditions','sequence','alias'].includes(x)))throw Error('Invalid choose branch');b.conditions.forEach(checkCondition);checkActions(b.sequence)}if('default'in a)checkActions(a.default);continue}
 if('if'in a){if(Object.keys(a).some(x=>!['if','then','else','alias'].includes(x))||!Array.isArray(a.if))throw Error('Unsupported if');a.if.forEach(checkCondition);checkActions(a.then||[]);checkActions(a.else||[]);continue}
 if('delay'in a){if(typeof a.delay!=='string'||!/^\\d{1,3}:[0-5]\\d:[0-5]\\d$/.test(a.delay)||Object.keys(a).some(x=>!['delay','alias'].includes(x)))throw Error('Unsupported delay');continue}
 if('stop'in a){if(Object.keys(a).some(x=>!['stop','alias'].includes(x)))throw Error('Unsupported stop');continue}
 if('action'in a||'service'in a){const s=a.action||a.service;if(typeof s!=='string'||!/^[a-z0-9_]+\\.[a-z0-9_]+$/.test(s)||Object.keys(a).some(x=>!['action','service','target','data','alias','enabled'].includes(x))||('target'in a&&(!a.target||typeof a.target!=='object'||Array.isArray(a.target)))||('data'in a&&(!a.data||typeof a.data!=='object'||Array.isArray(a.data))))throw Error('Unsupported service action');continue}
 throw Error('Unsupported HA action: '+Object.keys(a).join(','));
 }}
 const triggers=automation.triggers??automation.trigger??[],conds=automation.conditions??automation.condition??[],acts=automation.actions??automation.action;
 if(!Array.isArray(triggers)||!Array.isArray(conds)||!Array.isArray(acts))throw Error('Invalid automation lists');
 conds.forEach(checkCondition);checkActions(acts);
 return {triggers,conds,acts};
}

function preview(automation,scenario){
 if(!automation||typeof automation!=='object'||Array.isArray(automation))throw Error('Invalid automation');
 if(!scenario||typeof scenario!=='object'||!scenario.states||typeof scenario.states!=='object')throw Error('Scenario states required');
 const {triggers,conds,acts}=preflight(automation);
 const states=scenario.states,trace=[],proposedActions=[];let elapsed=0,steps=0,stopped=false;
 const requireStep=()=>{if(++steps>1000)throw Error('Preview limit exceeded')};
 function value(id){if(!own(states,id))throw Error('Missing state: '+id);return states[id]}
 function conditions(items){if(!Array.isArray(items))throw Error('Condition list required');return items.every(condition)}
 function condition(c){requireStep();if(!c||typeof c!=='object')throw Error('Invalid condition');
 const kind=c.condition;
 if(kind==='state'){if(typeof c.entity_id!=='string'||typeof c.state!=='string')throw Error('Unsupported state condition');const v=String(value(c.entity_id))===c.state;trace.push({condition:'state',entity_id:c.entity_id,result:v});return v}
 if(kind==='numeric_state'){const n=Number(value(c.entity_id));if(!Number.isFinite(n))return false;let ok=true;if(own(c,'above'))ok=ok&&n>Number(c.above);if(own(c,'below'))ok=ok&&n<Number(c.below);if(!own(c,'above')&&!own(c,'below'))throw Error('Numeric threshold missing');trace.push({condition:'numeric_state',entity_id:c.entity_id,result:ok});return ok}
 if(kind==='and')return conditions(c.conditions||[]);
 if(kind==='or'){if(!Array.isArray(c.conditions))throw Error('OR conditions required');return c.conditions.some(condition)}
 if(kind==='not')return !conditions(c.conditions||[]);
 throw Error('Unsupported HA condition: '+String(kind));
 }
 function actions(items){if(!Array.isArray(items))throw Error('Action list required');for(const a of items){if(stopped)return;requireStep();if(!a||typeof a!=='object'||Array.isArray(a))throw Error('Invalid action');
 if(own(a,'choose')){if(!Array.isArray(a.choose))throw Error('Invalid choose');let matched=false;for(const b of a.choose){if(!b||!Array.isArray(b.conditions)||!Array.isArray(b.sequence))throw Error('Invalid choice');if(conditions(b.conditions)){matched=true;actions(b.sequence);break}}if(!matched&&own(a,'default'))actions(a.default);continue}
 if(own(a,'if')){if(!Array.isArray(a.if))throw Error('Invalid if');if(conditions(a.if))actions(a.then||[]);else actions(a.else||[]);continue}
 if(own(a,'delay')){if(typeof a.delay!=='string'||!/^\d{1,3}:[0-5]\d:[0-5]\d$/.test(a.delay))throw Error('Only HH:MM:SS delays supported');const [h,m,s]=a.delay.split(':').map(Number);elapsed+=h*3600+m*60+s;trace.push({delaySeconds:h*3600+m*60+s});continue}
 if(own(a,'stop')){stopped=true;trace.push({stop:true});continue}
 if(own(a,'action')||own(a,'service')){const service=a.action||a.service;if(typeof service!=='string'||!/^[a-z0-9_]+\.[a-z0-9_]+$/.test(service)||Object.keys(a).some(k=>!['action','service','target','data','alias','enabled','continue_on_error'].includes(k)))throw Error('Unsupported service action');
 if(a.enabled===false)continue;
 proposedActions.push({service,target:a.target||{},data:a.data||{},atSeconds:elapsed});continue}
 throw Error('Unsupported HA action; refusing partial preview: '+Object.keys(a).join(','));
 }}
 // Caller explicitly supplies the fired trigger. Do not guess which trigger fired.
 if(triggers.length){if(!Number.isInteger(scenario.triggerIndex)||scenario.triggerIndex<0||scenario.triggerIndex>=triggers.length)throw Error('Explicit triggerIndex required');trace.push({triggerIndex:scenario.triggerIndex,trigger:triggers[scenario.triggerIndex]})}
 const eligible=conditions(conds);if(eligible)actions(acts);
 return {mode:'native-subset-preview',eligible,executedServices:0,proposedActions,trace,warning:'Subset-only preview. Home Assistant templates, context, trigger evaluation, time, concurrency and integrations are not emulated.'};
}
return {preview};
});