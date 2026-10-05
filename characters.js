/* Animated mesh crowds. Real skeletal clips baked to vertex textures by Blender. */
(function(root){
 'use strict';
 const cache=new Map();
 function decode(text,Type){const bytes=Uint8Array.from(atob(text),c=>c.charCodeAt(0));return new Type(bytes.buffer);}
 function model(name,T){
  if(cache.has(name))return cache.get(name);
  const data=root.SwarmCharacterData?.[name];if(!data)throw Error('Character assets are missing. Keep the assets folder beside the game.');
  const p=decode(data.positions,Int16Array),n=decode(data.normals,Int16Array),colors=decode(data.colors,Uint8Array),indices=decode(data.indices,Uint16Array);
  const width=1024,rows=Math.ceil(data.vertices/width),height=rows*data.frames;
  const positions=new Float32Array(width*height*4),normals=new Float32Array(positions.length);
  for(let f=0;f<data.frames;f++)for(let v=0;v<data.vertices;v++)for(let c=0;c<3;c++){
   positions[(f*rows*width+v)*4+c]=p[(f*data.vertices+v)*3+c]/4096;
   normals[(f*rows*width+v)*4+c]=n[(f*data.vertices+v)*3+c]/32767;
  }
  function texture(array){const t=new T.DataTexture(array,width,height,T.RGBAFormat,T.FloatType);t.minFilter=t.magFilter=T.NearestFilter;t.needsUpdate=true;return t;}
  const geometry=new T.BufferGeometry(),base=new Float32Array(data.vertices*3),normal=new Float32Array(base.length),color=new Float32Array(base.length),vertex=new Float32Array(data.vertices);
  for(let v=0;v<data.vertices;v++){vertex[v]=v;for(let c=0;c<3;c++){base[v*3+c]=p[v*3+c]/4096;normal[v*3+c]=n[v*3+c]/32767;color[v*3+c]=colors[v*3+c]/255;}}
  geometry.setAttribute('position',new T.BufferAttribute(base,3));geometry.setAttribute('normal',new T.BufferAttribute(normal,3));geometry.setAttribute('color',new T.BufferAttribute(color,3));geometry.setAttribute('animVertex',new T.BufferAttribute(vertex,1));geometry.setIndex(new T.BufferAttribute(indices,1));
  const value={geometry,positionTexture:texture(positions),normalTexture:texture(normals),data,width,height,rows};cache.set(name,value);return value;
 }
 class AnimatedCrowd{
  constructor(scene,name,max,tint=0xffffff){
   const T=root.THREE;this.T=T;this.model=model(name,T);this.max=max;this.name=name;
   const m=this.model,geometry=m.geometry.clone();this.phase=new T.InstancedBufferAttribute(new Float32Array(max),1);this.rate=new T.InstancedBufferAttribute(new Float32Array(max),1);geometry.setAttribute('animPhase',this.phase);geometry.setAttribute('animRate',this.rate);
   this.material=new T.MeshStandardMaterial({vertexColors:true,color:tint,roughness:.65,metalness:.12});this.uniforms={swarmTime:{value:0},poseMap:{value:m.positionTexture},normalMapPose:{value:m.normalTexture},poseSize:{value:new T.Vector2(m.width,m.height)},poseRows:{value:m.rows},poseFrames:{value:m.data.frames},poseDuration:{value:Math.max(.1,m.data.duration)}};
   this.material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,this.uniforms);
    shader.vertexShader=`uniform float swarmTime;uniform sampler2D poseMap;uniform sampler2D normalMapPose;uniform vec2 poseSize;uniform float poseRows;uniform float poseFrames;uniform float poseDuration;attribute float animVertex;attribute float animPhase;attribute float animRate;
     vec3 samplePose(sampler2D tex,float frame){float row=floor(animVertex/poseSize.x)+frame*poseRows;return texture2D(tex,vec2((mod(animVertex,poseSize.x)+.5)/poseSize.x,(row+.5)/poseSize.y)).xyz;}
     vec3 animated(sampler2D tex){float f=mod((swarmTime*animRate/poseDuration+animPhase)*poseFrames,poseFrames);return mix(samplePose(tex,floor(f)),samplePose(tex,mod(floor(f)+1.,poseFrames)),fract(f));}
    `+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal = normalize(animated(normalMapPose));').replace('#include <begin_vertex>','vec3 transformed = animated(poseMap);');
   };
   this.material.customProgramCacheKey=()=> 'swarm-animated-v1';
   this.mesh=new T.InstancedMesh(geometry,this.material,max);this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.mesh.frustumCulled=false;this.mesh.count=0;scene.add(this.mesh);this.dummy=new T.Object3D();this.color=new T.Color();
  }
  update(list,time,friendly=false){
   this.uniforms.swarmTime.value=time;this.mesh.count=Math.min(this.max,list.length);
   for(let i=0;i<this.mesh.count;i++){
    const p=list[i],d=this.dummy,scale=p.scale||(p.kind==='brute'?1.4:p.kind==='runner'?.75:1);
    d.position.set(p.x,p.y||0,p.z);d.rotation.set(0,friendly?Math.PI:0,0);d.scale.setScalar(scale);d.updateMatrix();this.mesh.setMatrixAt(i,d.matrix);
    this.phase.array[i]=((p.id??i)*.61803398875)%1;this.rate.array[i]=p.kind==='runner'?1.5:p.kind==='brute'?.72:1;
    this.mesh.setColorAt(i,this.color.set(p.kind==='brute'?0xffd08a:p.kind==='runner'?0xff9eac:0xffffff));
   }
   this.mesh.instanceMatrix.needsUpdate=true;this.phase.needsUpdate=true;this.rate.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;
  }
 }
 root.SwarmCharacters={AnimatedCrowd,manifest:()=>Object.fromEntries(Object.entries(root.SwarmCharacterData||{}).map(([id,m])=>[id,{vertices:m.vertices,frames:m.frames,clip:m.clip}]))};
})(window);
