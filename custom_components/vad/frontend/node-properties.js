/* Schema-based draft property editing; imported HA fields remain read-only. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADProperties=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const schemas={
trigger:[{key:'entity_id',label:'Entity ID',type:'text'},{key:'to',label:'To state',type:'text'}],
sensor:[{key:'entity_id',label:'Sensor entity',type:'text'}],
condition:[{key:'entity_id',label:'Entity ID',type:'text'},{key:'state',label:'Expected state',type:'text'}],
timer:[{key:'duration',label:'Duration (HH:MM:SS)',type:'duration'}],
action:[{key:'service',label:'Service (domain.action)',type:'service'},{key:'entity_id',label:'Target entity',type:'text'}],
override:[{key:'entity_id',label:'Override entity',type:'text'}],
note:[{key:'description',label:'Description',type:'text'}]
};
function validDuration(v){return /^\d{1,3}:[0-5]\d:[0-5]\d$/.test(v)}
function validate(type,key,value){const f=(schemas[type]||[]).find(x=>x.key===key);if(!f)throw Error('Unsupported property');if(typeof value!=='string'||value.length>512)throw Error('Property must be text under 513 characters');if(f.type==='duration'&&value&&!validDuration(value))throw Error('Duration must be HH:MM:SS');if(f.type==='service'&&value&&!/^[a-z0-9_]+\.[a-z0-9_]+$/.test(value))throw Error('Service must be domain.action');return value}
function update(node,key,value){if(!node||node.ha?.readOnly)throw Error('Imported HA source is read-only');const checked=validate(node.type,key,value);return {...node,config:{...(node.config||{}),[key]:checked}}}
return {schemas,validate,update};
});