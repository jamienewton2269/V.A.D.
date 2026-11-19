const {test}=require('node:test');const assert=require('node:assert/strict');const p=require('../frontend/node-properties.js');
test('validates draft service properties',()=>assert.equal(p.update({type:'action',config:{}},'service','light.turn_on').config.service,'light.turn_on'));
test('rejects invalid service names',()=>assert.throws(()=>p.validate('action','service','light turn on')));
test('validates duration format',()=>{assert.equal(p.validate('timer','duration','01:02:03'),'01:02:03');assert.throws(()=>p.validate('timer','duration','99:99:99'))});
test('prevents changing imported HA node properties',()=>assert.throws(()=>p.update({type:'action',ha:{readOnly:true},config:{}},'service','light.turn_off')));
test('does not mutate original node',()=>{const node={type:'sensor',config:{entity_id:'sensor.a'}};const next=p.update(node,'entity_id','sensor.b');assert.equal(node.config.entity_id,'sensor.a');assert.equal(next.config.entity_id,'sensor.b')});
