/* Pure structural diagnostics. Does not execute HA automations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADGraphAnalysis=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function analyze(graph){const issues=[];if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))return {valid:false,issues:['Malformed graph']};
const nodes=new Map(),incoming=new Map(),outgoing=new Map();
for(const n of graph.nodes){if(!n||typeof n.id!=='string'||nodes.has(n.id)){issues.push('Duplicate or invalid node ID');continue}nodes.set(n.id,n);incoming.set(n.id,[]);outgoing.set(n.id,[])}
const seen=new Set();for(const e of graph.edges){if(!e||!nodes.has(e.from)||!nodes.has(e.to)){issues.push('Edge references missing node');continue}const key=e.from+'\u0000'+e.to+'\u0000'+(e.relation||'');if(seen.has(key))issues.push('Duplicate connection: '+e.from+' → '+e.to);seen.add(key);outgoing.get(e.from).push(e.to);incoming.get(e.to).push(e.from);if(e.from===e.to)issues.push('Self-loop: '+e.from)}
const colour=new Map();function visit(id){if(colour.get(id)===1){issues.push('Cycle detected at '+id);return}if(colour.get(id)===2)return;colour.set(id,1);for(const next of outgoing.get(id)||[])visit(next);colour.set(id,2)}
for(const id of nodes.keys())visit(id);
const roots=[...nodes.keys()].filter(id=>incoming.get(id).length===0);
if(nodes.size&&roots.length===0)issues.push('No entry node');
const reached=new Set();function reach(id){if(reached.has(id))return;reached.add(id);for(const next of outgoing.get(id)||[])reach(next)}for(const id of roots)reach(id);
for(const id of nodes.keys())if(!reached.has(id))issues.push('Unreachable node: '+id);
return {valid:issues.length===0,issues,roots,nodeCount:nodes.size,edgeCount:graph.edges.length,readOnlySource:!!graph.source?.readOnly};
}
return {analyze};
});