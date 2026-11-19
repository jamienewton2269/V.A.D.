const {test}=require('node:test');const assert=require('node:assert/strict');const {simulate}=require('../frontend/simulator.js');
const node=(id,type,config={})=>({id,type,config});
test('simulates a simple draft without executing services',()=>{
 const g={nodes:[node('a','trigger',{entity_id:'binary_sensor.door',to:'on'}),node('b','timer',{duration:'00:00:30'}),node('c','action',{service:'light.turn_on',entity_id:'light.porch'})],edges:[{from:'a',to:'b'},{from:'b',to:'c'}]};
 const r=simulate(g,{states:{'binary_sensor.door':'on'}});assert.equal(r.executedServices,0);assert.deepEqual(r.proposedActions,[{service:'light.turn_on',entity_id:'light.porch',atSeconds:30}]);
});
test('blocked condition suppresses proposed action',()=>{
 const g={nodes:[node('a','condition',{entity_id:'input_boolean.manual',state:'off'}),node('b','action',{service:'light.turn_on'})],edges:[{from:'a',to:'b'}]};
 assert.equal(simulate(g,{states:{'input_boolean.manual':'on'}}).proposedActions.length,0);
});
test('rejects imported native HA graphs',()=>assert.throws(()=>simulate({source:{readOnly:true},nodes:[],edges:[]},{states:{}}),/cannot be simulated/));
test('rejects missing sensor data instead of assuming a state',()=>assert.throws(()=>simulate({nodes:[node('a','sensor',{entity_id:'sensor.lux'})],edges:[]},{states:{}}),/Missing scenario state/));
test('rejects cycles rather than hanging',()=>assert.throws(()=>simulate({nodes:[node('a','note'),node('b','note')],edges:[{from:'a',to:'b'},{from:'b',to:'a'}]},{states:{}}),/Cycle|step limit/));
