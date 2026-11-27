const assert=require('node:assert/strict'),P=require('./assets/game-policy.js');
assert.equal(P.WW_ATLAS170.length,11);assert.equal(new Set(P.WW_ATLAS170.map(q=>q.id)).size,11);
for(const q of P.WW_ATLAS170){assert.ok(P.insideWorld137(q.x,q.z));assert.equal(!!P.atlasDestination170(q.id),q.state!=='planned');const a=P.atlasMap170(q.x,q.z);assert.ok(a.x>=0&&a.x<=660&&a.y>=0&&a.y<=660)}
assert.equal(P.atlasDestination170('wish').state,'open');assert.equal(P.atlasDestination170('blossom').state,'pilot');assert.equal(P.atlasDestination170('heaven'),null);
console.log('V17.0 atlas coordinates and staged realm gates passed');
