/* Source-preserving native draft edits. No HA calls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADNativeDraft=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clone=v=>JSON.parse(JSON.stringify(v));
function edit(source,path,key,value){
 if(!source||typeof source!=='object'||!Array.isArray(path)||!path.length)throw Error('Select a native source node');
 const draft=clone(source);let node=draft;
 for(let i=0;i<path.length;i++){let p=path[i];if(i===0&&['triggers','conditions','actions'].includes(p)&&!Object.hasOwn(node,p))p={triggers:'trigger',conditions:'condition',actions:'action'}[p];if(!node||!Object.hasOwn(node,p)||['__proto__','constructor','prototype'].includes(String(p)))throw Error('Invalid source path');node=node[p]}
 if(!node||typeof node!=='object'||Array.isArray(node)||!Object.hasOwn(node,key))throw Error('Field not present');
 const allowed=(key==='alias')||(key==='state'&&node.condition==='state')||(key==='delay'&&typeof node.delay==='string')||(['above','below'].includes(key)&&node.condition==='numeric_state');
 if(!allowed)throw Error('Field is not supported for visual editing');
 if(['above','below'].includes(key)){if(typeof value!=='number'||!Number.isFinite(value))throw Error('Finite numeric threshold required')}
 else if(typeof value!=='string'||value.length>500)throw Error('Invalid text value');
 if(key==='delay'&&!/^\d{1,3}:[0-5]\d:[0-5]\d$/.test(value))throw Error('Use HH:MM:SS');
 node[key]=value;return draft;
}
return {edit};
});