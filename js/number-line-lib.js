/**
 * Study Notebook — Real Numbers shared helpers (Chapter 2)
 * A small, dependency-free interactive number line: draggable points with
 * real pointer tracking (not click-to-set), live value readout, and
 * zoom/inspect support for showing decimal expansions at high precision —
 * used across Rational/Irrational, the Real Number Line, and Surds modules.
 */
const NumberLineLib = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs = {}) => {
        const n = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
        return n;
    };

    /* opts: { min, max, height, step (tick spacing), labelEvery } */
    function create(container, opts = {}) {
        const min = opts.min ?? -5, max = opts.max ?? 5;
        const H = opts.height || 110;
        const W = 640;
        const padX = 30;
        const y0 = H / 2 + 8;

        container.innerHTML = '';
        container.classList.add('numline-wrap');
        const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'numline-svg', role: 'img' });
        container.appendChild(svg);

        const valueToX = v => padX + ((v - min) / (max - min)) * (W - 2 * padX);
        const xToValue = x => min + ((x - padX) / (W - 2 * padX)) * (max - min);

        // axis
        svg.appendChild(el('line', { x1: padX, y1: y0, x2: W - padX, y2: y0, class: 'numline-axis' }));
        for (let v = Math.ceil(min); v <= Math.floor(max); v++) {
            const x = valueToX(v);
            svg.appendChild(el('line', { x1: x, y1: y0 - 7, x2: x, y2: y0 + 7, class: 'numline-tick' + (v === 0 ? ' numline-tick-zero' : '') }));
            const t = el('text', { x, y: y0 + 24, class: 'numline-ticklabel', 'text-anchor': 'middle' });
            t.textContent = v;
            svg.appendChild(t);
        }
        [['<', min - 0.4], ['>', max + 0.15]].forEach(() => {});
        const arrowL = el('polygon', { points: `${padX - 8},${y0} ${padX + 4},${y0 - 5} ${padX + 4},${y0 + 5}`, class: 'numline-arrow' });
        const arrowR = el('polygon', { points: `${W - padX + 8},${y0} ${W - padX - 4},${y0 - 5} ${W - padX - 4},${y0 + 5}`, class: 'numline-arrow' });
        svg.appendChild(arrowL); svg.appendChild(arrowR);

        const points = [];

        function addPoint(id, value, o = {}) {
            const g = el('g', { class: 'numline-point' + (o.cls ? ' ' + o.cls : ''), tabindex: '0' });
            const circle = el('circle', { r: 9, cy: y0 });
            const label = el('text', { y: y0 - 16, 'text-anchor': 'middle', class: 'numline-plabel' });
            label.textContent = o.label ?? value;
            g.appendChild(circle); g.appendChild(label);
            svg.appendChild(g);
            const p = { id, value, g, circle, label, min, max, dragging: false, fixed: !!o.fixed };
            points.push(p);
            render(p);
            if (!p.fixed) bindDrag(p, o.onChange);
            return p;
        }

        function render(p) {
            const x = Math.max(padX, Math.min(W - padX, valueToX(p.value)));
            p.g.setAttribute('transform', `translate(${x},0)`);
            if (p.labelFmt) p.label.textContent = p.labelFmt(p.value); else p.label.textContent = p.o_label ?? round(p.value);
        }
        function round(v) { return Math.round(v * 1000) / 1000; }

        function bindDrag(p, onChange) {
            let active = false;
            const move = (clientX) => {
                const rect = svg.getBoundingClientRect();
                const localX = (clientX - rect.left) / rect.width * W;
                p.value = Math.max(min, Math.min(max, xToValue(localX)));
                render(p);
                if (onChange) onChange(p.value, p);
            };
            p.g.style.cursor = 'grab';
            p.g.addEventListener('pointerdown', e => { active = true; p.g.setPointerCapture(e.pointerId); p.g.classList.add('numline-dragging'); e.preventDefault(); });
            p.g.addEventListener('pointermove', e => { if (active) move(e.clientX); });
            p.g.addEventListener('pointerup', () => { active = false; p.g.classList.remove('numline-dragging'); });
            p.g.addEventListener('touchstart', e => { active = true; move(e.touches[0].clientX); }, { passive: true });
            p.g.addEventListener('touchmove', e => { if (active) move(e.touches[0].clientX); }, { passive: true });
            window.addEventListener('touchend', () => active = false);
        }

        function setValue(p, v) { p.value = v; render(p); }
        function markInterval(fromV, toV, cls) {
            const x1 = valueToX(fromV), x2 = valueToX(toV);
            svg.appendChild(el('rect', { x: Math.min(x1, x2), y: y0 - 3, width: Math.abs(x2 - x1), height: 6, class: 'numline-interval ' + (cls || '') }));
        }

        return { svg, valueToX, xToValue, addPoint, setValue, markInterval, points };
    }

    return { create };
})();

window.NumberLineLib = NumberLineLib;
