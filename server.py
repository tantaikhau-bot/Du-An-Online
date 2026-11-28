import social, admin, economy, beta, friendship, festival, referral, royal, payment, save_guard, verified_rewards, runtime_guard, dungeon
from static_files import serve_static
from http_assets import accepts_gzip as accepts_gzip230
from urllib.parse import urlsplit
from urllib.request import urlopen, Request
import struct
import gzip
from functools import lru_cache
import threading, ipaddress
from contextlib import contextmanager
import os, sqlite3, json, hashlib, secrets, hmac, time, re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
ROOT=Path(__file__).resolve().parent
# Fixed, licensed upstream asset; never accept a caller-supplied URL.
HORSE_URL148='https://vinish-models.pages.dev/horses/western-horse.glb'
_horse_lock148=threading.Lock()
_horse_data148=None
_horse_retry148=0
def horse_asset148():
 global _horse_data148,_horse_retry148
 if _horse_data148 is not None:return _horse_data148
 if time.monotonic()<_horse_retry148 or not _horse_lock148.acquire(blocking=False):return None
 try:
  if _horse_data148 is not None:return _horse_data148
  with urlopen(Request(HORSE_URL148,headers={'User-Agent':'WishWorld/14.8'}),timeout=12) as response:
   data=response.read(9*1024*1024+1)
  if len(data)<20 or len(data)>9*1024*1024:raise ValueError('invalid asset size')
  magic,version,total,n,kind=struct.unpack_from('<4sIIII',data)
  if magic!=b'glTF' or version!=2 or total!=len(data) or kind!=0x4e4f534a or n>len(data)-20:raise ValueError('invalid GLB')
  meta=json.loads(data[20:20+n].decode('utf-8'))
  clips={a.get('name','').lower() for a in meta.get('animations',[])}
  if not {'idle','walk','trot','gallop'}<=clips:raise ValueError('missing animation')
  if not meta.get('skins'):raise ValueError('missing skin')
  _horse_data148=data
  return data
 except Exception as e:
  print('horse asset unavailable:',type(e).__name__,str(e)[:140],flush=True)
  _horse_retry148=time.monotonic()+30
  return None
 finally:_horse_lock148.release()

# V15.5: fixed CC0 audio allowlist; bounded memory, no caller-selected URLs.
AUDIO151={"day":"https://opengameart.org/sites/default/files/SunsetWalk.ogg","forest":"https://opengameart.org/sites/default/files/iremos_forest_in_game.ogg","night":"https://opengameart.org/sites/default/files/whispers_in_the_fog.ogg","battle":"https://opengameart.org/sites/default/files/fairy_battles_bpm180_0.ogg","river":"https://opengameart.org/sites/default/files/waterflow.mp3","hoofGrass":"https://sfxmint.com/dl/animal-horse-gallop-09.mp3","hoofStone":"https://sfxmint.com/dl/animal-horse-gallop-07.mp3","grass":"https://sfxmint.com/dl/footsteps-single-01.mp3","stone":"https://sfxmint.com/dl/footsteps-single-15.mp3","wood":"https://sfxmint.com/dl/footsteps-single-21.mp3","rain":"https://sfxmint.com/dl/ambience-rain-67.mp3","birds":"https://sfxmint.com/dl/ambience-forest-54.mp3","strike":"https://sfxmint.com/dl/sword-clash-12.mp3","cat":"https://sfxmint.com/dl/animal-cat-meow-41.mp3"}
_audio_cache151={}
_audio_retry151={}
_audio_lock151=threading.Lock()
_audio_slots151=threading.BoundedSemaphore(2)
def audio_asset151(key):
 url=AUDIO151.get(key)
 if not url:return None
 with _audio_lock151:
  if key in _audio_cache151:return _audio_cache151[key]
  if time.monotonic()<_audio_retry151.get(key,0):return None
  if not _audio_slots151.acquire(blocking=False):return None
  _audio_retry151[key]=time.monotonic()+20
 try:
  with urlopen(Request(url,headers={'User-Agent':'WishWorld/15.1'}),timeout=10) as response:
   data=response.read(5*1024*1024+1)
  if len(data)<128 or len(data)>5*1024*1024:raise ValueError('size')
  ogg=url.endswith('.ogg')
  if ogg and data[:4]!=b'OggS':raise ValueError('invalid ogg')
  if not ogg and not (data[:3]==b'ID3' or (data[0]==255 and data[1]&224==224)):raise ValueError('invalid mp3')
  result=(data,'audio/ogg' if ogg else 'audio/mpeg')
  with _audio_lock151:
   while _audio_cache151 and sum(len(x[0]) for x in _audio_cache151.values())+len(data)>14*1024*1024:_audio_cache151.pop(next(iter(_audio_cache151)))
   _audio_cache151[key]=result
  return result
 except Exception as e:
  print('audio151',key,type(e).__name__,str(e)[:100],flush=True)
  return None
 finally:_audio_slots151.release()

