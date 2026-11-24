/* Browser file parsing, no Home Assistant calls. Requires js-yaml 4.1.1 for YAML. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADFileParser=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function parse(text,filename,yamlLibrary){
 if(typeof text!=='string'||text.length>1024*1024)throw Error('File too large');
 const yaml=/\.(yaml|yml)$/i.test(filename||'');
 if(!yaml)return JSON.parse(text);
 if(!yamlLibrary||typeof yamlLibrary.load!=='function')throw Error('YAML parser unavailable. Reinstall the bundled parser or use offline Python converter.');
 // YAML tags such as !include are not evaluated. Refuse them until an HA-aware parser is available.
 const result=yamlLibrary.load(text,{schema:yamlLibrary.JSON_SCHEMA,json:false});
 if(!result||typeof result!=='object'||Array.isArray(result)&&!result.length)throw Error('Expected automation object or nonempty list');
 // Reject cyclic aliases and bound expanded structure before importer cloning.
 const active=new Set();let count=0;
 function inspect(v,depth){if(++count>50000||depth>64)throw Error('YAML structure exceeds import limits');if(!v||typeof v!=='object')return;if(active.has(v))throw Error('Cyclic YAML alias');active.add(v);for(const key of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(key))throw Error('Unsafe YAML key');inspect(v[key],depth+1)}active.delete(v)}
 inspect(result,0);
 return result;
}
return {parse};
});