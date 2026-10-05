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

test('Rodin humanoids keep their texture detail within the mobile crowd budget',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/characters/character-data.js'),'utf8'),context);
 for(const name of ['medic','stalker']){
  const m=context.window.SwarmCharacterData[name];
  assert.equal(m.frames,24);assert(m.triangles<=3000);assert(m.vertices<4000);
  assert.match(m.texture,/^data:image\/jpeg;base64,/);
  const atlas=Buffer.from(m.texture.split(',')[1],'base64');assert.equal(atlas.readUInt16BE(0),0xffd8);assert(atlas.length<500000);
  const bytes=Buffer.from(m.uvs,'base64'),uvs=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4);
  assert.equal(uvs.length,m.vertices*2);assert([...uvs].every(v=>Number.isFinite(v)&&v>=-.001&&v<=1.001));
  const positionsBytes=Buffer.from(m.positions,'base64'),p=new Int16Array(positionsBytes.buffer,positionsBytes.byteOffset,positionsBytes.length/2);
  const stride=m.vertices*3,deltas=[];
  for(let f=0;f<m.frames;f++){
   let movement=0;for(let v=0;v<stride;v++)movement+=Math.abs(p[f*stride+v]-p[((f+1)%m.frames)*stride+v]);deltas.push(movement);
  }
  const average=deltas.reduce((a,b)=>a+b)/deltas.length;
  assert(deltas.at(-1)<average*1.8,`${name} must wrap its run without a sudden pose jump`);
  const glb=fs.readFileSync(path.join(__dirname,`../assets/characters/${name}.glb`)),json=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());
  assert(json.skins?.some(s=>s.joints.length>=15));assert(json.animations?.some(a=>a.name==='Run'));
 }
});