# V20.3: pinned CC0 assets, fixed allowlist and bounded download/cache.
NATURE203={'cottage':'https://tevy.dev/models/timber-frame-house/v1/lod1.glb','cottage-lite':'https://tevy.dev/models/timber-frame-house/v1/lod2.glb','woodhouse':'https://tevy.dev/models/village-house/v2/lod1.glb','woodhouse-lite':'https://tevy.dev/models/village-house/v2/lod2.glb','lantern':'https://tevy.dev/models/storm-lantern/v1/lod1.glb','lantern-lite':'https://tevy.dev/models/storm-lantern/v1/lod2.glb','cliff':'https://tevy.dev/models/cliff-face/v1/lod1.glb','cliff-lite':'https://tevy.dev/models/cliff-face/v1/lod2.glb','boulder':'https://tevy.dev/models/granite-boulder/v1/lod1.glb','boulder-lite':'https://tevy.dev/models/granite-boulder/v1/lod2.glb','grass':'https://tevy.dev/models/grass-clump/v1/lod1.glb','grass-lite':'https://tevy.dev/models/grass-clump/v1/lod2.glb','fern':'https://tevy.dev/models/male-fern/v1/lod2.glb','fern-lite':'https://tevy.dev/models/male-fern/v1/lod2.glb','flowers':'https://tevy.dev/models/wildflower-patch/v1/lod1.glb','flowers-lite':'https://tevy.dev/models/wildflower-patch/v1/lod2.glb','pine':'https://tevy.dev/models/scots-pine/v1/lod1.glb','pine-lite':'https://tevy.dev/models/scots-pine/v1/lod2.glb','plane':'https://tevy.dev/models/plane-tree/v1/lod2.glb','plane-lite':'https://tevy.dev/models/plane-tree/v1/lod2.glb','tree':'https://tevy.dev/models/olive-tree/v1/lod1.glb','rock':'https://tevy.dev/models/mossy-rocks/v1/lod1.glb','tree-lite':'https://tevy.dev/models/olive-tree/v1/lod2.glb','rock-lite':'https://tevy.dev/models/mossy-rocks/v1/lod2.glb'}
_nature203_cache={}
_nature203_lock=threading.Lock()
def nature203(key):
 if key not in NATURE203:return None
 with _nature203_lock:
  if key in _nature203_cache:return _nature203_cache[key]
 try:
  local=ROOT/'assets'/'nature-ktx2'/(key+'.glb')
  if local.is_file():
   with local.open('rb') as res:data=res.read(3*1024*1024+1)
  else:
   with urlopen(Request(NATURE203[key],headers={'User-Agent':'WishWorld/21.3'}),timeout=12) as res:
    data=res.read(3*1024*1024+1)
  if not 20<=len(data)<=3*1024*1024:return None
  magic,version,total,n,kind=struct.unpack_from('<4sIIII',data)
  if magic!=b'glTF' or version!=2 or total!=len(data) or kind!=0x4e4f534a or n>len(data)-20:return None
  meta=json.loads(data[20:20+n].decode('utf-8'))
  if not meta.get('meshes') or any('uri' in v and not v['uri'].startswith('data:') for v in meta.get('buffers',[])+meta.get('images',[])):return None
  with _nature203_lock:
   while _nature203_cache and sum(map(len,_nature203_cache.values()))+len(data)>24*1024*1024:
    _nature203_cache.pop(next(iter(_nature203_cache)))
   _nature203_cache[key]=data
  return data
 except Exception as e:
  print('nature203',key,type(e).__name__,flush=True)
  return None

DB=os.environ.get('WISH_DB',str(ROOT/'world.sqlite3'))
@contextmanager
def db():
 c=sqlite3.connect(DB,timeout=10)
 try:
  c.row_factory=sqlite3.Row; c.execute("PRAGMA busy_timeout=10000")
  with c: yield c
 finally: c.close()
def init():
 with db() as c:
  c.execute("PRAGMA journal_mode=WAL")
  c.executescript('''CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT UNIQUE COLLATE NOCASE, salt TEXT, password TEXT, save TEXT, revision INTEGER DEFAULT 0); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, uid TEXT, expiry INTEGER); CREATE TABLE IF NOT EXISTS wishes(id TEXT PRIMARY KEY, uid TEXT, body TEXT, created INTEGER);''')
  beta.init_alpha(c)
  social.init(c)
  admin.init(c)
  economy.init(c)
  friendship.init(c)
  festival.init(c)
  referral.init(c)
  royal.init(c)
  payment.init(c)
  save_guard.init(c)
  verified_rewards.init(c)
  dungeon.init(c)
  c.executescript("CREATE INDEX IF NOT EXISTS idx_presence_seen ON presence(seen); CREATE INDEX IF NOT EXISTS idx_wishes_uid_created ON wishes(uid,created); CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expiry);")
def digest(p,s):return hashlib.scrypt(p.encode(),salt=bytes.fromhex(s),n=16384,r=8,p=1).hex()
def tokenhash(t):return hashlib.sha256(t.encode()).hexdigest()
# V23.0: cache immutable HTML representations for the lifetime of this process.
# Files are replaced only by deployment. No user-specific content is cached.
@lru_cache(maxsize=5)
def html_representation230(filename):
 raw=(ROOT/filename).read_bytes()
 packed=gzip.compress(raw,compresslevel=5,mtime=0) if len(raw)>=1024 else None
 return raw,packed if packed is not None and len(packed)<len(raw) else None
class BoundedServer(ThreadingHTTPServer):
 daemon_threads=True
 request_queue_size=64
 def __init__(self,*args):
  self.slots=threading.BoundedSemaphore(64);super().__init__(*args)
 def process_request(self,request,address):
  if not self.slots.acquire(blocking=False):
   try: request.sendall(b'HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\nContent-Length: 0\r\n\r\n')
   except OSError: pass
   self.shutdown_request(request);return
  try:super().process_request(request,address)
  except BaseException:self.slots.release();raise
 def process_request_thread(self,*args):
  try:super().process_request_thread(*args)
  finally:self.slots.release()
