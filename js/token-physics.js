/**
 * Study Notebook — Set Language token-physics engine (Chapter 1)
 * A small, dependency-free 2D drag-physics engine: tokens have real
 * position/velocity, drift idly when free, carry momentum from how you
 * threw them, and spring-settle into a drop zone when released over one.
 * Runs a continuous requestAnimationFrame loop (like the Physics chapter's
 * canvas simulations) rather than snapping to state on click.
 *
 * Usage:
 *   const stage = TokenPhysics.createStage(containerEl, { height: 320 });
 *   const zoneA = stage.addZone({ test: (x,y) => inCircleA(x,y), el: circleEl });
 *   const tok = stage.addToken('t1', '7', { x: 40, y: 40 });
 *   stage.onDrop((token, zone) => { ... snap or reject ... });
 *   stage.snapTo(tok, 120, 90);   // spring the token toward a point
 *   stage.release(tok);           // let it drift/rest freely again
 */
const TokenPhysics = (() => {

    function createStage(container, opts = {}) {
        const height = opts.height || 300;
        container.innerHTML = '';
        container.classList.add('phys-stage');
        container.style.height = height + 'px';

        const width = () => container.clientWidth || opts.width || 400;
        const tokens = new Map();
        const zones = [];
        let running = true;
        let onDropCb = null, onOverCb = null;

        function zoneAt(t) {
            return zones.find(z => z.test(t.x, t.y)) || null;
        }

        function rectZone(rect) {
            return (x, y) => x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
        }
        function circleZone(cx, cy, r) {
            return (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
        }

        function addZone(zone) { zones.push(zone); return zone; }

        function bindDrag(t) {
            let moves = [];
            const onDown = e => {
                t.dragging = true;
                t.el.setPointerCapture && t.el.setPointerCapture(e.pointerId);
                t.el.classList.add('phys-grabbed');
                t.targetX = null; t.targetY = null;
                moves = [];
                e.preventDefault();
            };
            const onMove = e => {
                if (!t.dragging) return;
                const rect = container.getBoundingClientRect();
                const nx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
                const ny = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
                const now = performance.now();
                moves.push({ x: nx, y: ny, t: now });
                if (moves.length > 5) moves.shift();
                t.x = nx; t.y = ny;
                const zone = zoneAt(t);
                zones.forEach(z => z.el && z.el.classList.toggle('phys-zone-active', z === zone));
                if (onOverCb) onOverCb(t, zone);
            };
            const onUp = () => {
                if (!t.dragging) return;
                t.dragging = false;
                t.el.classList.remove('phys-grabbed');
                if (moves.length >= 2) {
                    const a = moves[0], b = moves[moves.length - 1];
                    const dt = Math.max(8, b.t - a.t);
                    t.vx = (b.x - a.x) / dt * 14;
                    t.vy = (b.y - a.y) / dt * 14;
                } else { t.vx = 0; t.vy = 0; }
                const zone = zoneAt(t);
                zones.forEach(z => z.el && z.el.classList.remove('phys-zone-active'));
                if (onDropCb) onDropCb(t, zone);
            };
            t.el.addEventListener('pointerdown', onDown);
            t.el.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            t.el.addEventListener('touchstart', onDown, { passive: false });
            t.el.addEventListener('touchmove', onMove, { passive: false });
            window.addEventListener('touchend', onUp);
        }

        function addToken(id, label, o = {}) {
            const el = document.createElement('div');
            el.className = 'phys-token' + (o.cls ? ' ' + o.cls : '');
            el.textContent = label;
            container.appendChild(el);
            const t = {
                id, el, label,
                x: o.x ?? Math.random() * (width() - 40) + 20,
                y: o.y ?? Math.random() * (height - 40) + 20,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                idlePhase: Math.random() * Math.PI * 2,
                dragging: false, targetX: null, targetY: null, locked: false
            };
            tokens.set(id, t);
            bindDrag(t);
            return t;
        }

        function removeToken(t) {
            tokens.delete(t.id);
            t.el.remove();
        }

        function snapTo(t, x, y) { t.targetX = x; t.targetY = y; t.locked = false; }
        function lockAt(t, x, y) { t.x = x; t.y = y; t.targetX = null; t.targetY = null; t.vx = 0; t.vy = 0; t.locked = true; }
        function release(t) { t.targetX = null; t.targetY = null; t.locked = false; }

        function step() {
            if (!running) return;
            const w = width();
            tokens.forEach(t => {
                if (t.dragging || t.locked) { /* position set externally */ }
                else if (t.targetX != null) {
                    const dx = t.targetX - t.x, dy = t.targetY - t.y;
                    t.vx = (t.vx + dx * 0.025) * 0.72;
                    t.vy = (t.vy + dy * 0.025) * 0.72;
                    t.x += t.vx; t.y += t.vy;
                } else {
                    t.vx *= 0.945; t.vy *= 0.945;
                    t.idlePhase += 0.018;
                    t.x += t.vx + Math.sin(t.idlePhase) * 0.12;
                    t.y += t.vy + Math.cos(t.idlePhase * 0.83) * 0.12;
                    t.x = Math.max(18, Math.min(w - 18, t.x));
                    t.y = Math.max(18, Math.min(height - 18, t.y));
                }
                t.el.style.transform = `translate(${t.x - 18}px, ${t.y - 18}px)`;
            });
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);

        return {
            addToken, removeToken, addZone, rectZone, circleZone, zoneAt,
            snapTo, lockAt, release,
            onDrop(cb) { onDropCb = cb; }, onOver(cb) { onOverCb = cb; },
            tokens, zones,
            destroy() { running = false; }
        };
    }

    return { createStage };
})();

window.TokenPhysics = TokenPhysics;
