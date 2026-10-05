"""Bake locally rigged Rodin characters without changing the flying creatures.

Run after rig_rodin.py with Blender --background --python tools/bake_rodin.py.
Texture maps are embedded in the runtime data so the Desktop game works offline.
"""
import array
import base64
import json
import bpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/characters'

def pack(code, values):
    return base64.b64encode(array.array(code, values).tobytes()).decode()

existing = (OUT / 'character-data.js').read_text(encoding='utf-8')
encoded = json.loads(existing.split('window.SwarmCharacterData=', 1)[1].rstrip(';\n\r '))
for name, height in [('medic', 1.3), ('stalker', 1.55)]:
    bpy.ops.wm.open_mainfile(filepath=str(OUT / 'rodin' / (name + '-rigged.blend')))
    scene = bpy.context.scene
    start, end, frames = 1, 25, 24
    scene.frame_set(start)
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    deps = bpy.context.evaluated_depsgraph_get()
    maps, vertices, indices, uvs = [], [], [], []
    texture = None
    for obj in meshes:
        evaluated = obj.evaluated_get(deps)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        uv = mesh.uv_layers.active
        if not uv:
            raise RuntimeError('Rodin character has no UV coordinates')
        lookup, local = {}, []
        for tri in mesh.loop_triangles:
            for li in tri.loops:
                vi, coord = mesh.loops[li].vertex_index, uv.data[li].uv
                key = (vi, round(coord.x, 6), round(coord.y, 6))
                if key not in lookup:
                    lookup[key] = len(vertices)
                    local.append(vi)
                    vertices.append(evaluated.matrix_world @ mesh.vertices[vi].co)
                    uvs.extend(coord)
                indices.append(lookup[key])
        maps.append((obj, local, len(mesh.vertices)))
        for slot in obj.material_slots:
            mat = slot.material
            if not mat or not mat.use_nodes:
                continue
            bsdf = next((n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
            if bsdf and bsdf.inputs['Base Color'].is_linked:
                node = bsdf.inputs['Base Color'].links[0].from_node
                if node.type == 'TEX_IMAGE':
                    if texture and texture != node.image:
                        raise RuntimeError('This crowd bake requires one shared base-color atlas')
                    texture = node.image
        evaluated.to_mesh_clear()
    if len(vertices) >= 4000:
        raise RuntimeError(f'{name} exceeds mobile vertex budget: {len(vertices)}')
    bottom, top = min(v.z for v in vertices), max(v.z for v in vertices)
    factor = height / (top - bottom)
    cx = (min(v.x for v in vertices) + max(v.x for v in vertices)) / 2
    cy = (min(v.y for v in vertices) + max(v.y for v in vertices)) / 2
    positions, normals = [], []
    for frame in range(frames):
        scene.frame_set(start + frame)
        deps = bpy.context.evaluated_depsgraph_get()
        for obj, local, count in maps:
            evaluated = obj.evaluated_get(deps)
            mesh = evaluated.to_mesh()
            assert len(mesh.vertices) == count
            matrix = evaluated.matrix_world.to_3x3().inverted().transposed()
            for vi in local:
                vertex = mesh.vertices[vi]
                v = evaluated.matrix_world @ vertex.co
                n = (matrix @ vertex.normal).normalized()
                positions.extend(round(c * 4096) for c in ((v.x-cx)*factor, (v.z-bottom)*factor, -(v.y-cy)*factor))
                normals.extend(round(c * 32767) for c in (n.x, n.z, -n.y))
            evaluated.to_mesh_clear()
    if not texture:
        raise RuntimeError('Missing base-color texture')
    texture.scale(1024, 1024)
    texture.file_format = 'JPEG'
    texture.filepath_raw = str(OUT / 'rodin' / (name + '-basecolor.jpg'))
    texture.save()
    encoded[name] = {
        'source': 'Hyper3D Rodin Gen-1.5 Zero', 'clip': 'Run', 'frames': frames,
        'duration': (end-start) / scene.render.fps, 'vertices': len(vertices),
        'positions': pack('h', positions), 'normals': pack('h', normals),
        'colors': pack('B', [255] * (len(vertices)*3)), 'indices': pack('H', indices),
        'uvs': pack('f', uvs), 'texture': 'data:image/jpeg;base64,' + base64.b64encode(Path(texture.filepath_raw).read_bytes()).decode(),
        'triangles': len(indices)//3,
    }
    # Retain the authored skeleton and animation as a standard interchange file.
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if obj.type in {'MESH', 'ARMATURE'}:
            obj.select_set(True)
    scene.frame_set(start)
    bpy.ops.export_scene.gltf(filepath=str(OUT / (name + '.glb')), export_format='GLB', use_selection=True, export_animations=True)
    print('RODIN_BAKED', name, len(vertices), len(indices)//3)

(OUT / 'character-data.js').write_text('/* Rodin humanoids rigged and animated locally; Quaternius CC0 flying creatures. */\nwindow.SwarmCharacterData=' + json.dumps(encoded, separators=(',', ':')) + ';\n', encoding='utf-8')
(OUT / 'manifest.json').write_text(json.dumps({k: {x: y for x, y in v.items() if x not in ['positions', 'normals', 'colors', 'indices', 'uvs', 'texture']} for k, v in encoded.items()}, indent=2) + '\n', encoding='utf-8')
