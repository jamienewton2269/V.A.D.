const assert=require('node:assert/strict');
const {test}=require('node:test');
const {importAutomation,importCollection}=require('../frontend/ha-import.js');
test('imports nested native HA actions without dropping originals',()=>{
const automation={id:'123',alias:'Dusk',triggers:[{trigger:'sun',event:'sunset'}],conditions:[{condition:'numeric_state',entity_id:'sensor.west_eaves_lux',below:30}],actions:[{choose:[{conditions:[{condition:'state',entity_id:'input_boolean.manual',state:'off'}],sequence:[{action:'light.turn_on',target:{entity_id:'light.dining'}}]}],default:[{delay:'00:00:30'}]},{repeat:{count:2,sequence:[{action:'logbook.log',data:{message:'done'}}]}}]};
const before=JSON.stringify(automation),g=importAutomation(automation);
assert.equal(JSON.stringify(automation),before);
assert.deepEqual(g.source.automation,automation);
assert.equal(g.source.readOnly,true);
assert.equal(g.capabilities.nativeExport,false);
assert.ok(g.nodes.some(n=>n.label==='Call light.turn_on'));
assert.ok(g.nodes.some(n=>n.label==='Delay 00:00:30'));
assert.ok(g.edges.some(e=>e.relation==='choice 1'));
assert.ok(g.nodes.every(n=>n.ha.readOnly));
});
test('rejects malformed actions',()=>assert.throws(()=>importAutomation({actions:{action:'light.turn_on'}})));
test('accepts legacy HA trigger/action keys',()=>assert.equal(importCollection({trigger:[],action:[]}).length,1));
test('keeps unknown actions opaque',()=>{const g=importAutomation({triggers:[],actions:[{custom_future_action:{key:'value'}}]});assert.deepEqual(g.nodes[1].ha.original,{custom_future_action:{key:'value'}})});

test('supports nested if/then/else and parallel branches',()=>{
 const a={alias:'Nested',triggers:[],actions:[{if:[{condition:'template',value_template:'{{ true }}'}],then:[{parallel:[[ {action:'light.turn_on'} ],[{delay:5}]]}],else:[{action:'light.turn_off'}]}]};
 const g=importAutomation(a);
 assert.deepEqual(g.source.automation,a);
 assert.ok(g.nodes.some(n=>n.label==='If / then / else'));
 assert.ok(g.nodes.some(n=>n.label==='Call light.turn_on'));
 assert.ok(g.nodes.some(n=>n.label==='Call light.turn_off'));
 assert.ok(g.nodes.some(n=>n.label==='Delay 5'));
});
test('source object is deeply cloned and remains independent of input',()=>{
 const a={alias:'Original',triggers:[],actions:[{action:'light.turn_on'}]};
 const g=importAutomation(a);a.actions[0].action='light.turn_off';
 assert.equal(g.source.automation.actions[0].action,'light.turn_on');
});
