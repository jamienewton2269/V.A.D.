const {test}=require('node:test');const assert=require('node:assert/strict');const g=require('../frontend/guidance.js');
test('experience changes guidance',()=>{let r={};assert.equal(g.level(r),'full');for(let i=0;i<2;i++)r=g.complete(r);assert.equal(g.level(r),'concise');for(let i=0;i<3;i++)r=g.complete(r);assert.equal(g.level(r),'compact');assert.equal(g.level(g.preference(r,'full')),'full');});
test('minimize and restore',()=>{assert.equal(g.level(g.preference({},'compact')),'compact');assert.equal(g.level(g.preference({},'auto')),'full')});
