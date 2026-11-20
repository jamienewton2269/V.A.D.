const {test}=require('node:test');const assert=require('node:assert/strict');const {parse}=require('../frontend/file-parser.js');
test('JSON automation parses without dependency',()=>assert.deepEqual(parse('{"actions":[]}','automation.json'),{actions:[]}));
test('YAML import fails explicitly when parser missing',()=>assert.throws(()=>parse('actions: []','automation.yaml'),/parser unavailable/));
test('YAML parser called with restricted JSON schema',()=>{let options;const mock={JSON_SCHEMA:{},load(text,o){options=o;return {actions:[]}}};assert.deepEqual(parse('actions: []','automation.yml',mock),{actions:[]});assert.equal(options.schema,mock.JSON_SCHEMA)});
test('YAML malformed file rejection propagates',()=>assert.throws(()=>parse('!include secrets.yaml','automation.yaml',{JSON_SCHEMA:{},load(){throw Error('unknown tag')}}),/unknown tag/));
test('rejects oversized input',()=>assert.throws(()=>parse('x'.repeat(1024*1024+1),'a.json'),/too large/));
