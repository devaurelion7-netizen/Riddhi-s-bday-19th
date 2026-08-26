/* ============================================================
   memories.js — Riddhi's Birthday Website
   Scroll-Driven 3D Depth Collage Gallery built with Three.js
   Glossy Purple Blossom Hearts & Atmospheric Background
   ============================================================ */

'use strict';

(function() {
  function initGallery() {
    var data = window.memoriesData;
    if (!data || !data.length) {
      console.error('[memories.js] memoriesData not found or empty!');
      return;
    }

    var container = document.getElementById('galleryContainer');
    var canvasEl = document.getElementById('webglCanvas');
    var heartsCanvas = document.getElementById('heartsCanvas');
    var counterEl = document.getElementById('activeCounter');
    var endBanner = document.getElementById('endBanner');

    if (!canvasEl) {
      console.error('[memories.js] No canvas found!');
      return;
    }

    var W = window.innerWidth;
    var H = window.innerHeight;

    // ── Blossom Heart Sprites Generator (matches wishing page) ──
    var BLOSSOM = [
      { c0: '#fdf4ff', c1: '#e879f9' },
      { c0: '#faf5ff', c1: '#c084fc' },
      { c0: '#f5d0fe', c1: '#a855f7' },
      { c0: '#f3e8ff', c1: '#9333ea' },
      { c0: '#e9d5ff', c1: '#7e22ce' },
      { c0: '#fdf2f8', c1: '#f472b6' },
      { c0: '#ffffff', c1: '#d8b4fe' }
    ];

    function shadeColor(hex, pct) {
      var num = parseInt(hex.slice(1), 16);
      var r = (num >> 16) + pct;
      var g = ((num >> 8) & 0x00FF) + pct;
      var b = (num & 0x0000FF) + pct;
      return 'rgb(' + Math.max(0, Math.min(255, r)) + ',' + Math.max(0, Math.min(255, g)) + ',' + Math.max(0, Math.min(255, b)) + ')';
    }

    var SS = 128;
    function heartPath(c, x, top, w, h) {
      c.beginPath();
      c.moveTo(x, top + h * 0.28);
      c.bezierCurveTo(x, top, x - w * 0.5, top, x - w * 0.5, top + h * 0.28);
      c.bezierCurveTo(x - w * 0.5, top + h * 0.60, x - w * 0.16, top + h * 0.80, x, top + h);
      c.bezierCurveTo(x + w * 0.16, top + h * 0.80, x + w * 0.5, top + h * 0.60, x + w * 0.5, top + h * 0.28);
      c.bezierCurveTo(x + w * 0.5, top, x, top, x, top + h * 0.28);
      c.closePath();
    }

    function createBlossomSprite(b) {
      var cv = document.createElement('canvas');
      cv.width = cv.height = SS;
      var c = cv.getContext('2d');
      var w = SS * 0.62, h = SS * 0.58, x = SS / 2, top = SS * 0.17;

      // Soft purple drop shadow
      c.save();
      c.shadowColor = 'rgba(88,28,135,0.45)';
      c.shadowBlur = SS * 0.09;
      c.shadowOffsetY = SS * 0.05;
      c.fillStyle = b.c1;
      heartPath(c, x, top, w, h);
      c.fill();
      c.restore();

      // Shaded radial gradient
      var g = c.createRadialGradient(x - w * 0.20, top + h * 0.20, h * 0.04, x, top + h * 0.42, h * 0.92);
      g.addColorStop(0, b.c0);
      g.addColorStop(0.55, b.c1);
      g.addColorStop(1, shadeColor(b.c1, -26));
      heartPath(c, x, top, w, h);
      c.fillStyle = g;
      c.fill();

      // Top glossy sheen
      c.save();
      heartPath(c, x, top, w, h);
      c.clip();
      var g2 = c.createLinearGradient(0, top, 0, top + h);
      g2.addColorStop(0, 'rgba(255,255,255,0.95)');
      g2.addColorStop(0.35, 'rgba(255,255,255,0)');
      g2.addColorStop(0.65, 'rgba(59,7,100,0)');
      g2.addColorStop(1, 'rgba(59,7,100,0.26)');
      c.fillStyle = g2;
      c.fillRect(0, 0, SS, SS);

      // Specular highlight ellipse
      c.globalAlpha = 0.65;
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.ellipse(x - w * 0.15, top + h * 0.24, w * 0.17, h * 0.11, -0.5, 0, Math.PI * 2);
      c.fill();
      c.restore();

      return cv;
    }

    var blossomSprites = BLOSSOM.map(createBlossomSprite);

    // ── Scroll state & Bounds ──
    var targetZ = 0;
    var currentZ = 0;
    var startZ = 0;
    var lastZ = data[data.length - 1].position.z;
    var maxZ = lastZ - 8;

    var clusterSet = {};
    for (var i = 0; i < data.length; i++) clusterSet[data[i].cluster] = true;
    var totalClusters = Object.keys(clusterSet).length;

    // ── Three.js Scene & Camera Setup ──
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 600);
    camera.position.set(0, 0, startZ);

    var renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ── Atmospheric GLSL Gradient Background ──
    var bgUniforms = {
      uBgColor:    { value: new THREE.Color('#fcf8ff') },
      uBlob1Color: { value: new THREE.Color('#d8b4fe') },
      uBlob2Color: { value: new THREE.Color('#9333ea') },
      uTime:       { value: 0 },
      uVelocity:   { value: 0 }
    };

    var bgMat = new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = vec4(position.xy, 0.9999, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uBgColor;',
        'uniform vec3 uBlob1Color;',
        'uniform vec3 uBlob2Color;',
        'uniform float uTime;',
        'uniform float uVelocity;',
        'varying vec2 vUv;',
        '',
        'float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
        '',
        'void main() {',
        '  vec2 uv = vUv;',
        '  vec2 b1 = vec2(0.32 + 0.16 * sin(uTime * 0.30), 0.68 + 0.14 * cos(uTime * 0.25));',
        '  float d1 = length(uv - b1);',
        '  float s1 = smoothstep(0.84 + uVelocity * 0.14, 0.0, d1);',
        '  vec2 b2 = vec2(0.72 + 0.14 * cos(uTime * 0.28), 0.28 + 0.15 * sin(uTime * 0.35));',
        '  float d2 = length(uv - b2);',
        '  float s2 = smoothstep(0.92 + uVelocity * 0.16, 0.0, d2);',
        '  vec3 col = uBgColor;',
        '  col = mix(col, uBlob1Color, s1 * 0.52);',
        '  col = mix(col, uBlob2Color, s2 * 0.46);',
        '  col += (rand(uv + fract(uTime * 0.5)) - 0.5) * 0.024;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'),
      depthWrite: false,
      depthTest: false
    });

    var bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
    bgMesh.frustumCulled = false;
    scene.add(bgMesh);

    // ── 3D Floating Hearts in Scene Space ──
    var heartTextures = blossomSprites.map(function(cv) {
      var tex = new THREE.CanvasTexture(cv);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      return tex;
    });

    var heartSprites3D = [];
    var HEART_COUNT_3D = 90;

    for (var k = 0; k < HEART_COUNT_3D; k++) {
      var texIdx = k % heartTextures.length;
      var mat = new THREE.SpriteMaterial({
        map: heartTextures[texIdx],
        transparent: true,
        opacity: 0.72 + Math.random() * 0.24,
        depthWrite: false
      });
      var sp = new THREE.Sprite(mat);
      var sz = 0.55 + Math.random() * 0.9;
      sp.scale.set(sz, sz, 1);

      var posX = (Math.random() - 0.5) * 11.0;
      var posY = (Math.random() - 0.5) * 7.5;
      var posZ = 4.0 - Math.random() * (Math.abs(maxZ) + 12.0);

      sp.position.set(posX, posY, posZ);
      scene.add(sp);

      heartSprites3D.push({
        sprite: sp,
        baseX: posX,
        baseY: posY,
        speedY: 0.008 + Math.random() * 0.015,
        driftPhase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    // ── Load Photo Meshes with Polaroid Borders ──
    var loader = new THREE.TextureLoader();
    var photoGroups = [];

    data.forEach(function(item, idx) {
      var g = new THREE.Group();
      g.position.set(item.position.x, item.position.y, item.position.z);
      if (item.rotation && item.rotation.z) g.rotation.z = item.rotation.z;

      var s = item.scale || 1;

      var pw = 2.2 * s;
      var ph = 1.75 * s;
      var pad = 0.15 * s;
      var padBot = 0.45 * s;
      var fw = pw + pad * 2;
      var fh = ph + pad + padBot;

      // Polaroid Card backing
      var frameMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      var frameMesh = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), frameMat);
      frameMesh.position.set(0, (padBot - pad) / 2, 0);
      g.add(frameMesh);

      // Photo plane
      var photoMat = new THREE.MeshBasicMaterial({ color: 0xf3e8ff, side: THREE.DoubleSide });
      var photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), photoMat);
      photoMesh.position.set(0, 0, 0.01);
      g.add(photoMesh);

      // Washi tape
      var tapeMat = new THREE.MeshBasicMaterial({ color: 0xffe1a0, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
      var tapeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * s, 0.18 * s), tapeMat);
      tapeMesh.position.set(0, fh / 2 + (padBot - pad) / 2 - 0.02, 0.02);
      tapeMesh.rotation.z = idx % 2 === 0 ? 0.03 : -0.03;
      g.add(tapeMesh);

      scene.add(g);

      // Asynchronously load texture & adjust to exact image aspect ratio
      loader.load(item.image, function(tex) {
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        photoMat.map = tex;
        photoMat.color.set(0xffffff);
        photoMat.needsUpdate = true;

        var iw = tex.image.naturalWidth || tex.image.width || 800;
        var ih = tex.image.naturalHeight || tex.image.height || 800;
        var aspect = iw / ih;

        var newH = 1.75 * s;
        var newW = newH * aspect;

        if (newW > 2.4 * s) { newW = 2.4 * s; newH = newW / aspect; }
        if (newH > 2.1 * s) { newH = 2.1 * s; newW = newH * aspect; }

        photoMesh.geometry.dispose();
        photoMesh.geometry = new THREE.PlaneGeometry(newW, newH);

        var nfw = newW + pad * 2;
        var nfh = newH + pad + padBot;
        frameMesh.geometry.dispose();
        frameMesh.geometry = new THREE.PlaneGeometry(nfw, nfh);
        frameMesh.position.set(0, (padBot - pad) / 2, 0);
        tapeMesh.position.set(0, nfh / 2 + (padBot - pad) / 2 - 0.02, 0.02);
      }, undefined, function(err) {
        console.warn('[memories.js] Skipping missing image:', item.image);
      });

      photoGroups.push({
        group: g,
        item: item,
        baseY: item.position.y,
        baseRot: item.rotation ? item.rotation.z : 0
      });
    });

    // ── Scroll Controls ──
    window.addEventListener('wheel', function(e) {
      targetZ -= e.deltaY * 0.045;
      targetZ = Math.max(maxZ, Math.min(startZ, targetZ));
    }, { passive: true });

    var touchY = 0;
    window.addEventListener('touchstart', function(e) {
      touchY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', function(e) {
      var dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      targetZ -= dy * 0.095;
      targetZ = Math.max(maxZ, Math.min(startZ, targetZ));
    }, { passive: true });

    window.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); targetZ -= 14; }
      if (e.key === 'ArrowUp') { e.preventDefault(); targetZ += 14; }
      targetZ = Math.max(maxZ, Math.min(startZ, targetZ));
    });

    // Mouse tilt
    var mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener('mousemove', function(e) {
      mouse.targetX = (e.clientX / W) * 2 - 1;
      mouse.targetY = -(e.clientY / H) * 2 + 1;
    }, { passive: true });

    // Resize
    window.addEventListener('resize', function() {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      if (heartsCanvas) {
        heartsCanvas.width = W;
        heartsCanvas.height = H;
      }
    });

    // ── Mood Colors ──
    var targetBg = new THREE.Color();
    var targetBlob1 = new THREE.Color();
    var targetBlob2 = new THREE.Color();

    function updateMood() {
      var cz = camera.position.z;
      var closest = 0;
      var closestD = Infinity;

      for (var i = 0; i < data.length; i++) {
        var d = Math.abs(cz - data[i].position.z - 2);
        if (d < closestD) { closestD = d; closest = i; }
      }

      var cluster = data[closest].cluster;
      var mood = data[closest].mood;
      if (mood) {
        targetBg.set(mood.background);
        targetBlob1.set(mood.blob1);
        targetBlob2.set(mood.blob2);
        bgUniforms.uBgColor.value.lerp(targetBg, 0.04);
        bgUniforms.uBlob1Color.value.lerp(targetBlob1, 0.04);
        bgUniforms.uBlob2Color.value.lerp(targetBlob2, 0.04);
      }

      if (counterEl) {
        counterEl.textContent = String(cluster + 1).padStart(2, '0') + ' / ' + String(totalClusters).padStart(2, '0');
      }

      if (endBanner) {
        if (cz <= maxZ + 5) endBanner.classList.add('is-visible');
        else endBanner.classList.remove('is-visible');
      }
    }

    // ── 2D Floating Hearts Particles Overlay ──
    var floaters2D = [];
    var COUNT_2D = 40;

    if (heartsCanvas) {
      heartsCanvas.width = W;
      heartsCanvas.height = H;

      for (var f = 0; f < COUNT_2D; f++) {
        floaters2D.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: 16 + Math.random() * 26,
          speed: 0.45 + Math.random() * 0.65,
          drift: (Math.random() - 0.5) * 0.4,
          alpha: 0.35 + Math.random() * 0.45,
          rot: (Math.random() - 0.5) * 0.6,
          rotSpeed: (Math.random() - 0.5) * 0.006,
          sprite: blossomSprites[Math.floor(Math.random() * blossomSprites.length)],
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function render2DHearts() {
      if (!heartsCanvas) return;
      var ctx = heartsCanvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < floaters2D.length; i++) {
        var p = floaters2D[i];
        p.y -= p.speed;
        p.x += p.drift + Math.sin(p.y * 0.008 + p.phase) * 0.35;
        p.rot += p.rotSpeed;

        if (p.y < -50) {
          p.y = H + 30;
          p.x = Math.random() * W;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(p.sprite, -p.size * 0.5, -p.size * 0.5, p.size, p.size);
        ctx.restore();
      }
    }

    // ── Animation Loop ──
    var clock = new THREE.Clock();
    var prevZ = 0;

    function animate() {
      requestAnimationFrame(animate);

      var t = clock.getElapsedTime();

      // Smooth scroll inertia
      currentZ += (targetZ - currentZ) * 0.075;
      camera.position.z = currentZ;

      // Scroll velocity
      var velocity = Math.abs(currentZ - prevZ) * 45.0;
      prevZ = currentZ;

      // Mouse lerping
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // Camera sway
      camera.position.x = Math.sin(currentZ * 0.03) * 0.22 + mouse.x * 0.25;
      camera.position.y = Math.cos(currentZ * 0.025) * 0.15 + mouse.y * 0.18;
      camera.rotation.z = - (targetZ - currentZ) * 0.004 - (mouse.x * 0.012);

      // Shader uniforms
      bgUniforms.uTime.value = t;
      bgUniforms.uVelocity.value += (velocity - bgUniforms.uVelocity.value) * 0.1;

      updateMood();

      // Animate 3D heart sprites
      for (var s = 0; s < heartSprites3D.length; s++) {
        var hs = heartSprites3D[s];
        hs.sprite.position.y = hs.baseY + Math.sin(t * 1.5 + hs.driftPhase) * 0.25;
        hs.sprite.position.x = hs.baseX + Math.cos(t * 1.2 + hs.driftPhase) * 0.20;
      }

      // Animate photo groups
      for (var p = 0; p < photoGroups.length; p++) {
        var g = photoGroups[p];
        var dist = g.item.position.z - currentZ;

        g.group.position.y = g.baseY + Math.sin(t * 1.2 + p * 0.4) * 0.025;
        g.group.rotation.z = g.baseRot + Math.sin(t * 0.9 + p * 0.3) * 0.008 + (mouse.x * 0.015);

        // Visibility culling
        g.group.visible = (dist < 2.5 && dist > -55.0);
      }

      renderer.render(scene, camera);
      render2DHearts();
    }

    animate();
    console.log('[memories.js] 3D depth gallery & purple blossom hearts running successfully!');

    // ── Page Exit Transitions ──
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a.nav-btn');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return;
      e.preventDefault();

      var rect = link.getBoundingClientRect();
      var ox = ((rect.left + rect.width / 2) / W * 100).toFixed(1) + '%';
      var oy = ((rect.top + rect.height / 2) / H * 100).toFixed(1) + '%';

      var veil = document.createElement('div');
      veil.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;' +
        'background:radial-gradient(circle at ' + ox + ' ' + oy + ',#c084fc 0%,#9333ea 30%,#581c87 60%,#2e1065 100%);' +
        'clip-path:circle(0% at ' + ox + ' ' + oy + ');' +
        'transition:clip-path 0.65s cubic-bezier(0.4,0,0.2,1);';
      document.body.appendChild(veil);

      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          veil.style.clipPath = 'circle(150% at ' + ox + ' ' + oy + ')';
        });
      });

      setTimeout(function() { window.location.href = href; }, 680);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }
})();
