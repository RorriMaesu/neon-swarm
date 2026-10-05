import bpy, json, base64, array, math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/characters'
OUT.mkdir(parents=True,exist_ok=True)
specs=[('medic','Mech.gltf','Run',1.3,.42),('drone','Enemy_Small.gltf','Fast_Flying',1.1,1),('stalker','Enemy_Large.gltf','Run',1.55,.55),('spitter','Enemy_Flying.gltf','Fast_Flying',1.3,.7)]
encoded={}
def pack(code,values): return base64.b64encode(array.array(code,values).tobytes()).decode()
for name,source,clip,height,ratio in specs:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/characters/sources'/source))
 armatures=[o for o in bpy.data.objects if o.type=='ARMATURE']
 actions=list(bpy.data.actions)
 action=next(a for a in actions if a.name==clip or a.name.endswith('_'+clip) or a.name.startswith(clip))
 for arm in armatures:
  arm.animation_data_create(); arm.animation_data.action=action
  for track in arm.animation_data.nla_tracks: track.mute=True
 meshes=[o for o in bpy.data.objects if o.type=='MESH']
 for obj in meshes:
  if ratio<1:
   mod=obj.modifiers.new('Mobile topology','DECIMATE');mod.ratio=ratio
   bpy.context.view_layer.objects.active=obj
   bpy.ops.object.modifier_move_up(modifier=mod.name)
   bpy.ops.object.modifier_apply(modifier=mod.name)
 start,end=action.frame_range; frames=16
 bpy.context.scene.frame_set(round(start))
 deps=bpy.context.evaluated_depsgraph_get()
 # Consistent evaluated topology, UV seams retained by glTF importer.
 vertices=[]; norms=[]; colors=[]; indices=[]; meshes_info=[]
 for obj in meshes:
  ev=obj.evaluated_get(deps); mesh=ev.to_mesh(); mesh.calc_loop_triangles()
  offset=len(vertices); vertices.extend([ev.matrix_world@v.co for v in mesh.vertices])
  image=next(iter(bpy.data.images),None)
  uv=mesh.uv_layers.active
  sampled={}
  for poly in mesh.polygons:
   material=obj.material_slots[poly.material_index].material if obj.material_slots else None
   nodes=material.node_tree.nodes if material and material.use_nodes else []
   tex=next((n.image for n in nodes if n.type=='TEX_IMAGE' and n.image),None)
   pixels=list(tex.pixels) if tex else None
   base=next((n.inputs['Base Color'].default_value[:3] for n in nodes if n.type=='BSDF_PRINCIPLED'),(.7,.7,.7))
   for li in poly.loop_indices:
    vi=mesh.loops[li].vertex_index
    if vi in sampled:continue
    c=base
    if tex and uv:
     u,v=uv.data[li].uv; ix=min(tex.size[0]-1,max(0,int(u*tex.size[0])));iy=min(tex.size[1]-1,max(0,int(v*tex.size[1])))
     c=pixels[(iy*tex.size[0]+ix)*4:][:3]
    sampled[vi]=c
  for vi in range(len(mesh.vertices)):colors.extend(round(max(0,min(1,c))*255) for c in sampled.get(vi,(.7,.7,.7)))
  for tri in mesh.loop_triangles:indices.extend(offset+vi for vi in tri.vertices)
  meshes_info.append((obj,len(mesh.vertices)))
  ev.to_mesh_clear()
 bottom=min(v.z for v in vertices); top=max(v.z for v in vertices); scale=height/(top-bottom)
 centerX=(min(v.x for v in vertices)+max(v.x for v in vertices))/2
 centerY=(min(v.y for v in vertices)+max(v.y for v in vertices))/2
 positions=[]; normals=[]
 for frame in range(frames):
  f=start+(end-start)*frame/frames; bpy.context.scene.frame_set(int(f),subframe=f-int(f));deps=bpy.context.evaluated_depsgraph_get()
  for obj,count in meshes_info:
   ev=obj.evaluated_get(deps);mesh=ev.to_mesh(); assert len(mesh.vertices)==count
   normalMatrix=ev.matrix_world.to_3x3().inverted().transposed()
   for vertex in mesh.vertices:
    v=ev.matrix_world@vertex.co; n=(normalMatrix@vertex.normal).normalized()
    positions.extend(round(c*4096) for c in ((v.x-centerX)*scale,(v.z-bottom)*scale,-(v.y-centerY)*scale))
    normals.extend(round(c*32767) for c in (n.x,n.z,-n.y))
   ev.to_mesh_clear()
 encoded[name]={'source':source,'clip':clip,'frames':frames,'duration':float((end-start)/bpy.context.scene.render.fps),'vertices':len(vertices),'positions':pack('h',positions),'normals':pack('h',normals),'colors':pack('B',colors),'indices':pack('H',indices)}
 # Preserve a standard editable/exportable rigged GLB alongside the runtime bake.
 bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',export_animations=True)
 print('BAKED',name,len(vertices),len(indices)//3,encoded[name]['duration'])
(OUT/'character-data.js').write_text('/* Quaternius CC0 models; authored skeletal animations baked with Blender. */\nwindow.SwarmCharacterData='+json.dumps(encoded,separators=(',',':'))+';\n')
(OUT/'manifest.json').write_text(json.dumps({k:{x:y for x,y in v.items() if x not in ['positions','normals','colors','indices']} for k,v in encoded.items()},indent=2))
