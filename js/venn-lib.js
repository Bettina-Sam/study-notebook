/**
 * Study Notebook — Set Language shared helpers (Chapter 1)
 * A small, dependency-free two-set Venn diagram renderer used across the
 * Set Operations, Properties, De Morgan's Laws and Cardinality modules.
 * Draws circles A and B (optionally inside a universal-set rectangle),
 * places each set's actual elements in the correct region, and can shade
 * any of: union, intersection, A-B, B-A, A', B', symmetric difference.
 */
const VennLib = (() => {
    let uid = 0;

    function circlePath(cx, cy, r) {
        return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
    }

    // Lay a list of elements out as small text labels inside a rectangular zone.
    // Each token pops/settles in with a staggered spring entrance rather than
    // appearing instantly, so the diagram reads as a live scene, not a static
    // picture — elements "arrive" into their region.
    function placeElements(svg, items, zone, cls) {
        if (!items.length) return;
        const cell = 26;
        const cols = Math.max(1, Math.floor(zone.w / cell));
        const rows = Math.ceil(items.length / cols);
        const usedW = Math.min(items.length, cols) * cell;
        const usedH = rows * cell;
        const startX = zone.x + (zone.w - usedW) / 2 + cell / 2;
        const startY = zone.y + (zone.h - usedH) / 2 + cell / 2;
        items.forEach((el, i) => {
            const col = i % cols, row = Math.floor(i / cols);
            const cx = startX + col * cell, cy = startY + row * cell;
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', cx);
            t.setAttribute('y', cy);
            t.setAttribute('class', cls + ' venn-el-pop');
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('dominant-baseline', 'middle');
            t.style.transformOrigin = `${cx}px ${cy}px`;
            t.style.animationDelay = (i * 45) + 'ms';
            t.textContent = el;
            svg.appendChild(t);
        });
    }

    // A gentle idle breathing animation on the circle outlines so the scene
    // feels alive even before the student interacts with it (mirrors the
    // "canvas is already running" feel of the physics simulations).
    function addIdleBreath(paths) {
        paths.forEach((p, i) => {
            p.style.animation = `venn-breathe ${5200 + i * 700}ms ease-in-out ${i * 400}ms infinite`;
        });
    }

    /* Build a two-set Venn diagram.
       opts: { a, b, labelA, labelB, universe: [array|null] }
       returns { svg, highlight(op), clear(), result(op) -> {label, set, n} } */
    function twoSet(container, opts) {
        const id = 'vn' + (uid++);
        const a = opts.a || [], b = opts.b || [];
        const universe = opts.universe || null;
        const labelA = opts.labelA || 'A', labelB = opts.labelB || 'B';
        const W = 340, H = 226;
        const cA = { cx: 132, cy: 112, r: 82 };
        const cB = { cx: 208, cy: 112, r: 82 };
        const uRect = { x: 8, y: 8, w: 324, h: 190 };

        container.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.setAttribute('class', 'venn-svg');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `Venn diagram of sets ${labelA} and ${labelB}`);

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);

        function addMask(maskId, ops) {
            const m = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            m.setAttribute('id', maskId);
            ops.forEach(([d, fill]) => {
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                p.setAttribute('d', d);
                p.setAttribute('fill', fill);
                m.appendChild(p);
            });
            defs.appendChild(m);
        }
        const baseRectD = universe
            ? `M ${uRect.x} ${uRect.y} h ${uRect.w} v ${uRect.h} h ${-uRect.w} Z`
            : `M 0 0 h ${W} v ${H} h ${-W} Z`;
        const dA = circlePath(cA.cx, cA.cy, cA.r);
        const dB = circlePath(cB.cx, cB.cy, cB.r);

        // clip paths for intersection
        const clipA = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipA.id = id + '-clipA';
        const clipAPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        clipAPath.setAttribute('d', dA);
        clipA.appendChild(clipAPath);
        defs.appendChild(clipA);

        // masks for set differences and complements
        addMask(id + '-maskAminusB', [[baseRectD, '#000'], [dA, '#fff'], [dB, '#000']]);
        addMask(id + '-maskBminusA', [[baseRectD, '#000'], [dB, '#fff'], [dA, '#000']]);
        if (universe) {
            addMask(id + '-maskAc', [[baseRectD, '#fff'], [dA, '#000']]);
            addMask(id + '-maskBc', [[baseRectD, '#fff'], [dB, '#000']]);
            // (A∪B)' — universe minus both circles
            addMask(id + '-maskNotUnion', [[baseRectD, '#fff'], [dA, '#000'], [dB, '#000']]);
            // (A∩B)' — universe minus the lens only (B clipped to A, subtracted)
            const notInter = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            notInter.id = id + '-maskNotInter';
            const baseP = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            baseP.setAttribute('d', baseRectD); baseP.setAttribute('fill', '#fff');
            notInter.appendChild(baseP);
            const lensP = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            lensP.setAttribute('d', dB); lensP.setAttribute('fill', '#000');
            lensP.setAttribute('clip-path', `url(#${id}-clipA)`);
            notInter.appendChild(lensP);
            defs.appendChild(notInter);
        }

        if (universe) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', uRect.x); rect.setAttribute('y', uRect.y);
            rect.setAttribute('width', uRect.w); rect.setAttribute('height', uRect.h);
            rect.setAttribute('class', 'venn-universe');
            svg.appendChild(rect);
            const uLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            uLabel.setAttribute('x', uRect.x + 10); uLabel.setAttribute('y', uRect.y + 20);
            uLabel.setAttribute('class', 'venn-ulabel');
            uLabel.textContent = 'U';
            svg.appendChild(uLabel);
        }

        // overlay group (shaded region drawn under the outlines, over the universe)
        const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        overlay.setAttribute('class', 'venn-overlay');
        svg.appendChild(overlay);

        const circlePaths = [];
        [[dA, cA, labelA, 'venn-circle-a'], [dB, cB, labelB, 'venn-circle-b']].forEach(([d, c, lbl, cls]) => {
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d);
            p.setAttribute('class', 'venn-circle ' + cls);
            svg.appendChild(p);
            circlePaths.push(p);
        });
        addIdleBreath(circlePaths);
        const lA = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lA.setAttribute('x', cA.cx - 55); lA.setAttribute('y', cA.cy - 60);
        lA.setAttribute('class', 'venn-setlabel venn-setlabel-a'); lA.textContent = labelA;
        svg.appendChild(lA);
        const lB = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lB.setAttribute('x', cB.cx + 45); lB.setAttribute('y', cB.cy - 60);
        lB.setAttribute('class', 'venn-setlabel venn-setlabel-b'); lB.textContent = labelB;
        svg.appendChild(lB);

        const onlyA = a.filter(x => !b.includes(x));
        const onlyB = b.filter(x => !a.includes(x));
        const both = a.filter(x => b.includes(x));
        const neither = universe ? universe.filter(x => !a.includes(x) && !b.includes(x)) : [];

        placeElements(svg, onlyA, { x: 30, y: 45, w: 75, h: 130 }, 'venn-el');
        placeElements(svg, onlyB, { x: 232, y: 45, w: 75, h: 130 }, 'venn-el');
        placeElements(svg, both, { x: 150, y: 60, w: 40, h: 100 }, 'venn-el venn-el-both');
        if (universe) placeElements(svg, neither, { x: 20, y: 172, w: 300, h: 22 }, 'venn-el venn-el-outside');

        container.appendChild(svg);

        // Crossfade: the previous shade (if any) fades+shrinks out while the
        // new one fades+grows in, instead of an instant swap — this is the
        // difference between "a diagram" and "a diagram that just reacted".
        function clear() {
            [...overlay.children].forEach(node => {
                node.classList.add('venn-shade-out');
                setTimeout(() => node.remove(), 260);
            });
        }
        function mount(node) {
            clear();
            node.classList.add('venn-shade', 'venn-shade-enter');
            overlay.appendChild(node);
            // eslint-disable-next-line no-unused-expressions
            node.getBoundingClientRect(); // force reflow so the enter transition runs
            requestAnimationFrame(() => node.classList.remove('venn-shade-enter'));
        }
        function shade(d, cls, fillRule) {
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d);
            p.setAttribute('class', cls || '');
            if (fillRule) p.setAttribute('fill-rule', fillRule);
            mount(p);
        }
        function shadeMasked(mask, bounds, cls) {
            const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            r.setAttribute('x', bounds.x); r.setAttribute('y', bounds.y);
            r.setAttribute('width', bounds.w); r.setAttribute('height', bounds.h);
            r.setAttribute('mask', `url(#${mask})`);
            r.setAttribute('class', cls || '');
            mount(r);
        }
        function shadeClipped(clip, d, cls) {
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d);
            p.setAttribute('clip-path', `url(#${clip})`);
            p.setAttribute('class', cls || '');
            mount(p);
        }

        const full = universe ? uRect : { x: 0, y: 0, w: W, h: H };

        function highlight(op) {
            switch (op) {
                case 'union': shade(dA + ' ' + dB, 'venn-shade-union'); break;
                case 'intersection': shadeClipped(id + '-clipA', dB, 'venn-shade-inter'); break;
                case 'a-b': shadeMasked(id + '-maskAminusB', full, 'venn-shade-a'); break;
                case 'b-a': shadeMasked(id + '-maskBminusA', full, 'venn-shade-b'); break;
                case 'ac': if (universe) shadeMasked(id + '-maskAc', full, 'venn-shade-a'); break;
                case 'bc': if (universe) shadeMasked(id + '-maskBc', full, 'venn-shade-b'); break;
                case 'not-union': if (universe) shadeMasked(id + '-maskNotUnion', full, 'venn-shade-inter'); break;
                case 'not-inter': if (universe) shadeMasked(id + '-maskNotInter', full, 'venn-shade-inter'); break;
                case 'symdiff': shade(dA + ' ' + dB, 'venn-shade-sym', 'evenodd'); break;
                default: clear();
            }
        }

        function result(op) {
            const U = universe;
            const fmt = arr => `{ ${arr.join(', ')} }`.replace('{  }', '{ }');
            const map = {
                union: { label: `${labelA} ∪ ${labelB}`, set: [...new Set([...a, ...b])] },
                intersection: { label: `${labelA} ∩ ${labelB}`, set: both },
                'a-b': { label: `${labelA} − ${labelB}`, set: onlyA },
                'b-a': { label: `${labelB} − ${labelA}`, set: onlyB },
                symdiff: { label: `${labelA} Δ ${labelB}`, set: [...onlyA, ...onlyB] },
                ac: U ? { label: `${labelA}′`, set: U.filter(x => !a.includes(x)) } : null,
                bc: U ? { label: `${labelB}′`, set: U.filter(x => !b.includes(x)) } : null,
                'not-union': U ? { label: `(${labelA} ∪ ${labelB})′`, set: U.filter(x => !a.includes(x) && !b.includes(x)) } : null,
                'not-inter': U ? { label: `(${labelA} ∩ ${labelB})′`, set: U.filter(x => !(a.includes(x) && b.includes(x))) } : null
            };
            const r = map[op];
            if (!r) return null;
            return { label: r.label, text: fmt(r.set), n: r.set.length };
        }

        return { svg, highlight, clear, result, onlyA, onlyB, both, neither };
    }

    /* Wire a row of operation buttons (data-op="union" etc.) to a diagram + readout element. */
    function wireControls(controlsEl, diagram, readoutEl) {
        controlsEl.querySelectorAll('[data-op]').forEach(btn => {
            btn.addEventListener('click', () => {
                controlsEl.querySelectorAll('[data-op]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const op = btn.dataset.op;
                diagram.highlight(op);
                if (readoutEl) {
                    const r = diagram.result(op);
                    readoutEl.innerHTML = r ? `<b>${r.label}</b> = ${r.text} &nbsp; <span class="venn-count">n = ${r.n}</span>` : 'Not defined without a universal set.';
                }
            });
        });
    }

    /* ---------------------------------------------------------------- */
    /* Three-set Venn diagram engine.                                    */
    /* Every one of the 7 inner regions (+ optional outside region) is   */
    /* built as its own exact mask, so arbitrary compound expressions    */
    /* (associative/distributive/De Morgan comparisons, 3-set word       */
    /* problems) can be shaded by supplying a membership predicate       */
    /* rather than a fixed list of named operations.                     */
    /* opts: { a, b, c, labelA, labelB, labelC, universe }                */
    /* returns { svg, highlight(op|fn), clear(), result(op|fn,label) }    */
    function threeSet(container, opts) {
        const id = 'vn3' + (uid++);
        const a = opts.a || [], b = opts.b || [], c = opts.c || [];
        const universe = opts.universe || null;
        const labelA = opts.labelA || 'A', labelB = opts.labelB || 'B', labelC = opts.labelC || 'C';
        const W = 360, H = 280;
        const r = 92;
        const cA = { cx: 150, cy: 118, r };
        const cB = { cx: 210, cy: 118, r };
        const cC = { cx: 180, cy: 178, r };
        const uRect = { x: 8, y: 8, w: 344, h: 244 };

        container.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.setAttribute('class', 'venn-svg venn-svg-3');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `Venn diagram of sets ${labelA}, ${labelB} and ${labelC}`);

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);

        const dA = circlePath(cA.cx, cA.cy, cA.r);
        const dB = circlePath(cB.cx, cB.cy, cB.r);
        const dC = circlePath(cC.cx, cC.cy, cC.r);
        const dAll = { A: dA, B: dB, C: dC };

        function mkClip(key, d) {
            const cp = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            cp.id = `${id}-clip${key}`;
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d);
            cp.appendChild(p);
            defs.appendChild(cp);
            return cp.id;
        }
        const clipIds = { A: mkClip('A', dA), B: mkClip('B', dB), C: mkClip('C', dC) };

        const baseRectD = universe
            ? `M ${uRect.x} ${uRect.y} h ${uRect.w} v ${uRect.h} h ${-uRect.w} Z`
            : `M 0 0 h ${W} v ${H} h ${-W} Z`;
        const full = universe ? uRect : { x: 0, y: 0, w: W, h: H };

        // Build an exact mask for one region, described by {A:bool,B:bool,C:bool}.
        // Included sets are intersected via nested clip-paths (white); excluded
        // sets are then subtracted (black) on top.
        function regionMaskId(combo) {
            const key = ['A', 'B', 'C'].map(k => combo[k] ? '1' : '0').join('');
            const maskId = `${id}-mask${key}`;
            const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask.id = maskId;
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bg.setAttribute('d', baseRectD); bg.setAttribute('fill', '#000');
            mask.appendChild(bg);

            const included = ['A', 'B', 'C'].filter(k => combo[k]);
            if (included.length) {
                let node = null;
                let innermost = null;
                included.forEach(k => {
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    g.setAttribute('clip-path', `url(#${clipIds[k]})`);
                    if (node) node.appendChild(g); else node = g;
                    innermost = g;
                });
                const whiteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                whiteRect.setAttribute('x', 0); whiteRect.setAttribute('y', 0);
                whiteRect.setAttribute('width', W); whiteRect.setAttribute('height', H);
                whiteRect.setAttribute('fill', '#fff');
                innermost.appendChild(whiteRect);
                mask.appendChild(node);
            } else {
                // "outside all three" region — start from white universe, handled below
                const wr = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                wr.setAttribute('x', full.x); wr.setAttribute('y', full.y);
                wr.setAttribute('width', full.w); wr.setAttribute('height', full.h);
                wr.setAttribute('fill', '#fff');
                mask.appendChild(wr);
            }
            ['A', 'B', 'C'].filter(k => !combo[k]).forEach(k => {
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                p.setAttribute('d', dAll[k]); p.setAttribute('fill', '#000');
                mask.appendChild(p);
            });
            defs.appendChild(mask);
            return maskId;
        }

        const combos = [];
        for (let iA = 0; iA <= 1; iA++) for (let iB = 0; iB <= 1; iB++) for (let iC = 0; iC <= 1; iC++) {
            if (!iA && !iB && !iC && !universe) continue; // "outside" only meaningful with a universe
            combos.push({ A: !!iA, B: !!iB, C: !!iC, mask: regionMaskId({ A: !!iA, B: !!iB, C: !!iC }) });
        }

        if (universe) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', uRect.x); rect.setAttribute('y', uRect.y);
            rect.setAttribute('width', uRect.w); rect.setAttribute('height', uRect.h);
            rect.setAttribute('class', 'venn-universe');
            svg.appendChild(rect);
            const uLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            uLabel.setAttribute('x', uRect.x + 10); uLabel.setAttribute('y', uRect.y + 20);
            uLabel.setAttribute('class', 'venn-ulabel');
            uLabel.textContent = 'U';
            svg.appendChild(uLabel);
        }

        const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        overlay.setAttribute('class', 'venn-overlay');
        svg.appendChild(overlay);

        const circlePaths3 = [];
        [[dA, 'venn-circle-a'], [dB, 'venn-circle-b'], [dC, 'venn-circle-c']].forEach(([d, cls]) => {
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d);
            p.setAttribute('class', 'venn-circle ' + cls);
            svg.appendChild(p);
            circlePaths3.push(p);
        });
        addIdleBreath(circlePaths3);
        [[cA, labelA, -60, -70], [cB, labelB, 60, -70], [cC, labelC, 0, 96]].forEach(([ctr, lbl, dx, dy], i) => {
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', ctr.cx + dx); t.setAttribute('y', ctr.cy + dy);
            t.setAttribute('class', 'venn-setlabel venn-setlabel-' + ['a', 'b', 'c'][i]);
            t.textContent = lbl;
            svg.appendChild(t);
        });

        function inSet(x, s) { return s.includes(x); }
        function comboOf(x) { return { A: inSet(x, a), B: inSet(x, b), C: inSet(x, c) }; }
        function sameCombo(p, q) { return p.A === q.A && p.B === q.B && p.C === q.C; }

        // place each element (from a ∪ b ∪ c ∪ universe-only items) into its region zone
        const zones = {
            '100': { x: 22, y: 40, w: 60, h: 70 }, '010': { x: 278, y: 40, w: 60, h: 70 },
            '001': { x: 150, y: 220, w: 60, h: 46 },
            '110': { x: 140, y: 44, w: 80, h: 46 }, '101': { x: 78, y: 150, w: 60, h: 60 },
            '011': { x: 222, y: 150, w: 60, h: 60 }, '111': { x: 158, y: 130, w: 44, h: 40 },
            '000': { x: 20, y: 254, w: 320, h: 20 }
        };
        const allItems = [...new Set([...a, ...b, ...c, ...(universe || [])])];
        const byRegion = {};
        allItems.forEach(x => {
            const combo = comboOf(x);
            const key = ['A', 'B', 'C'].map(k => combo[k] ? '1' : '0').join('');
            if (key === '000' && !universe) return;
            (byRegion[key] = byRegion[key] || []).push(x);
        });
        Object.entries(byRegion).forEach(([key, items]) => {
            placeElements(svg, items, zones[key], key === '111' ? 'venn-el venn-el-both' : (key === '000' ? 'venn-el venn-el-outside' : 'venn-el'));
        });

        function clear() {
            [...overlay.children].forEach(node => {
                node.classList.add('venn-shade-out');
                setTimeout(() => node.remove(), 260);
            });
        }

        function shadeCombos(matchFn) {
            clear();
            combos.filter(cb => matchFn(cb.A, cb.B, cb.C)).forEach((cb, i) => {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', full.x); rect.setAttribute('y', full.y);
                rect.setAttribute('width', full.w); rect.setAttribute('height', full.h);
                rect.setAttribute('mask', `url(#${cb.mask})`);
                rect.setAttribute('class', 'venn-shade venn-shade-inter venn-shade-enter');
                rect.style.animationDelay = (i * 60) + 'ms';
                overlay.appendChild(rect);
                rect.getBoundingClientRect();
                requestAnimationFrame(() => rect.classList.remove('venn-shade-enter'));
            });
        }

        const NAMED_OPS = {
            'a': (A, B, C) => A, 'b': (A, B, C) => B, 'c': (A, B, C) => C,
            'a-only': (A, B, C) => A && !B && !C, 'b-only': (A, B, C) => !A && B && !C, 'c-only': (A, B, C) => !A && !B && C,
            'ab-only': (A, B, C) => A && B && !C, 'ac-only': (A, B, C) => A && !B && C, 'bc-only': (A, B, C) => !A && B && C,
            'abc': (A, B, C) => A && B && C,
            'union': (A, B, C) => A || B || C,
            'intersection': (A, B, C) => A && B && C,
            'outside': (A, B, C) => !A && !B && !C
        };

        function resolvePredicate(op) { return typeof op === 'function' ? op : NAMED_OPS[op]; }

        function highlight(op) {
            const fn = resolvePredicate(op);
            if (!fn) { clear(); return; }
            shadeCombos(fn);
        }

        function result(op, label) {
            const fn = resolvePredicate(op);
            if (!fn) return null;
            const set = allItems.filter(x => { const cb = comboOf(x); return fn(cb.A, cb.B, cb.C); });
            const fmt = arr => `{ ${arr.join(', ')} }`.replace('{  }', '{ }');
            return { label: label || (typeof op === 'string' ? op : 'expression'), text: fmt(set), n: set.length, set };
        }

        container.appendChild(svg);
        return { svg, highlight, clear, result, onlyA: byRegion['100'] || [], onlyB: byRegion['010'] || [], onlyC: byRegion['001'] || [], all3: byRegion['111'] || [] };
    }

    return { twoSet, threeSet, wireControls, circlePath };
})();

window.VennLib = VennLib;
