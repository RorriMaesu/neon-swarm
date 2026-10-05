'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
test('real character exports contain authored motion and valid bounded geometry',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/characters/character-data.js'),'utf8'),context);
 const models=context.window.SwarmCharacterData;assert.equal(Object.keys(models).length,4);
 for(const [name,m]of Object.entries(models)){
  const bytes=Buffer.from(m.positions,'base64'),positions=new Int16Array(bytes.buffer,bytes.byteOffset,bytes.length/2);
  assert.equal(positions.length,m.vertices*m.frames*3);assert(m.vertices<4000);assert(m.frames>=16);
  let motion=0;for(let i=0;i<m.vertices*3;i++)motion+=Math.abs(positions[i]-positions[i+m.vertices*3]);assert(motion>1000,`${name} must have real animated deformation`);
  const indexBytes=Buffer.from(m.indices,'base64'),indices=new Uint16Array(indexBytes.buffer,indexBytes.byteOffset,indexBytes.length/2);assert(indices.length%3===0);assert([...indices].every(i=>i<m.vertices));
  const glb=fs.readFileSync(path.join(__dirname,`../assets/characters/${name}.glb`));assert.equal(glb.readUInt32LE(0),0x46546c67);assert.equal(glb.readUInt32LE(4),2);assert.equal(glb.readUInt32LE(8),glb.length);
  const json=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());assert(json.animations.length>0);assert(json.meshes.length>0);
 }
});
