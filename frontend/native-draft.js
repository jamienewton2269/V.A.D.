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
function restructure(source,path,operation,options={}){
 if(!Array.isArray(path)||!path.length||!Number.isInteger(path[path.length-1]))throw Error('Select an action in a sequence');
 const draft=clone(source);let list=draft;
 const parent=path.slice(0,-1);
 if(!['actions','action'].includes(parent[0]))throw Error('Only action sequences can be restructured');
 for(let i=0;i<parent.length;i++){let p=parent[i];if(i===0&&p==='actions'&&!Object.hasOwn(list,p))p='action';if(['__proto__','constructor','prototype'].includes(String(p))||!list||!Object.hasOwn(list,p))throw Error('Invalid sequence path');list=list[p]}
 if(!Array.isArray(list)||!['actions','action','sequence','then','else','default'].includes(parent[parent.length-1]))throw Error('Not a supported action sequence');
 const index=path[path.length-1];if(index<0||index>=list.length)throw Error('Invalid action index');
 if(operation==='up'||operation==='down'){const target=index+(operation==='up'?-1:1);if(target<0||target>=list.length)throw Error('Already at sequence boundary');[list[index],list[target]]=[list[target],list[index]]}
 else if(operation==='insert-delay')list.splice(index+1,0,{delay:'00:00:05'});
 else if(operation==='insert-service'){const service=options.service;if(typeof service!=='string'||!/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(service))throw Error('Enter a domain.service action');const entity=options.entity;if(typeof entity!=='string'||!/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/.test(entity))throw Error('Enter a target entity ID');list.splice(index+1,0,{action:service,target:{entity_id:entity}})}
 else if(operation==='remove'){if(list.length===1)throw Error('Cannot remove the final action in a sequence');list.splice(index,1)}
 else throw Error('Unsupported structural edit');
 return draft;
}
return {edit,restructure};
});