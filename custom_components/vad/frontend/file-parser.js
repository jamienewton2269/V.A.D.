/* Browser file parsing, no Home Assistant calls. Requires js-yaml 4.1.0 for YAML. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADFileParser=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function parse(text,filename,yamlLibrary){
 if(typeof text!=='string'||text.length>1024*1024)throw Error('File too large');
 const yaml=/\.(yaml|yml)$/i.test(filename||'');
 if(!yaml)return JSON.parse(text);
 if(!yamlLibrary||typeof yamlLibrary.load!=='function')throw Error('YAML parser unavailable. Reinstall the bundled parser or use offline Python converter.');
 // YAML tags such as !include are not evaluated. Refuse them until an HA-aware parser is available.
 const result=yamlLibrary.load(text,{schema:yamlLibrary.JSON_SCHEMA,json:false});
 if(!result||typeof result!=='object'||Array.isArray(result)&&!result.length)throw Error('Expected automation object or nonempty list');
 return result;
}
return {parse};
});