const {test}=require('node:test');const assert=require('node:assert/strict');const {preview}=require('../frontend/native-preview.js');
const states={'sensor.lux':'20','input_boolean.override':'off'};
test('multiple triggers require explicit fired trigger',()=>{const a={triggers:[{trigger:'state',entity_id:'a'},{trigger:'state',entity_id:'b'}],actions:[{action:'light.turn_on'}]};assert.throws(()=>preview(a,{states}),/triggerIndex/);assert.equal(preview(a,{states,triggerIndex:1}).trace[0].triggerIndex,1)});
test('choose takes first matching branch only',()=>{const a={actions:[{choose:[{conditions:[{condition:'numeric_state',entity_id:'sensor.lux',below:30}],sequence:[{action:'light.turn_on'}]},{conditions:[],sequence:[{action:'light.turn_off'}]}]},{delay:'00:00:05'}]};const r=preview(a,{states});assert.deepEqual(r.proposedActions.map(x=>x.service),['light.turn_on']);assert.equal(r.executedServices,0)});
test('if else and override',()=>{const a={actions:[{if:[{condition:'state',entity_id:'input_boolean.override',state:'off'}],then:[{action:'light.turn_on'}],else:[{action:'light.turn_off'}]}]};assert.equal(preview(a,{states}).proposedActions[0].service,'light.turn_on')});
test('unsupported parallel rejects rather than guessing',()=>assert.throws(()=>preview({actions:[{parallel:[[{action:'light.turn_on'}]]}]},{states}),/Unsupported/));
test('missing sensor fails closed',()=>assert.throws(()=>preview({conditions:[{condition:'state',entity_id:'sensor.missing',state:'on'}],actions:[]},{states}),/Missing state/));
test('stop prevents later service',()=>assert.equal(preview({actions:[{stop:'done'},{action:'light.turn_on'}]},{states}).proposedActions.length,0));

test('preflight rejects unsupported late action before any preview',()=>{
 const a={actions:[{action:'light.turn_on'},{parallel:[[{action:'light.turn_off'}]]}]};
 assert.throws(()=>preview(a,{states}),/Unsupported/);
});
test('preflight rejects unknown metadata that would alter semantics',()=>{
 assert.throws(()=>preview({actions:[{action:'light.turn_on',continue_on_error:true}]},{states}),/Unsupported/);
});
test('valid fixed delay remains supported',()=>{
 const r=preview({actions:[{delay:'00:00:15'},{action:'light.turn_on'}]},{states});
 assert.equal(r.proposedActions[0].atSeconds,15);
});
