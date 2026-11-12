// Writes the HackAthlone 2026 OBS scene collection and profile.
//
//   node obs/setup-obs.mjs              write the files into obs/ (for Scene Collection > Import)
//   node obs/setup-obs.mjs --install    also install them into this computer's OBS settings (close OBS first)
//
// Options:
//   --encoder x264|nvenc|qsv|amd|apple_h264   video encoder (default x264; use a hardware one if the laptop has it)
//   --recordings <folder>                     where OBS saves recordings (default: Videos, or Movies on a Mac)
//   --stand-in <image>                        put a still image under the graphics, to test without a camera
//   --port <number>                           broadcast studio port (default 3131)
import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const install = args.includes('--install');
const port = Number(option('--port', process.env.PORT || 3131));
const encoder = option('--encoder', 'x264');
const standIn = option('--stand-in', '');
const recordings = option('--recordings', path.join(os.homedir(), process.platform === 'darwin' ? 'Movies' : 'Videos'));
const NAME = 'HackAthlone 2026', SLUG = 'HackAthlone_2026';
const exists = (file) => access(file).then(() => true, () => false);

// Stable IDs, so the file only changes when the setup changes.
const uuid = (name) => {
  const h = createHash('sha1').update('hackathlone-2026-obs:' + name).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const source = (name, id, settings) => ({
  prev_ver: 486604803, name, uuid: uuid(name), id, versioned_id: id, settings,
  mixers: id === 'scene' ? 0 : 255, sync: 0, flags: 0, volume: 1.0, balance: 0.5, enabled: true, muted: false,
  'push-to-mute': false, 'push-to-mute-delay': 0, 'push-to-talk': false, 'push-to-talk-delay': 0,
  hotkeys: {}, deinterlace_mode: 0, deinterlace_field_order: 0, monitoring_type: 0, private_settings: {},
});
// Every item fills the 1920 x 1080 canvas (scaled to fit, centred).
const scene = (name, sources) => source(name, 'scene', {
  custom_size: false,
  id_counter: sources.length,
  items: sources.map((s, i) => ({
    name: s.name, source_uuid: s.uuid, visible: true, locked: s.id === 'browser_source', rot: 0.0,
    pos: { x: 0.0, y: 0.0 }, scale: { x: 1.0, y: 1.0 }, align: 5, bounds_type: 2, bounds_align: 0,
    bounds: { x: 1920.0, y: 1080.0 }, crop_left: 0, crop_top: 0, crop_right: 0, crop_bottom: 0, id: i + 1,
    group_item_backup: false, scale_filter: 'disable', blend_method: 'default', blend_type: 'normal',
    show_transition: { duration: 0 }, hide_transition: { duration: 0 }, private_settings: {},
  })),
});

// The graphics: Mark's broadcast studio output, transparent, 2560 x 1440 scaled onto the canvas.
const graphics = source('HackAthlone graphics', 'browser_source', {
  url: `http://127.0.0.1:${port}/overlay`, width: 2560, height: 1440, fps_custom: false,
  shutdown: false, restart_when_active: false, reroute_audio: false,
});
const still = standIn ? source('Camera stand-in', 'image_source', { file: path.resolve(standIn).split(path.sep).join('/') }) : null;
const camera = scene('Camera', still ? [still, graphics] : [graphics]);
const slides = scene('Slides', [graphics]);

const collection = {
  current_scene: 'Camera', current_program_scene: 'Camera',
  scene_order: [{ name: 'Camera' }, { name: 'Slides' }],
  name: NAME,
  sources: [camera, slides, graphics, ...(still ? [still] : [])],
  groups: [],
  quick_transitions: [
    { name: 'Cut', duration: 300, hotkeys: [], id: 1, fade_to_black: false },
    { name: 'Fade', duration: 300, hotkeys: [], id: 2, fade_to_black: false },
    { name: 'Fade', duration: 300, hotkeys: [], id: 3, fade_to_black: true },
  ],
  transitions: [], saved_projectors: [], current_transition: 'Fade', transition_duration: 300,
  preview_locked: false, scaling_enabled: false, scaling_level: 0, scaling_off_x: 0.0, scaling_off_y: 0.0,
  'virtual-camera': { type: 0, internal: 0 },
  modules: {
    'scripts-tool': [],
    'output-timer': { streamTimerHours: 0, streamTimerMinutes: 0, streamTimerSeconds: 30, recordTimerHours: 0, recordTimerMinutes: 0, recordTimerSeconds: 30, autoStartStreamTimer: false, autoStartRecordTimer: false, pauseRecordTimer: true },
    'auto-scene-switcher': { interval: 300, non_matching_scene: '', switch_if_not_matching: false, active: false, switches: [] },
  },
};

// YouTube settings: 1080p at 30 fps, 6000 kbps, keyframes every 2 s (Simple mode default), RTMPS on port 443.
const profile = (recordingsFolder) => `[General]
Name=${NAME}

[Video]
BaseCX=1920
BaseCY=1080
OutputCX=1920
OutputCY=1080
FPSType=0
FPSCommon=30

[Audio]
SampleRate=48000
ChannelSetup=Stereo

[Output]
Mode=Simple
Reconnect=true
RetryDelay=2
MaxRetries=25

[SimpleOutput]
FilePath=${recordingsFolder}
RecFormat2=mkv
VBitrate=6000
ABitrate=160
UseAdvanced=false
Preset=veryfast
RecQuality=Stream
StreamEncoder=${encoder}
RecEncoder=${encoder}
StreamAudioEncoder=aac
RecAudioEncoder=aac
`;
const service = (key = '') => JSON.stringify({ settings: { bwtest: false, key, server: 'rtmps://a.rtmps.youtube.com:443/live2', service: 'YouTube - RTMPS' }, type: 'rtmp_common' }, null, 4);

// 1. Portable files in obs/ (never with a stream key or a stand-in image).
const portable = { ...collection, sources: [scene('Camera', [graphics]), slides, graphics] };
await writeFile(path.join(here, `${SLUG}.json`), JSON.stringify(portable, null, 4) + '\n');
await mkdir(path.join(here, SLUG), { recursive: true });
await writeFile(path.join(here, SLUG, 'basic.ini'), profile('').replace(/^FilePath=.*\n/m, ''));
await writeFile(path.join(here, SLUG, 'service.json'), service() + '\n');
console.log(`Wrote obs/${SLUG}.json (scene collection) and obs/${SLUG}/ (profile).`);

// 2. Optional install into this computer's OBS settings.
if (install) {
  const root = process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support', 'obs-studio')
    : process.platform === 'win32' ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'obs-studio')
    : path.join(os.homedir(), '.config', 'obs-studio');
  const scenesDir = path.join(root, 'basic', 'scenes'), profileDir = path.join(root, 'basic', 'profiles', SLUG);
  await mkdir(scenesDir, { recursive: true });
  await mkdir(profileDir, { recursive: true });
  await mkdir(recordings, { recursive: true });
  const target = path.join(scenesDir, `${SLUG}.json`);
  if (await exists(target)) await copyFile(target, target + '.before-setup');
  await writeFile(target, JSON.stringify(collection, null, 4) + '\n');
  await writeFile(path.join(profileDir, 'basic.ini'), profile(recordings.split(path.sep).join('/')));
  // Keep a stream key that is already there (it is never printed).
  let key = '';
  try { key = JSON.parse(await readFile(path.join(profileDir, 'service.json'), 'utf8')).settings?.key || ''; } catch {}
  await writeFile(path.join(profileDir, 'service.json'), service(key) + '\n');
  console.log(`Installed into ${root}: scene collection "${NAME}" and profile "${NAME}"${key ? ' (stream key kept)' : ''}.`);
  console.log(`In OBS pick Profile > ${NAME} and Scene Collection > ${NAME}.`);
}
