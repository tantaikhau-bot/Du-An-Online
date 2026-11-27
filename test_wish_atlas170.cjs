const assert=require('node:assert/strict'),P=require('./assets/game-policy.js');
assert.equal(P.WW_ATLAS170.length,11);assert.equal(new Set(P.WW_ATLAS170.map(q=>q.id)).size,11);
for(const q of P.WW_ATLAS170){assert.ok(P.insideWorld137(q.x,q.z));assert.equal(!!P.atlasDestination170(q.id),q.state!=='planned');const a=P.atlasMap170(q.x,q.z);assert.ok(a.x>=0&&a.x<=660&&a.y>=0&&a.y<=660)}
assert.equal(P.atlasDestination170('wish').state,'open');assert.equal(P.atlasDestination170('blossom').state,'open');assert.equal(P.atlasDestination170('heaven'),null);
console.log('V17.0 atlas coordinates and staged realm gates passed');

const B=P.BLOSSOM173;assert.ok(P.blossomWeight173(B.x,B.z)>.99);assert.equal(P.blossomWeight173(0,0),0);assert.ok(P.blossomWaterBlocked173(B.pondX,B.pondZ));assert.ok(!P.blossomWaterBlocked173(B.arrivalX,B.arrivalZ));assert.ok(!P.blossomWaterBlocked173(B.pondX+6,B.pondZ));assert.equal(P.blossomTerrain173(0,0,2,1),2);assert.ok(P.blossomTerrain173(B.pondX,B.pondZ,2,1)<1);console.log('Blossom pond, arrival and terrain checks passed');

const I=P.ICE174;assert.equal(P.atlasDestination170('ice').state,'open');assert.ok(P.iceWeight174(I.x,I.z)>.99);assert.equal(P.iceWeight174(0,0),0);assert.equal(P.iceTerrain174(0,0,2),2);assert.ok(P.iceTerrain174(-102,-121,4)>8);assert.ok(P.iceReserved174(I.arrivalX,I.arrivalZ));assert.ok(P.iceReserved174(I.palaceX,I.palaceZ));for(let x=-120;x<=120;x+=3)for(let z=-136;z<=136;z+=3)assert.ok(Number.isFinite(P.iceTerrain174(x,z,3)));console.log('Frost terrain and atlas checks passed');