/* V.A.D. isolated, deliberately limited graph simulator.
 * No HA API calls, service execution, eval, or network access.
 * Imported native HA graphs are rejected until semantic mapping is implemented.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VADSimulator=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const MAX_STEPS=500;
function simulate(graph,scenario){
 if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))throw Error('Invalid graph');
 if(graph.source?.readOnly||graph.nodes.some(n=>n.ha))throw Error('Native HA imports cannot be simulated safely yet');
 if(!scenario||typeof scenario!=='object'||Array.isArray(scenario))throw Error('Scenario must be an object');
 const states=scenario.states||{};if(!states||typeof states!=='object'||Array.isArray(states))throw Error('Scenario states must be an object');
 const byId=new Map(graph.nodes.map(n=>[n.id,n]));if(byId.size!==graph.nodes.length)throw Error('Duplicate node IDs');
 const out=new Map(graph.nodes.map(n=>[n.id,[]]));const indegree=new Map(graph.nodes.map(n=>[n.id,0]));
 for(const e of graph.edges){if(!byId.has(e.from)||!byId.has(e.to))throw Error('Dangling edge');out.get(e.from).push(e.to);indegree.set(e.to,indegree.get(e.to)+1)}
 const roots=[...byId.keys()].filter(id=>indegree.get(id)===0);if(byId.size&&!roots.length)throw Error('Cycle detected: no entry node');
 const trace=[],proposedActions=[],queue=roots.map(id=>({id,elapsedSeconds:0,path:[]}));let steps=0;
 while(queue.length){
  if(++steps>MAX_STEPS)throw Error('Simulation step limit exceeded (possible cycle)');
  const item=queue.shift(),n=byId.get(item.id);if(item.path.includes(item.id))throw Error('Cycle detected');
  const c=n.config||{};let passed=true,elapsed=item.elapsedSeconds;
  switch(n.type){
   case 'trigger':case 'sensor':case 'condition':case 'override':
    if(!c.entity_id)throw Error('Missing entity_id on '+n.id);
    if(!Object.prototype.hasOwnProperty.call(states,c.entity_id))throw Error('Missing scenario state: '+c.entity_id);
    if(c.to!==undefined&&c.to!=='')passed=String(states[c.entity_id])===String(c.to);
    if(c.state!==undefined&&c.state!=='')passed=String(states[c.entity_id])===String(c.state);
    break;
   case 'timer':{
    if(!/^\d{1,3}:[0-5]\d:[0-5]\d$/.test(c.duration||''))throw Error('Unsupported or missing timer duration on '+n.id);
    const [h,m,s]=c.duration.split(':').map(Number);elapsed+=h*3600+m*60+s;break;
   }
   case 'action':
    if(!/^[a-z0-9_]+\.[a-z0-9_]+$/.test(c.service||''))throw Error('Unsupported or missing action service on '+n.id);
    proposedActions.push({service:c.service,entity_id:c.entity_id||null,atSeconds:elapsed});break;
   case 'note':break;
   default:throw Error('Unsupported node type: '+n.type);
  }
  trace.push({nodeId:n.id,type:n.type,passed,atSeconds:elapsed});
  if(passed)for(const next of out.get(n.id))queue.push({id:next,elapsedSeconds:elapsed,path:item.path.concat(item.id)});
 }
 return {mode:'dry-run',executedServices:0,proposedActions,trace,steps,warning:'Illustrative graph traversal only; not Home Assistant semantics. Parallel branches and real scheduling are not modelled.'};
}
return {simulate};
});