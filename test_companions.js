const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');const code=html.slice(html.indexOf('function petProfiles()'),html.indexOf('function studio12()'));
const c=vm.createContext({s:{pet:'fox',petXp:30,petCare:'2026-11-24'},catalog:[['fox',0,0,0,'pet'],['cat',0,0,0,'pet']],purchase(id){if(this.fail)return;},render(){},save(){}});
vm.runInContext(`purchase=function(id){if(id!==s.pet){s.pet=id;s.petXp=0}};function care(){s.petXp+=15;s.petCare='2026-11-25'};${code}`,c);
vm.runInContext("purchase('cat');care();purchase('fox')",c);assert.equal(c.s.petXp,30);assert.equal(c.s.petCare,'2026-11-24');vm.runInContext("purchase('cat')",c);assert.equal(c.s.petXp,15);assert.equal(c.s.petCare,'2026-11-25');console.log('PASS: individual companion progress and legacy migration');
