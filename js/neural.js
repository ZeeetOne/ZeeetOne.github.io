/* Neural-network hero canvas — the page's signature element.
   Loaded by index.html (<script src="js/neural.js" defer>); replaces the
   old Three.js hero (js/three-hero.js). Dependency-free 2D canvas:
   drifting nodes, proximity edges, accent-colored signal pulses that
   propagate node-to-node, and gentle cursor interaction. */

(function () {
    "use strict";

    var canvas = document.getElementById("neural-canvas");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var INK = "25, 28, 31"; // node/edge base color (rgb)
    var ACCENT = "14, 124, 102"; // pulse color (rgb)
    var LINK_DIST = 140;
    var MOUSE_R = 170;

    var W = 0,
        H = 0,
        dpr = 1;
    var nodes = [];
    var pulses = [];
    var rings = [];
    var mouse = { x: -1e4, y: -1e4 };
    var running = false;
    var rafId = 0;
    var lastSpawn = 0;

    function resize() {
        var rect = canvas.parentElement.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = rect.width;
        H = rect.height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
        if (reduced) drawFrame(); // static single frame
    }

    function seed() {
        var count = Math.max(36, Math.min(96, Math.round((W * H) / 16000)));
        nodes = [];
        for (var i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                r: 1.3 + Math.random() * 1.5,
            });
        }
        pulses = [];
        rings = [];
    }

    function neighborsOf(i) {
        var out = [];
        var a = nodes[i];
        for (var j = 0; j < nodes.length; j++) {
            if (j === i) continue;
            var b = nodes[j];
            var dx = a.x - b.x,
                dy = a.y - b.y;
            if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) out.push(j);
        }
        return out;
    }

    function spawnPulse(now) {
        if (pulses.length >= 8) return;
        var from = Math.floor(Math.random() * nodes.length);
        var ns = neighborsOf(from);
        if (!ns.length) return;
        pulses.push({
            from: from,
            to: ns[Math.floor(Math.random() * ns.length)],
            t: 0,
            speed: 0.008 + Math.random() * 0.008,
            hops: 2 + Math.floor(Math.random() * 3),
        });
        lastSpawn = now;
    }

    function step() {
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            // slight pull toward the cursor
            var mdx = mouse.x - n.x,
                mdy = mouse.y - n.y;
            var md2 = mdx * mdx + mdy * mdy;
            if (md2 < MOUSE_R * MOUSE_R) {
                var md = Math.sqrt(md2) || 1;
                n.vx += (mdx / md) * 0.004;
                n.vy += (mdy / md) * 0.004;
            }
            n.x += n.vx;
            n.y += n.vy;
            // soft speed decay
            n.vx *= 0.995;
            n.vy *= 0.995;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
            n.x = Math.max(0, Math.min(W, n.x));
            n.y = Math.max(0, Math.min(H, n.y));
        }

        for (var p = pulses.length - 1; p >= 0; p--) {
            var pu = pulses[p];
            pu.t += pu.speed * 3;
            if (pu.t >= 1) {
                var arrived = pu.to;
                rings.push({
                    x: nodes[arrived].x,
                    y: nodes[arrived].y,
                    r: 2,
                    alpha: 0.5,
                });
                pu.hops--;
                if (pu.hops > 0) {
                    var ns = neighborsOf(arrived).filter(function (j) {
                        return j !== pu.from;
                    });
                    if (ns.length) {
                        pu.from = arrived;
                        pu.to = ns[Math.floor(Math.random() * ns.length)];
                        pu.t = 0;
                        continue;
                    }
                }
                pulses.splice(p, 1);
            }
        }

        for (var r = rings.length - 1; r >= 0; r--) {
            rings[r].r += 0.7;
            rings[r].alpha *= 0.94;
            if (rings[r].alpha < 0.02) rings.splice(r, 1);
        }
    }

    function drawFrame() {
        ctx.clearRect(0, 0, W, H);

        // edges
        for (var i = 0; i < nodes.length; i++) {
            var a = nodes[i];
            for (var j = i + 1; j < nodes.length; j++) {
                var b = nodes[j];
                var dx = a.x - b.x,
                    dy = a.y - b.y;
                var d2 = dx * dx + dy * dy;
                if (d2 > LINK_DIST * LINK_DIST) continue;
                var d = Math.sqrt(d2);
                var alpha = (1 - d / LINK_DIST) * 0.17;
                // edges near the cursor glow with the accent
                var mx = (a.x + b.x) / 2 - mouse.x,
                    my = (a.y + b.y) / 2 - mouse.y;
                if (mx * mx + my * my < MOUSE_R * MOUSE_R) {
                    ctx.strokeStyle =
                        "rgba(" + ACCENT + "," + alpha * 2.4 + ")";
                } else {
                    ctx.strokeStyle = "rgba(" + INK + "," + alpha + ")";
                }
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // nodes
        for (var k = 0; k < nodes.length; k++) {
            var n = nodes[k];
            ctx.fillStyle = "rgba(" + INK + ",0.4)";
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // signal pulses
        for (var p = 0; p < pulses.length; p++) {
            var pu = pulses[p];
            var fa = nodes[pu.from],
                fb = nodes[pu.to];
            var t = Math.min(pu.t, 1);
            var x = fa.x + (fb.x - fa.x) * t;
            var y = fa.y + (fb.y - fa.y) * t;
            var glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
            glow.addColorStop(0, "rgba(" + ACCENT + ",0.85)");
            glow.addColorStop(1, "rgba(" + ACCENT + ",0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(" + ACCENT + ",0.95)";
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // firing rings
        for (var r = 0; r < rings.length; r++) {
            var ring = rings[r];
            ctx.strokeStyle = "rgba(" + ACCENT + "," + ring.alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function loop(now) {
        if (!running) return;
        if (now - lastSpawn > 480) spawnPulse(now);
        step();
        drawFrame();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (running || reduced) return;
        running = true;
        rafId = requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(rafId);
    }

    window.addEventListener("resize", resize);

    canvas.parentElement.addEventListener("pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener("pointerleave", function () {
        mouse.x = -1e4;
        mouse.y = -1e4;
    });

    // only animate while the hero is on screen and the tab is visible
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(
            function (entries) {
                entries[0].isIntersecting ? start() : stop();
            },
            { threshold: 0.05 }
        ).observe(canvas.parentElement);
    } else {
        start();
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else if (canvas.getBoundingClientRect().bottom > 0) start();
    });

    resize();
})();
