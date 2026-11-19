const {test}=require('node:test');const assert=require('node:assert/strict');const {analyze}=require('../frontend/graph-analysis.js');
const n=id=>({id,type:'action',label:id,x:0,y:0});
test('valid connected graph',()=>{const r=analyze({nodes:[n('a'),n('b')],edges:[{from:'a',to:'b'}]});assert.equal(r.valid,true);assert.deepEqual(r.roots,['a'])});
test('detects cycle',()=>{const r=analyze({nodes:[n('a'),n('b')],edges:[{from:'a',to:'b'},{from:'b',to:'a'}]});assert.equal(r.valid,false);assert.ok(r.issues.some(x=>x.includes('Cycle')))});
test('detects missing endpoint',()=>assert.ok(analyze({nodes:[n('a')],edges:[{from:'a',to:'missing'}]}).issues.some(x=>x.includes('missing node'))));
test('detects duplicate edges',()=>assert.ok(analyze({nodes:[n('a'),n('b')],edges:[{from:'a',to:'b'},{from:'a',to:'b'}]}).issues.some(x=>x.includes('Duplicate'))));
test('reports source lock',()=>assert.equal(analyze({nodes:[],edges:[],source:{readOnly:true}}).readOnlySource,true));
