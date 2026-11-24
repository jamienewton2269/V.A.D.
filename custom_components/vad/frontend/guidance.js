/* Local, per-task progressive guidance. No telemetry. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADGuidance=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function level(record={}){return record.full?'full':record.minimized?'compact':(record.completed||0)>=5?'compact':(record.completed||0)>=2?'concise':'full'}
function complete(record={}){return {...record,completed:Math.min(100,(record.completed||0)+1)}}
function preference(record={},mode){if(!['full','compact','auto'].includes(mode))throw Error('Invalid guidance preference');return {...record,full:mode==='full',minimized:mode==='compact'}}
return {level,complete,preference};
});