"""Create an editable biped and in-place run for the two Rodin robots.

Blender --background --python tools/rig_rodin.py -- medic|stalker
Joint landmarks are normalized to each inspected mesh's height. No online
rigging service or credentials are needed to recreate the animation.
"""
import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector, Quaternion

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/characters/rodin'
name = sys.argv[sys.argv.index('--') + 1]
asset = 'guardian' if name == 'medic' else 'stalker'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(OUT / (asset+'-original') / 'base_basic_pbr.glb'))
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
points = [obj.matrix_world @ v.co for obj in meshes for v in obj.data.vertices]
low = Vector([min(p[i] for p in points) for i in range(3)])
high = Vector([max(p[i] for p in points) for i in range(3)])
height = high.z - low.z
center = Vector(((low.x+high.x)/2, (low.y+high.y)/2, low.z))
for obj in meshes:
    for v in obj.data.vertices:
        v.co = (obj.matrix_world @ v.co - center) / height
    obj.matrix_world.identity()
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    # The export splits vertices at UV boundaries. Weld the surface before
    # reducing it, retaining per-corner UVs so armor panels stay connected.
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=.00001)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.data.calc_loop_triangles()
    triangles = len(obj.data.loop_triangles)
    decimate = obj.modifiers.new('Mobile crowd topology', 'DECIMATE')
    decimate.ratio = min(1, 2700 / triangles)
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    for poly in obj.data.polygons:
        poly.use_smooth = True

armature = bpy.data.armatures.new('Rescue biped' if name == 'medic' else 'Pursuer biped')
rig = bpy.data.objects.new(name+'-rig', armature)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
landmarks = {}
def bone(label, head, tail, parent=None):
    b = armature.edit_bones.new(label)
    b.head, b.tail = head, tail
    b.align_roll(Vector((0, -1, 0)))
    if parent:
        b.parent = armature.edit_bones[parent]
    landmarks[label] = (Vector(head), Vector(tail), parent)
    return b

bone('pelvis', (0,0,.47), (0,0,.57))
bone('spine', (0,0,.57), (0,0,.70), 'pelvis')
bone('chest', (0,0,.70), (0,0,.81), 'spine')
bone('neck', (0,0,.81), (0,0,.86), 'chest')
bone('head', (0,0,.86), (0,0,.98), 'neck')
for sign, side in [(1,'L'), (-1,'R')]:
    # Guardian has a lower A-pose; stalker's forearms reach farther sideways.
    shoulder = (sign*.14, 0, .78)
    elbow = (sign*(.25 if name=='medic' else .23), 0, .65)
    wrist = (sign*(.35 if name=='medic' else .37), -.005, .54 if name=='medic' else .60)
    hand = (sign*(.42 if name=='medic' else .46), -.01, .48 if name=='medic' else .54)
    hip, knee, ankle = (sign*.075,0,.51), (sign*.095,0,.30), (sign*.11,.01,.08)
    bone('upper_arm.'+side, shoulder, elbow, 'chest')
    bone('forearm.'+side, elbow, wrist, 'upper_arm.'+side)
    bone('hand.'+side, wrist, hand, 'forearm.'+side)
    bone('thigh.'+side, hip, knee, 'pelvis')
    bone('shin.'+side, knee, ankle, 'thigh.'+side)
    bone('foot.'+side, ankle, (sign*.11,-.095,.035), 'shin.'+side)
bpy.ops.object.mode_set(mode='OBJECT')

def distance(point, a, b):
    ab = b-a
    t = max(0, min(1, (point-a).dot(ab)/ab.length_squared))
    return (point-a-ab*t).length

for obj in meshes:
    groups = {label: obj.vertex_groups.new(name=label) for label in landmarks}
    for vertex in obj.data.vertices:
        ranked = sorted((distance(vertex.co,a,b),label,parent) for label,(a,b,parent) in landmarks.items())
        d1, first, parent1 = ranked[0]
        d2, second, parent2 = ranked[1]
        related = parent1 == second or parent2 == first
        if related and d2 < d1 + .075:
            q1, q2 = (d1+.015)**-5, (d2+.015)**-5
            groups[first].add([vertex.index], q1/(q1+q2), 'REPLACE')
            groups[second].add([vertex.index], q2/(q1+q2), 'REPLACE')
        else:
            groups[first].add([vertex.index], 1, 'REPLACE')
    mod = obj.modifiers.new('Authored skeletal locomotion', 'ARMATURE')
    mod.object = rig
    obj.parent = rig

scene = bpy.context.scene
scene.render.fps = 30 if name == 'medic' else 34
scene.frame_start, scene.frame_end = 1, 25
rig.animation_data_create()
action = bpy.data.actions.new('Run')
rig.animation_data.action = action
for pb in rig.pose.bones:
    pb.rotation_mode = 'QUATERNION'

def rotate_world(label, angle, axis=(1,0,0), extra=None):
    pb = rig.pose.bones[label]
    rest = pb.bone.matrix_local.to_quaternion()
    rotation = Quaternion(Vector(axis), angle)
    if extra:
        rotation = rotation @ extra
    pb.rotation_quaternion = rest.inverted() @ rotation @ rest

for frame in range(1,26):
    phase = (frame-1)/24*math.tau
    for pb in rig.pose.bones:
        pb.rotation_quaternion = Quaternion()
        pb.location = (0,0,0)
    # Two footfalls, gentle counter-rotation and a stable head.
    rig.pose.bones['pelvis'].location = (0, .024*(1-math.cos(phase*2)), 0)
    rotate_world('pelvis', .045*math.sin(phase), (0,0,1))
    rotate_world('spine', .10 if name == 'stalker' else .04)
    rotate_world('chest', -.06*math.sin(phase), (0,0,1))
    rotate_world('head', -.035*math.sin(phase), (0,0,1))
    for sign, side in [(1,'L'),(-1,'R')]:
        stride = math.sin(phase+(0 if sign==1 else math.pi))
        rotate_world('thigh.'+side, .58*stride)
        rotate_world('shin.'+side, -.18-.86*max(0,-stride))
        rotate_world('foot.'+side, .15+.18*max(0,-stride))
        a,b,_ = landmarks['upper_arm.'+side]
        down = Vector((sign*.06,0,-1)).normalized()
        correction = (b-a).normalized().rotation_difference(down)
        rotate_world('upper_arm.'+side, -.45*stride, extra=correction)
        # Bend the arm in its corrected rest space, with a modest pumping action.
        rotate_world('forearm.'+side, .90+.12*stride)
    for pb in rig.pose.bones:
        pb.keyframe_insert(data_path='rotation_quaternion', frame=frame)
        pb.keyframe_insert(data_path='location', frame=frame)
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / (name+'-rigged.blend')))
bpy.ops.object.select_all(action='DESELECT')
for obj in meshes + [rig]:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT / (name+'-preview.glb')), export_format='GLB', use_selection=True, export_animations=True)
print('RODIN_RIGGED', name, sum(len(o.data.vertices) for o in meshes), len(landmarks))