class Handler(BaseHTTPRequestHandler):
 timeout=15
 def send_response(self,code,message=None):
  runtime_guard.record(code)
  super().send_response(code,message)
 def client_ip(self):
  if os.environ.get('WISH_TRUST_PROXY')=='1':
   try:return str(ipaddress.ip_address(self.headers.get('X-Real-IP','')))
   except ValueError:pass
  return self.client_address[0]

 def end_headers(self):
  self.send_header('X-Frame-Options','DENY');self.send_header('Referrer-Policy','no-referrer');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
 def reply(self,status,obj,cookie=None):
  b=json.dumps(obj,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Length',str(len(b)))
  if status==429:self.send_header('Retry-After','60')
  if cookie:self.send_header('Set-Cookie',cookie)
  self.end_headers()
  if self.command!='HEAD':self.wfile.write(b)
 def cookie(self,t,age):return f'ww_session={t}; Path=/; HttpOnly; SameSite=Strict; Max-Age={age}'+('; Secure' if os.environ.get('WISH_SECURE')=='1' or (os.environ.get('RENDER')=='true' and os.environ.get('WISH_SECURE')!='0') else '')
 def session(self,c):
  t=next((x.strip().split('=',1)[1] for x in self.headers.get('Cookie','').split(';') if x.strip().startswith('ww_session=')), '')
  return c.execute('SELECT u.*,s.token FROM users u JOIN sessions s ON u.id=s.uid WHERE s.token=? AND s.expiry>? AND u.id NOT IN (SELECT uid FROM blocked)',(tokenhash(t),int(time.time()))).fetchone()
 def do_HEAD(self):
  page=urlsplit(self.path).path
  if page.startswith('/assets/') or page in ('/','/play','/admin','/privacy','/terms','/healthz','/api/version','/favicon.ico','/favicon.svg'):
   return self.do_GET()
  return self.reply(405,{'error':'Phương thức không được hỗ trợ'})
 def do_GET(self):
  page=urlsplit(self.path).path
  if page.startswith('/assets/nature203/'):
   key=page.rsplit('/',1)[-1]
   if key not in NATURE203:return self.reply(404,{'error':'Unknown nature asset'})
   data=nature203(key)
   if data is None:return self.reply(503,{'error':'Nature asset unavailable'})
   self.send_response(200);self.send_header('Content-Type','model/gltf-binary');self.send_header('Cache-Control','public, max-age=86400');self.send_header('Content-Length',str(len(data)));self.end_headers()
   if self.command!='HEAD':self.wfile.write(data)
   return
  if page.startswith('/assets/audio151/'):
   key=page[len('/assets/audio151/'):]
   if key not in AUDIO151:return self.reply(404,{'error':'Unknown audio'})
   result=audio_asset151(key)
   if result is None:return self.reply(503,{'error':'Audio unavailable'})
   data,mime=result;self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Cache-Control','public, max-age=86400');self.send_header('Content-Length',str(len(data)));self.end_headers()
   if self.command!='HEAD':self.wfile.write(data)
   return
  if page=='/assets/western-horse-148.glb':
   data=horse_asset148()
   if data is None:return self.reply(503,{'error':'Horse asset unavailable; retry shortly'})
   self.send_response(200);self.send_header('Content-Type','model/gltf-binary');self.send_header('Cache-Control','public, max-age=86400');self.send_header('Content-Length',str(len(data)));self.end_headers()
   if self.command!='HEAD':self.wfile.write(data)
   return
  if page.startswith('/assets/'):return serve_static(self,ROOT,page)
  if page in ('/favicon.ico','/favicon.svg'):
   b=b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#183c36"/><path d="M32 5 38 25 59 32 38 39 32 59 25 39 5 32 25 25Z" fill="#e5cc87"/></svg>'
   self.send_response(200);self.send_header('Content-Type','image/svg+xml');self.send_header('Cache-Control','public, max-age=86400');self.send_header('Content-Length',str(len(b)));self.end_headers()
   if self.command!='HEAD':self.wfile.write(b)
   return
  if page=='/api/version':
   return self.reply(200,{'version':'33.8','build':'33.8-cinematic-ultimate','name':'Cinematic Ultimate','features':['twenty-signature-ultimate-profiles','twelve-ultimate-motifs','impact-synchronized-ultimate-choreography','pooled-ultimate-arrows','character-specific-optional-camera','adaptive-signature-fx','independent-damped-hair-cloth-inertia','native-spring-role-bias','adaptive-wearable-deformation','shoulder-pinned-fabric','two-edge-fabric-trim','wearable-diagnostics','stable-palm-local-grip','dynamic-finger-closure','bow-release-animation','bounded-support-hand-ik','weapon-grip-diagnostics','priority-avatar-load-queue','bounded-mobile-vrm-decoding','stale-model-disposal','adaptive-terrain-streaming','actor-load-diagnostics','profile-specific-combat-stance','grounded-directional-roll','roll-pivot-compensation','buffered-combo-pose-blend','collision-aware-roll','reduced-motion-support','combat-transient-cleanup','aerial-chain-limit','navigation-target-isolation','recovery-protection','repeatable-regression-tests','mobile-frame-cadence-awareness','coordinated-adaptive-lod','profile-clarity-floor','combat-safe-resolution-changes','peer-visibility-preservation','cpu-telemetry-smoothing','tapered-live-blade-trails','tiered-branching-lightning','stable-projectile-origin','confirmed-impact-visual-timing','isolated-ground-fx','bounded-effect-pool-diagnostics','role-based-monster-tactics','bounded-monster-evasion','coordinated-attack-windups','distance-aware-boss-skills','telegraphed-boss-followup','directional-hit-reaction','collision-checked-knockback','defeat-and-recovery-pose','reaction-input-lock','directional-dodge','joystick-combat-direction','aerial-spin-choreography','bounded-aerial-suspension','landing-timed-plunge','aerial-state-cleanup','aerial-melee-chain','monster-launch-reaction','individual-combo-rhythm','melee-mob-spacing','bounded-spring-force','mobile-frame-time-pressure','timed-guard','perfect-dodge','single-use-counter','defense-hud','25-weapon-keyframe-clips','impact-aligned-animation','synchronized-weapon-grips','bounded-combat-root-motion','spin-slash','leaping-strike','backstep-guard','weapon-dance-profiles','five-full-body-combo-forms','combat-ready-stance','combat-sole-support','early-combo-buffer','touch-hud-reserved-zones','compact-mobile-quest','mobile-emergency-quality','original-glb-arsenal','character-specific-grips','cinematic-ultimate-sigils','contact-feedback','optional-combat-camera','bounded-secondary-physics','isolated-optional-combat-fx','live-blade-path-ribbons','bounded-secondary-hand-ik','animated-bowstring','brushed-metal-roughness-map','animated-flame-shader','impact-timed-skeletal-blending','weapon-class-signature-ultimates','pooled-impact-glow','pooled-lightning-segments','refined-weapon-details','raw-hand-knuckle-grip-frame','weapon-finger-curl','faceted-two-tone-sword-bevels','faceted-weapon-models','pooled-tapered-combat-ribbons','elemental-projectile-visuals','heavy-greatsword-poses','adaptive-combat-art-budget','static-cottage-instancing','adaptive-draw-call-governor','pressure-aware-architecture-streaming','pressure-aware-forest-streaming','pressure-aware-reflection-budget','20-character-combat-kits','character-bound-weapons','character-specific-combo-sequences','contextual-combat-hud','weapon-specific-attack-poses','five-local-3d-weapon-models','local-equipment-preference','weapon-specific-basic-range-damage','ranged-basic-projectile','combat-regression-fixes','peer-skill-specific-cooldowns','pooled-elemental-ground-effects','combat-grass-shockwave','adaptive-ground-fx-budget','three-local-monster-tactics','monster-attack-telegraphs','collision-aware-pursuit','staggered-monster-attacks','low-health-monster-rage','local-elemental-reactions','ice-projectile-skill','five-element-combinations','combat-full-body-weight-transfer','combat-anticipation-recovery','combat-wrist-follow-through','fallback-combat-pose','nearby-multiplayer-visual-events','bounded-peer-fx-pool','authenticated-combat-event-relay','independent-adaptive-combat-fx-governor','combat-fx-recovery-hysteresis','combat-fx-cleanup','pooled-cinematic-skill-fx','adaptive-combat-particle-budget','layered-sword-trails','fire-projectile-afterimages','descending-ultimate-blades','local-crystal-guardian-3d','four-phase-boss-fight','telegraphed-boss-area-attacks','boss-health-hud','boss-target-lock','local-boss-respawn','hit-charged-ultimate-energy','heavenly-sword-aoe','target-lock','reusable-ultimate-halos-and-beams','dash-light-trails','ultimate-vrm-animation','separated-combat-quick-hud','five-hit-action-combo','five-blended-sword-poses','bounded-damage-floaters','monster-health-bars','collision-checked-knockback','reduced-motion-camera-shake','persistent-desktop-mobile-combat-hud','free-world-skill-animation','automatic-forest-encounters','combat-cooldown-radial','combat-jump-button','nonconflicting-combat-keys','direct-action-combat-hud','vrm-sword-and-cast-animation','held-3d-sword','timed-combat-impacts','three-hit-combo','fireball-and-lightning-effects','local-dodge-and-stun','authenticated-wildlife-startup-fix','modern-3d-only','legacy-url-normalization','3d-recovery-screen','startup-error-diagnostics','verified-login-session','single-login-submit','stale-session-refresh-protection','direct-combat-hud','local-3d-training-zone','local-monster-chase-and-respawn','local-melee-hit-range','local-training-hp','combat-menu-shortcuts','adaptive-party-polling','shared-tank-shield','party-leader-transfer','bounded-party-battle','combat-transaction-rollback','indexed-boss-rankings','reduced-mobile-combat-effects','four-player-combat-parties','opt-in-party-code','three-combat-roles','shared-party-health','server-validated-party-actions','cosmetic-party-badges','world-boss-top-ten','hundred-dungeon-floors','ten-dungeon-regions','ten-milestone-bosses','legacy-floor-five-boss','floor-scaled-player-stats','paginated-floor-selector','four-phase-crystal-boss','boss-phase-telegraphs','scheduled-world-boss','shared-world-boss-health','account-world-boss-cooldown','world-boss-contribution','deterministic-monster-tactics','telegraphed-guard-dodge-counter','elemental-affinities','low-health-rage','enemy-tactical-hud','five-elemental-spells','server-authoritative-turn-cooldowns','persistent-burn-effect','elemental-combat-hud','bounded-spell-animations','five-weapon-profiles','server-validated-combo','combat-stamina-hud','weapon-selection','lightweight-combat-panel-motion','persistent-combat-stamina','server-resolved-critical-hits','armor-mitigation','dodge-action','multiplayer-regression-suite','presence-freshness-watchdog','pair-consent-ttl','account-transition-presence-reset','private-world-peer-cleanup','remote-horse-lod','single-pass-peer-diagnostics','bounded-presence-recovery-cache','stale-response-epoch-guard','cancel-stale-pair-consent','background-local-save','recovery-cloud-retry','network-recovery-diagnostics','reciprocal-pair-consent','stationary-pair-validation','bounded-pair-reach','pair-invitation-controls','paired-photo-readiness','pair-status-diagnostics','deterministic-world-clock-state','clock-sampled-npc-routes','seeded-wildlife-slots','shared-festival-schedule','shared-world-diagnostics','adaptive-presence-cadence','network-rtt-smoothing','unchanged-presence-write-elision','conditional-orphan-cleanup','presence-query-deduplication','snapshot-aligned-emotes','snapshot-aligned-vehicles','remote-jump-velocity','remote-landing-pose','smoothed-remote-gait','lightweight-remote-horse','adaptive-peer-snapshot-delay','stale-peer-snapshot-rejection','interpolated-peer-gait','teleport-discontinuity-handling','bounded-stale-motion','peer-interpolation-diagnostics','validated-public-roster','stable-peer-identity','peer-residency-hysteresis','pose-ready-avatar-handoff','missing-peer-visual-diagnostics','public-only-presence-protocol','living-world-regression-suite','private-world-npc-guard','stale-npc-route-invalidation','wildlife-visibility-reset','terrain-footprint-continuity','festival-clock-source-diagnostics','interactive-grass-shader-fallback','shared-clock-festival-phases','resident-festival-visits','festival-lantern-ambience','festival-stage-glow','festival-navigation-menu','local-festival-souvenir','verified-account-event-rewards','player-responsive-instanced-grass','nearby-canopy-response','sand-mud-snow-ground-tracks','bounded-riverbank-ripples','interaction-quality-budget','species-wildlife-routines','weather-sensitive-wildlife','bounded-habitat-roaming','loose-herd-cohesion','walkable-riverbank-visits','wildlife-fear-hysteresis','smoothed-wildlife-gait','wildlife-state-diagnostics','role-specific-npc-routines','shared-clock-npc-schedules','off-camera-npc-travel','bounded-npc-route-retries','actual-npc-movement-gait','live-npc-activity-label','signed-sun-moon-orbits','celestial-horizon-fades','weather-driven-cloud-drift','cloud-moon-occlusion','twilight-light-response','world-anchored-precipitation','terrain-relative-rain-height','bounded-weather-particle-updates','drifting-mist','coherent-weather-gusts','bounded-nearby-crown-animation','decoupled-butterfly-wing-tick','wind-driven-river-flow','animation-regression-suite','mount-airborne-social-isolation','duet-clock-fix','finite-animation-inputs','asymmetric-blink','expression-specific-smiles','bounded-social-look','action-local-clock','normalized-action-weights','species-specific-gait','spirit-clip-phase-transfer','companion-stop-hysteresis','smoothed-dragon-flight','normalized-horse-gait-blend','smoothed-horse-cadence','horse-gait-hysteresis','shared-rider-brake-turn','idle-motion-release','early-landing-compression','bounded-running-foot-support','updated-stance-jacobian-pose','body-local-arm-response','finger-joint-stagger','wrist-follow-through','rein-grip-target-refinement','measured-speed-locomotion','braking-body-response','turn-anticipation','idle-posture-micro-motion','gait-state-hysteresis','world-streaming-regression-suite','release-inactive-high-forest-lod','high-lod-budget-retry','terrain-edge-stitching','lod-matched-ground-sampling','canonical-static-ground','resident-priority-hysteresis','adaptive-preload-lead','shared-stream-construction-budget','urgent-ground-priority','round-robin-streaming','lazy-architecture-clones','architecture-residency-cap','directional-architecture-prefetch','architecture-fallback-restore','lazy-terrain-detail','bounded-terrain-residency','terrain-geometry-disposal','visible-ground-lod-height','forest-cell-streaming','directional-prefetch','bounded-resident-forest-cells','fallback-trees-on-eviction','engine-regression-suite','streaming-glb-size-guard','bounded-model-download','glb-header-validation','vrm-timeout-fallback','stale-avatar-release','webgl-recovery-diagnostics','cached-minimap-static-layer','allocation-free-held-input-check','minimap-visit-cache','road-fallback-texture-reuse','photo-texture-release','forest-lod-sort-gate','forest-matrix-reuse','text-asset-etag','text-asset-gzip','indexed-nearby-chat','deferred-photo-textures','gzip-html-cache','mobile-visual-update-budget','hidden-effect-skip','walkable-festival-stage','wood-stone-pavilion','folded-curtains','warm-festival-lanterns','clear-stage-footprint','merged-stage-materials','thumb-up-rein-grip','forearm-aligned-wrists','rider-idle-breath-look','horse-additive-idle-motion','rein-contact-refinement','faceted-quartz-prisms','grounded-crystal-clusters','mineral-fresnel-shading','batched-rocks-and-grass','updated-crystal-resource-meshes','horse-acceleration-braking','rate-limited-horse-turn','phase-coherent-gait-blend','rein-pull-response','wrist-grip-alignment','soft-finger-curl','visible-rein-straps','organic-snow-pines','snow-footprints','horse-hoofprints','bounded-fading-trails','regional-material-pass','landmark-facade-detail','larger-civic-buildings','three-architectural-silhouettes','recessed-arched-openings','weathered-stone-materials','expanded-village-layout','updated-collision-footprints','deeper-terrain-channel','depth-dependent-water-haze','irregular-underwater-plant-clusters','multi-color-riverbed','sculpted-fish-fins-eyes','forked-animated-fish-tail','school-movement','continuous-sculpted-rock-outcrop','surface-aligned-waterfall','layered-water-turbulence-shader','moss-wet-rock-vertex-colors','grounded-splash-pool','natural-stepped-waterfall','batched-moss-rocks','three-waterfall-streams','darker-depth-water','underwater-weed-batches','riverbed-pebbles','weathered-masonry','aged-copper-roofs','draw-call-pressure-budget','transparent-depth-water','riverbed-ribbon','procedural-caustics','instanced-fish-schools','floating-lanterns','batched-lantern-glow','river-ripples','adaptive-river-life-budget','responsive-world-loading','initialization-stage-progress','first-frame-ready','classic-fallback-loading','deferred-onboarding','60fps-default','90fps-option','rapid-overload-recovery','mobile-avatar-texture-filtering','mobile-closer-camera','hidden-fallback-animation-skip','single-mobile-resolution-governor','gradual-effects-degradation','forest-build-yield','adaptive-shadow-interval','clarity-first-mobile','static-label-texture-atlas','texture-size-budget','texture-byte-estimate','local-ktx2-preference','forest-lod1-lod2','forest-cell-frustum','adaptive-detail-budget','adaptive-pixel-budget','particle-buffer-reuse','cave-glb-instancing','hard-mobile-dpr-cap','mobile-pixel-budget','gpu-texture-compression-audit','whole-forest-glb-instancing','visible-asset-status','old-forest-comparison','asset-geometry-validation','asset-load-diagnostics','adaptive-nature-fallback','architecture-scale-fix','authored-cottage-and-wood-house','authored-lantern-heads','architecture-distance-culling','curved-waterfall-geometry','soft-foam-particles','lightweight-water-ripples','shoreline-variation','authored-waterfall-cliff','authored-cave-boulder-shell','rock-envelope-fit','instanced-grass-fern-wildflower-assets','vegetation-distance-budget','vegetation-fallback-switch','three-authored-tree-species','tree-distance-culling','portable-download-timeout','cc0-nature-glb-pilot','mobile-lod-assets','safe-asset-fallback','natural-waterfall-rock-material','soft-waterfall-spray-mask','irregular-river-ripples','fine-grass-blades','varied-leaf-crowns','sculpted-frontier-relief','slope-based-terrain-color','protected-trail-relief','resize-observer-fallback','idempotent-gpu-recovery','safe-mobile-diagnostics','texture-reset-normal-strength','mobile-rock-mesh-budget','grass-lod-hysteresis','mobile-vegetation-update-budget','mobile-shadow-budget','golden-hour-light-balance','adaptive-shadow-bias','cinematic-water-highlight','atmospheric-depth','material-specific-roughness','regional-rock-pbr','roof-relief','metallic-gold-response','shared-roof-tile-atlas','window-sills-and-lintels','civic-stone-cornices','layered-sky-clouds','twilight-horizon-haze','soft-ground-mist','star-twinkle','river-edge-foam','coastal-breakers','waterfall-flow-alpha','layered-mountain-ridges','geological-cave-exterior','adaptive-horizon-mesh','three-tree-species','continuous-trunk-meshes','detailed-leaf-atlas','curved-grass-blades','spatial-wind','photo-derived-relief','geological-rock-pbr','terrain-material-blend','fantasy-leaf-cutout','architecture-relief','natural-light-contrast','celestial-isles-open','sky-platform-height','sky-bridge-collision','sky-map-portal','floating-palace','sky-waterfalls','sea-of-wishes-open','coastal-terrain','island-peninsula','animated-sea-shader','harbor-lighthouse','decorative-sailboats','desert-of-hope-open','sand-dune-terrain','palm-oasis','pyramid-temple-exterior','wind-dust-budget','volcanic-rebirth-open','lava-shader','lava-bridge-collision','fire-shrine','ember-particles','enchanted-woods-open','ancient-tree-roots-vines','emerald-pond-collision','firefly-budget','sealed-cave-exterior','sun-kingdom-open','sun-palace-exterior','royal-plaza-avenue','cascade-basin-collision','crystal-lanterns','dream-valley-open','crescent-moon-monument','dream-glowing-flora','localized-starlight-river','dream-terrain-palette','frost-kingdom-open','snow-mountain-terrain','ice-palace-exterior','instanced-snow-pines','ice-crystal-clusters','blossom-realm-open','blossom-pond-collision','blossom-photo-pavilion','blossom-trail','tiered-petal-particles','fantasy-civic-buildings','royal-light-bridge','ornamental-fountain','wish-waterfall-upgrade','mobile-clarity-floor','independent-effect-resolution','mobile-balanced-default','mobile-far-tile-culling','mobile-texture-filtering','wish-tree-pink-canopy','wish-plaza-gold-inlays','animated-wish-motes','blossom-grove-pilot','realm-atlas-planned-gates','vrm-finger-joint-poses','rein-palm-contact','smooth-weathered-rocks','frontier-understory','ground-macro-variation','expanded-240x272-world','stitched-64-terrain-tiles','frontier-hills-trails','eight-new-frontier-sites','polyhaven-photo-textures','extended-river-bridges','expanded-presence-bounds','four-vinish-spirit-glbs','species-gait-hysteresis','all-companions-live-gallery','lazy-spirit-assets','spirit-attribution','vinish-jade-skinned-glb','jade-pbr-normal-textures','jade-asset-validation','jade-animation-hysteresis','jade-attribution','dragon-forward-axis-fix','velocity-based-dragon-steering','scalloped-wing-membranes','original-jade-mesh-pilot','actual-model-first-gallery','adaptive-preview-dpr','jade-bone-accessories','redesigned-main-hud','direct-companion-shortcut','dragon-weighted-mesh-refinement','dragon-scale-bump','dragon-live-preview','default-rigged-dragon','hd-companion-portraits','dragon-loading-status','meshopt-dragon-decoder','opt-in-rigged-dragon-pilot','illustrated-companion-collection','concept-inspired-companion-shapes','responsive-companion-detail','licensed-audio-samples','context-music-crossfade','rein-arm-flexion','dynamic-reins','elemental-pet-vfx','pet-vfx-budget','species-torso-profiles','rider-pelvic-articulation','gait-phase-crossfade','matte-fur-and-scale-maps','same-origin-horse-asset','dedicated-mount-states','saddle-and-limb-targets','fantasy-silhouette-rework','optional-rigged-western-horse','mount-leg-ik','fantasy-companion-style','horse-saddle-anchor','horseback-vrm-pose','compact-hud','visible-audio-toggle','speaker-test','independent-audio-scheduler','procedural-audio-mixer','terrain-step-cues','weather-ambience','bounded-audio-voices','audio-mix-preferences','bounded-motion-substeps','time-consistent-jump','smoothed-mobile-camera-orbit','frame-time-physics-diagnostics','bounded-vrm-byte-cache','mobile-model-eviction','throttled-pose-diagnostics','asset-cache-telemetry','mobile-30fps-default','mobile-dynamic-render-budget','distance-bounded-vrm-actors','fast-degrade-slow-recover','server-resolved-solo-pve','five-dungeon-stages','telegraphed-boss-attacks','revision-protected-combat-progress','expanded-144x176-world','north-south-terrain-tiles','four-frontier-landmarks','expanded-presence-bounds','mutual-friend-adventure-consent','two-player-checkpoints','daily-coop-badge','pet-wellbeing-meters','pet-rest-and-care','corrected-pet-follow-direction','deduplicated-server-presence','stable-stale-peer-position','weekly-adventure-goals','two-session-browser-api-regression','weather-water-material','bounded-river-reeds','adaptive-mist-foam','visible-ground-contact-shadow','vrm-action-crossfade','blended-face-expressions','bounded-wearable-secondary-motion','expanded-vrm-emote-poses','lighting-style-presets','smoothed-camera-clearance','opt-in-movement-audio','immersive-discovery-actions','npc-loading-fallback','strict-json-input','account-write-quotas','cross-site-post-guard','runtime-admin-counters','secure-admin-cookie','sqlite-busy-retry-status','four-regional-landmark-candidates','local-region-atlas','hysteresis-cell-culling','account-daily-adventure-routes','ordered-presence-checkins','cosmetic-adventure-badges','pet-acceleration-controller','pet-obstacle-detours','pet-follow-wait-recall','pet-touch-reaction','server-world-clock','timestamped-presence-snapshots','bounded-peer-interpolation','jittered-network-retry','six-local-weather-profiles','continuous-weather-blending','wind-scaled-particles','continuous-city-lighting','quality-bounded-precipitation','bounded-independent-sagittal-stance','continuous-air-flex','five-performance-presets','device-quality-detection','heap-pressure-heuristic','cpu-frame-measurement','camera-vector-reuse','grass-distance-optimization','continuous-daylight','world-clock-hud','idle-support-anchor','velocity-shaped-jump-arms','cat-rabbit-skinned-meshes','cat-rabbit-distance-lod','pet-sniff-meow','peer-visible-fallback','peer-vrm-retry','rigged-animal-assets','recessed-animal-eyes','five-fantasy-creature-meshes','species-articulated-idle','creature-reactions','shared-creature-assets','bridge-lantern-clearance','balanced-avatar-scale','dual-sole-contact','mesh-sole-contact','visible-terrain-alignment','npc-ground-contact','grounded-idle','contact-shadow','soft-knee-stance','restored-vrm-roster','speed-synchronised-gait','relaxed-male-motion','turn-acceleration-lean','rabbit-sculpture','species-specific-motion','fur-vertex-detail','asymmetric-idle','weighted-landing','matte-animal-fur','optional-avatar-bases','bone-attached-accessories','continuous-gait','natural-body-counterrotation','directional-arm-flex','arm-clearance','twenty-motion-personalities','safe-sagittal-ik','motion-preview','pet-gait-hysteresis','foot-contact-ik','remote-vrm-presets','private-backup-download','enhanced-housing','blended-locomotion','four-phase-jump','npc-impostor-lod','pet-velocity-animation','corrected-humanoid-pose','twenty-avatar-presets','nearby-npc-vrm','smooth-animal-normals','ten-avatar-presets','shared-preview-world-model','same-origin-model-cache','automatic-fox-deer','vrm-skinned-avatar-beta','portrait-closeup','secondary-hair-motion','anime-toon-character','facial-expressions','jump-anticipation','head-and-icon','database-connection-cleanup','mobile-clarity-guard','verified-rewards','save-validation','local-asset-support','effects-first-adaptive-quality','river-static-instancing','lightweight-water','near-character-detail','performance-diagnostics','unified-inventory','shared-car','ceremony-rsvp','safe-sync','shared-world','version-check']})
  if page=='/healthz':
   try:
    with db() as c:c.execute('SELECT 1 FROM users LIMIT 1').fetchone()
    return self.reply(200,{'status':'ok'})
   except sqlite3.Error:return self.reply(503,{'status':'unavailable'})
  if page in ('/','/play','/admin','/privacy','/terms'):
   filename={'/':'landing.html','/play':'index.html','/admin':'admin.html','/privacy':'privacy.html','/terms':'terms.html'}[page]
   if page=='/admin':b=(ROOT/filename).read_bytes();packed=None
   else:b,packed=html_representation230(filename)
   encoded=packed is not None and accepts_gzip230(self.headers.get('Accept-Encoding'))
   if encoded:b=packed
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Vary','Accept-Encoding')
   if encoded:self.send_header('Content-Encoding','gzip')
   self.send_header('Content-Length',str(len(b)));self.end_headers()
   if self.command!='HEAD':self.wfile.write(b)
   return
  with db() as c:
   if self.path.startswith('/api/admin/'):return admin.handle(self,c)
   if self.path=='/api/notices':return self.reply(200,{'notices':[dict(r) for r in c.execute('SELECT * FROM notices ORDER BY id DESC LIMIT 20')]})
   u=self.session(c)
   if self.path=='/api/me':return self.reply(200,{'user':{'id':u['id'],'name':u['name'],'revision':u['revision']} if u else None})
   if not u:return self.reply(401,{'error':'Cần đăng nhập'})
   if self.path.startswith('/api/verified/'):return verified_rewards.handle(self,c,u)
   if self.path.startswith('/api/royal/'):return royal.handle(self,c,u)
   if self.path.startswith('/api/referral/'):return referral.handle(self,c,u)
   if self.path.startswith('/api/festival/'):return festival.handle(self,c,u)
   if self.path.startswith('/api/economy/'):return economy.handle(self,c,u)
   if self.path=='/api/save':return self.reply(200,{'state':json.loads(u['save']) if u['save'] else None,'revision':u['revision'],'owner':u['id']})
   if self.path=='/api/wishes':return self.reply(200,{'wishes':[dict(r) for r in c.execute('SELECT w.id,w.body,w.created,u.name,(w.uid=?) AS mine FROM wishes w JOIN users u ON w.uid=u.id ORDER BY w.created DESC LIMIT 50',(u['id'],))]})
  self.reply(404,{'error':'Không tìm thấy'})
 def do_POST(self):
  try:
   if self.headers.get('Sec-Fetch-Site','').lower()=='cross-site':return self.reply(403,{'error':'Không nhận yêu cầu từ website khác'})
   if self.headers.get_content_type()!='application/json':return self.reply(415,{'error':'Yêu cầu JSON'})
   lengths=self.headers.get_all('Content-Length') or []
   if self.headers.get('Transfer-Encoding') or len(lengths)!=1 or not re.fullmatch(r'[0-9]{1,9}',lengths[0]):return self.reply(400,{'error':'Độ dài dữ liệu không hợp lệ'})
   n=int(lengths[0])
   if not 0<n<=runtime_guard.MAX_BODY:return self.reply(413,{'error':'Dữ liệu quá lớn'})
   raw=self.rfile.read(n)
   if len(raw)!=n:return self.reply(400,{'error':'Dữ liệu chưa đầy đủ'})
   d=runtime_guard.decode(raw)
   if self.path in ('/api/login','/api/register','/api/admin/login') and not beta.allow(self.client_ip(),self.path):return self.reply(429,{'error':'Quá nhiều yêu cầu. Thử lại sau 60 giây.'})
   with db() as c:
    if self.path=='/api/payment/sandbox-webhook':return payment.webhook(self,c,d)
    if self.path.startswith('/api/admin/'):return admin.handle(self,c,d)
    if self.path in ('/api/register','/api/login'):
     name=d.get('name','');p=d.get('password','')
     if not isinstance(name,str) or not re.fullmatch(r'[a-zA-Z0-9_]{3,24}',name) or not isinstance(p,str) or not 10<=len(p)<=128:return self.reply(400,{'error':'Tên 3–24 ký tự ASCII; mật khẩu 10–128 ký tự'})
     if self.path.endswith('register'):
      code=d.get('referral','');inviter=referral.resolve(c,code) if code else None
      if code and not inviter:return self.reply(400,{'error':'Mã giới thiệu không hợp lệ'})
      salt=secrets.token_hex(16);uid=secrets.token_hex(8)
      try:c.execute('INSERT INTO users(id,name,salt,password) VALUES(?,?,?,?)',(uid,name,salt,digest(p,salt)))
      except sqlite3.IntegrityError:return self.reply(409,{'error':'Tên đã được sử dụng'})
      if inviter:c.execute('INSERT INTO referrals VALUES(?,?,?,NULL)',(uid,inviter['id'],int(time.time())))
     else:
      u=c.execute('SELECT * FROM users WHERE name=?',(name,)).fetchone();actual=digest(p,u['salt'] if u else '00'*16)
      if not u or not hmac.compare_digest(actual,u['password']):return self.reply(401,{'error':'Sai tài khoản hoặc mật khẩu'})
      uid=u['id']
      if c.execute('SELECT 1 FROM blocked WHERE uid=?',(uid,)).fetchone():return self.reply(403,{'error':'Tài khoản bị khóa'})
     t=secrets.token_urlsafe(32);c.execute('DELETE FROM sessions WHERE expiry<?',(int(time.time()),));c.execute('INSERT INTO sessions VALUES(?,?,?)',(tokenhash(t),uid,int(time.time())+86400));c.commit();return self.reply(200,{'ok':True},self.cookie(t,86400))
    u=self.session(c)
    if not u:return self.reply(401,{'error':'Cần đăng nhập'})
    if not runtime_guard.allow(u['id'],self.path):return self.reply(429,{'error':'Máy chủ giới hạn yêu cầu. Thử lại sau 60 giây.'})
    if self.path.startswith('/api/dungeon/'):return dungeon.handle(self,c,u,d)
    if self.path.startswith('/api/verified/'):return verified_rewards.handle(self,c,u,d)
    if self.path.startswith('/api/royal/'):return royal.handle(self,c,u,d)
    if self.path.startswith('/api/referral/'):return referral.handle(self,c,u,d)
    if self.path.startswith('/api/festival/'):return festival.handle(self,c,u,d)
    if self.path.startswith('/api/economy/'):return economy.handle(self,c,u,d)
    if self.path.startswith('/api/friendship/'):return friendship.handle(self,c,u,d)
    if self.path=='/api/alpha/feedback':return beta.submit_alpha(self,c,u,d)
    if self.path.startswith('/api/social/'):return social.handle(self,c,u,d)
    if self.path=='/api/logout':
     c.execute('DELETE FROM presence WHERE uid=?',(u['id'],))
     c.execute('DELETE FROM sessions WHERE token=?',(u['token'],));social.leave(c,u['id']);c.commit();return self.reply(200,{'ok':True},self.cookie('',0))
    if self.path=='/api/save':
     v=d.get('state');rev=d.get('revision');
     if 'owner' in d and d['owner']!=u['id']:return self.reply(403,{'error':'Tài khoản bản lưu không khớp'})
     if not isinstance(v,dict) or type(rev) is not int or not 0<=rev<9223372036854775807 or not isinstance(v.get('name'),str) or not all(isinstance(v.get(k),list) for k in ('wishes','lanterns','plants','owned','collection','decor')) or not all(type(v.get(k)) is int and 0<=v[k]<=10000000 for k in ('coins','xp','petXp','streak')) or not isinstance(v.get('daily'),dict) or not isinstance(v['daily'].get('claimed'),list):return self.reply(400,{'error':'Bản lưu không hợp lệ'})
     if not save_guard.valid_tree(v):return self.reply(400,{'error':'Cấu trúc bản lưu không hợp lệ'})
     r=c.execute('UPDATE users SET save=?,revision=revision+1 WHERE id=? AND revision=?',(json.dumps(v,ensure_ascii=False,allow_nan=False),u['id'],rev))
     if r.rowcount:save_guard.audit(c,u['id'],rev+1,json.loads(u['save']) if u['save'] else None,v)
     c.commit()
     return self.reply(200,{'revision':rev+1,'owner':u['id']}) if r.rowcount else self.reply(409,{'error':'Bản lưu máy chủ đã thay đổi; tải lại trước khi lưu'})
    if self.path=='/api/wishes':
     body=d.get('body','');now=int(time.time())
     if not isinstance(body,str) or not 1<=len(body.strip())<=280:return self.reply(400,{'error':'Điều ước tối đa 280 ký tự'})
     c.execute('BEGIN IMMEDIATE');last=c.execute('SELECT MAX(created) FROM wishes WHERE uid=?',(u['id'],)).fetchone()[0]
     if last and now-last<60:return self.reply(429,{'error':'Chờ 60 giây giữa các bài đăng'})
     c.execute('INSERT INTO wishes VALUES(?,?,?,?)',(secrets.token_hex(12),u['id'],body.strip(),now));c.commit();return self.reply(201,{'ok':True})
    if self.path=='/api/wishes/delete':
     c.execute('DELETE FROM wishes WHERE id=? AND uid=?',(str(d.get('id','')),u['id']));c.commit();return self.reply(200,{'ok':True})
   self.reply(404,{'error':'Không tìm thấy'})
  except (ValueError,TypeError,AssertionError,KeyError):self.reply(400,{'error':'Yêu cầu không hợp lệ'})
  except (BrokenPipeError,ConnectionResetError,TimeoutError):self.close_connection=True
  except sqlite3.OperationalError as e:
   if (getattr(e,'sqlite_errorcode',0)&255) in (sqlite3.SQLITE_BUSY,sqlite3.SQLITE_LOCKED):return self.reply(503,{'error':'Máy chủ đang bận, vui lòng thử lại'})
   print(type(e).__name__,flush=True);self.reply(500,{'error':'Lỗi máy chủ'})
  except Exception as e:print(type(e).__name__,flush=True);self.reply(500,{'error':'Lỗi máy chủ'})
if __name__=='__main__':
 import test_together,test_guild,test_http_assets;test_together.smoke();test_guild.smoke();test_http_assets.smoke()
 init()
 if os.environ.get('RENDER')=='true' and 'WISH_DB' not in os.environ:print('WARNING: SQLite uses the deployment filesystem; configure durable storage before production use.',flush=True)
 port=int(os.environ.get('PORT','8080'));print(f'WISH WORLD: http://127.0.0.1:{port}',flush=True);BoundedServer((os.environ.get('HOST','127.0.0.1'),port),Handler).serve_forever()
