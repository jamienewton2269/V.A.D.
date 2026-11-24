const {test}=require('node:test');const assert=require('node:assert/strict');const {parse}=require('../frontend/file-parser.js');
test('JSON automation parses without dependency',()=>assert.deepEqual(parse('{"actions":[]}','automation.json'),{actions:[]}));
test('YAML import fails explicitly when parser missing',()=>assert.throws(()=>parse('actions: []','automation.yaml'),/parser unavailable/));
test('YAML parser called with restricted JSON schema',()=>{let options;const mock={JSON_SCHEMA:{},load(text,o){options=o;return {actions:[]}}};assert.deepEqual(parse('actions: []','automation.yml',mock),{actions:[]});assert.equal(options.schema,mock.JSON_SCHEMA)});
test('YAML malformed file rejection propagates',()=>assert.throws(()=>parse('!include secrets.yaml','automation.yaml',{JSON_SCHEMA:{},load(){throw Error('unknown tag')}}),/unknown tag/));
test('rejects oversized input',()=>assert.throws(()=>parse('x'.repeat(1024*1024+1),'a.json'),/too large/));

const yaml=require('../frontend/js-yaml.min.js');
test('real bundled YAML parser imports native automation',()=>{
 const a=parse('alias: Dusk\ntriggers:\n  - trigger: sun\n    event: sunset\nactions:\n  - action: light.turn_on\n','a.yaml',yaml);
 assert.equal(a.triggers[0].event,'sunset');assert.equal(a.actions[0].action,'light.turn_on');
});
test('real bundled parser refuses unknown tags',()=>assert.throws(()=>parse('actions: []\nsecret: !secret password','a.yaml',yaml)));
test('real bundled parser rejects duplicate keys',()=>assert.throws(()=>parse('actions: []\nactions: []','a.yaml',yaml)));

test('rejects cyclic aliases',()=>assert.throws(()=>parse('actions: &a [*a]','a.yaml',yaml),/Cyclic/));
test('rejects unsafe mapping keys',()=>assert.throws(()=>parse('actions: []\nconstructor: bad','a.yaml',yaml),/Unsafe/));
test('rejects excessive nesting',()=>assert.throws(()=>parse('actions: '+ '['.repeat(70)+'0'+']'.repeat(70),'a.yaml',yaml),/limits/));
