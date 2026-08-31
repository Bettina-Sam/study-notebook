/**
 * Study Notebook — Set Language exercise interaction helpers (Chapter 1)
 * Small, dependency-free building blocks that exercise pages compose from
 * DATA (question text, expected answer, hint text, item lists) rather than
 * bespoke per-question JavaScript. Pairs with VennLib (js/venn-lib.js) for
 * diagram-based questions and AlgLib (js/algebra-lib.js) for hint/step
 * reveal panels.
 */
const ExLib = (() => {

    /* Turn "{2, 3, 5}" / "2,3,5" / "2 3 5" into a deduped array of trimmed
       tokens (order-insensitive, so it works for both numbers and letters). */
    function parseSetInput(str) {
        return [...new Set(
            String(str || '')
                .replace(/[{}]/g, '')
                .split(/[,\s]+/)
                .map(s => s.trim())
                .filter(Boolean)
        )];
    }

    function sameSet(actual, expected) {
        const a = new Set(actual.map(String));
        const e = new Set(expected.map(String));
        return a.size === e.size && [...e].every(x => a.has(x));
    }

    /* Wire a set-valued answer box: reads inputEl, compares (order/duplicate
       -insensitive) against expectedArr, writes feedback into resultEl. */
    function checkSetAnswer(inputEl, expectedArr, resultEl) {
        const given = parseSetInput(inputEl.value);
        if (!given.length) {
            resultEl.textContent = 'Enter the elements first, e.g. {2, 3, 5}';
            resultEl.className = 'check-result';
            return false;
        }
        const ok = sameSet(given, expectedArr);
        resultEl.textContent = ok
            ? 'Correct!'
            : `Not quite — you have ${given.length} element${given.length === 1 ? '' : 's'}, check membership again.`;
        resultEl.className = 'check-result ' + (ok ? 'check-yes' : 'check-no');
        return ok;
    }

    /* Wire a free-text answer box against one or more accepted strings
       (case/space-insensitive). variants: string | string[] */
    function checkTextAnswer(inputEl, variants, resultEl) {
        const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const given = norm(inputEl.value);
        const accepted = (Array.isArray(variants) ? variants : [variants]).map(norm);
        if (!given) {
            resultEl.textContent = 'Type your answer first.';
            resultEl.className = 'check-result';
            return false;
        }
        const ok = accepted.includes(given);
        resultEl.textContent = ok ? 'Correct!' : 'Not quite — try again.';
        resultEl.className = 'check-result ' + (ok ? 'check-yes' : 'check-no');
        return ok;
    }

    /* Wire a single-choice tile group (buttons/divs with data-value) —
       replaces plain radio lists with clickable cards. On pick, marks the
       chosen tile + the correct tile, disables the rest, calls onAnswer. */
    function tileChoice(containerEl, correctValue, opts = {}) {
        const tiles = [...containerEl.querySelectorAll('[data-value]')];
        let answered = false;
        tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                const ok = tile.dataset.value === String(correctValue);
                tiles.forEach(t => {
                    t.classList.add('disabled');
                    if (t.dataset.value === String(correctValue)) t.classList.add('tile-correct');
                });
                if (!ok) tile.classList.add('tile-wrong');
                if (opts.onAnswer) opts.onAnswer(ok, tile.dataset.value);
            });
        });
        return { reset() { answered = false; tiles.forEach(t => t.classList.remove('disabled', 'tile-correct', 'tile-wrong')); } };
    }

    /* Drag-and-drop classifier: drag each item chip into one of several
       bins; checks against item.bin. items: [{id,label,bin}], bins: NodeList
       of drop targets carrying data-bin="<binName>". */
    function dragClassify(sourceEl, itemsEl, bins, items, opts = {}) {
        itemsEl.innerHTML = '';
        items.forEach(item => {
            const chip = document.createElement('div');
            chip.className = 'drag-chip';
            chip.textContent = item.label;
            chip.draggable = true;
            chip.dataset.id = item.id;
            chip.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', item.id);
                setTimeout(() => chip.classList.add('dragging'), 0);
            });
            chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
            itemsEl.appendChild(chip);
        });

        let placed = 0;
        bins.forEach(bin => {
            bin.addEventListener('dragover', e => { e.preventDefault(); bin.classList.add('drag-over'); });
            bin.addEventListener('dragleave', () => bin.classList.remove('drag-over'));
            bin.addEventListener('drop', e => {
                e.preventDefault();
                bin.classList.remove('drag-over');
                const id = e.dataTransfer.getData('text/plain');
                const chip = itemsEl.querySelector(`[data-id="${CSS.escape(id)}"]`);
                const item = items.find(i => i.id === id);
                if (!chip || !item || chip.classList.contains('placed')) return;
                const ok = item.bin === bin.dataset.bin;
                if (ok) {
                    chip.classList.add('placed', 'chip-correct', 'chip-pop');
                    chip.draggable = false;
                    bin.appendChild(chip);
                    bin.classList.add('bin-pulse');
                    setTimeout(() => bin.classList.remove('bin-pulse'), 420);
                    placed++;
                    if (opts.onPlace) opts.onPlace(item, true, placed, items.length);
                    if (placed === items.length && opts.onComplete) opts.onComplete();
                } else {
                    chip.classList.add('chip-shake');
                    setTimeout(() => chip.classList.remove('chip-shake'), 420);
                    if (opts.onPlace) opts.onPlace(item, false, placed, items.length);
                }
            });
        });
    }

    /* Numeric-fill Venn: given regionValues {onlyA,onlyB,both,neither}, wire
       four inputs (ids passed in) so students fill counts in the textbook's
       logical order and get per-region + total feedback. */
    function cardinalityFill(ids, correct, resultEl) {
        const inputs = Object.fromEntries(Object.entries(ids).map(([k, id]) => [k, document.getElementById(id)]));
        function check() {
            const entries = Object.entries(correct);
            const wrong = entries.filter(([k, v]) => parseInt(inputs[k]?.value, 10) !== v);
            entries.forEach(([k]) => inputs[k]?.classList.remove('input-correct', 'input-wrong'));
            wrong.forEach(([k]) => inputs[k]?.classList.add('input-wrong'));
            entries.filter(([k]) => !wrong.find(w => w[0] === k)).forEach(([k]) => inputs[k]?.classList.add('input-correct'));
            const ok = wrong.length === 0;
            resultEl.textContent = ok ? 'All regions correct!' : `${entries.length - wrong.length} / ${entries.length} regions correct so far.`;
            resultEl.className = 'check-result ' + (ok ? 'check-yes' : 'check-no');
            return ok;
        }
        return { check };
    }

    /* Physics-based two-bin sorter (needs js/token-physics.js loaded first).
       Builds a TokenPhysics stage inside containerEl with two zones side by
       side; each item becomes a flingable token the student drags into the
       zone they think it belongs in — real drag momentum, not click-to-sort.
       items: [{id, label, correct: <first or second zoneKey>, ...}]
       zoneLabels: [labelForZone1, labelForZone2]
       opts: { height, zoneKeys: [key1, key2], onPlace(item, ok, placed, total), onComplete() } */
    function physicsSorter(containerEl, items, zoneLabels, opts = {}) {
        const height = opts.height || 340;
        const zoneKeys = opts.zoneKeys || ['set', 'notset'];
        const stage = TokenPhysics.createStage(containerEl, { height });

        const zoneEls = zoneLabels.map(label => {
            const el = document.createElement('div');
            el.className = 'phys-zone';
            el.innerHTML = `<span class="phys-zone-label">${label}</span>`;
            containerEl.appendChild(el);
            return el;
        });

        const poolTop = opts.poolTop || Math.round(height * 0.62);

        function layout() {
            const w = containerEl.clientWidth || 600;
            const gap = 14;
            const zw = (w - gap * 3) / 2;
            const zh = poolTop - 22;
            zoneEls[0].style.cssText = `left:${gap}px; top:12px; width:${zw}px; height:${zh}px;`;
            zoneEls[1].style.cssText = `left:${gap * 2 + zw}px; top:12px; width:${zw}px; height:${zh}px;`;
        }
        layout();
        window.addEventListener('resize', layout);

        function hitTest(el) {
            return (x, y) => {
                const c = containerEl.getBoundingClientRect();
                const r = el.getBoundingClientRect();
                const rx = r.left - c.left, ry = r.top - c.top;
                return x >= rx && x <= rx + r.width && y >= ry && y <= ry + r.height;
            };
        }
        const zones = zoneEls.map((el, i) => stage.addZone({ test: hitTest(el), el, key: zoneKeys[i] }));

        const w0 = containerEl.clientWidth || 600;
        const tokens = items.map(item => {
            const x = 24 + Math.random() * (w0 - 48);
            const y = poolTop + 18 + Math.random() * (height - poolTop - 36);
            const t = stage.addToken(item.id, item.label, { x, y, cls: 'phys-token-chip' });
            t.item = item;
            return t;
        });

        const settledCount = {};
        function nextSlot(zoneEl, key) {
            const n = settledCount[key] || 0;
            settledCount[key] = n + 1;
            const perRow = 2;
            const col = n % perRow, row = Math.floor(n / perRow);
            const zx = parseFloat(zoneEl.style.left), zy = parseFloat(zoneEl.style.top);
            return { x: zx + 38 + col * 78, y: zy + 34 + row * 52 };
        }

        let placed = 0;
        stage.onDrop((token, zone) => {
            const item = token.item;
            const ok = !!zone && zone.key === item.correct;
            if (ok) {
                token.el.classList.remove('phys-wrong');
                token.el.classList.add('phys-correct');
                const idx = zones.indexOf(zone);
                const slot = nextSlot(zoneEls[idx], zone.key);
                stage.snapTo(token, slot.x, slot.y);
                placed++;
                if (opts.onPlace) opts.onPlace(item, true, placed, items.length);
                if (placed === items.length && opts.onComplete) opts.onComplete();
            } else {
                token.el.classList.remove('phys-correct');
                token.el.classList.add('phys-wrong');
                setTimeout(() => token.el.classList.remove('phys-wrong'), 450);
                stage.release(token);
                if (opts.onPlace) opts.onPlace(item, false, placed, items.length);
            }
        });

        return { stage, tokens, zones };
    }

    return { parseSetInput, sameSet, checkSetAnswer, checkTextAnswer, tileChoice, dragClassify, cardinalityFill, physicsSorter };
})();

window.ExLib = ExLib;
