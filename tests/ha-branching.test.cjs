const {test}=require('node:test');const assert=require('node:assert/strict');const {importAutomation}=require('../frontend/ha-import.js');
test('multiple triggers all converge before actions',()=>{
 const g=importAutomation({alias:'Multiple',triggers:[{trigger:'state',entity_id:'a'},{trigger:'state',entity_id:'b'}],actions:[{action:'light.turn_on'}]});
 const triggers=g.nodes.filter(n=>n.type==='trigger'),join=g.nodes.find(n=>n.label==='Continue');
 assert.equal(triggers.length,2);assert.ok(join);for(const t of triggers)assert.ok(g.edges.some(e=>e.from===t.id&&e.to===join.id));
 assert.ok(g.edges.some(e=>e.from===join.id&&g.nodes.find(n=>n.id===e.to)?.label==='Call light.turn_on'));
});
test('choose branches reconnect before following action',()=>{
 const g=importAutomation({actions:[{choose:[{conditions:[],sequence:[{action:'light.turn_on'}]},{conditions:[],sequence:[{action:'light.turn_off'}]}],default:[{action:'switch.turn_on'}]},{action:'notify.send_message'}]});
 const after=g.nodes.find(n=>n.label==='Call notify.send_message'),joins=g.nodes.filter(n=>n.label==='Continue');
 assert.equal(joins.length,1);assert.ok(g.edges.some(e=>e.from===joins[0].id&&e.to===after.id));
 for(const label of ['Call light.turn_on','Call light.turn_off','Call switch.turn_on']){const n=g.nodes.find(n=>n.label===label);assert.ok(g.edges.some(e=>e.from===n.id&&e.to===joins[0].id),label)}
});
test('retains source untouched for inspection',()=>{
 const raw={actions:[{if:[{condition:'state',entity_id:'a',state:'on'}],then:[{action:'light.turn_on'}],else:[{action:'light.turn_off'}]}]};
 const g=importAutomation(raw);assert.deepEqual(g.source.automation,raw);assert.equal(g.source.readOnly,true);assert.equal(g.capabilities.nativeExport,false);
});
