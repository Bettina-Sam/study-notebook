/**
 * Study Notebook — Mathematics shared helpers
 * Small, dependency-free utilities reused across Algebra module pages:
 * slider binding, MathJax retypeset, progressive step reveal,
 * exercise hint/step/answer wiring, and SVG creation helpers.
 */

const AlgLib = {
    /* Bind an <input type="range"> to a value readout + callback.
       ids: { input: 'input-x', out: 'val-x' } */
    slider(inputId, outId, onChange, opts = {}) {
        const input = document.getElementById(inputId);
        const out = outId ? document.getElementById(outId) : null;
        if (!input) return null;
        const fmt = opts.format || (v => v);
        const fire = () => {
            const v = parseFloat(input.value);
            if (out) out.textContent = fmt(v);
            if (onChange) onChange(v);
        };
        input.addEventListener('input', fire);
        fire();
        return input;
    },

    /* Re-typeset MathJax within a container (or the whole page). Safe to
       call before MathJax finishes loading. */
    typeset(el) {
        const target = el ? [el] : undefined;
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise(target).catch(() => {});
        } else {
            window.addEventListener('load', () => {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise(target).catch(() => {});
                }
            }, { once: true });
        }
    },

    /* Reveal .step-item children of a container one by one. */
    revealSteps(containerId, delay = 320) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = container.querySelectorAll('.step-item');
        items.forEach(i => i.classList.remove('step-in'));
        items.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('step-in');
                this.typeset(item);
            }, i * delay);
        });
    },

    /* Wire a generic exercise card: buttons with data-reveal="panelId"
       toggle a sibling panel; supports a one-way "answer" panel that also
       disables further hint use is left to the caller if desired. */
    wireExercise(cardEl) {
        if (!cardEl) return;
        cardEl.querySelectorAll('[data-reveal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const panel = cardEl.querySelector('#' + btn.dataset.reveal);
                if (!panel) return;
                const opening = !panel.classList.contains('open');
                panel.classList.toggle('open', opening);
                if (opening) this.typeset(panel);
                if (btn.dataset.toggleLabel) {
                    btn.textContent = opening ? btn.dataset.toggleLabel : btn.dataset.originalLabel || btn.textContent;
                }
            });
        });
    },

    /* Small SVG element builder: AlgLib.svg('rect', {x,y,...}) */
    svg(tag, attrs = {}, ns = 'http://www.w3.org/2000/svg') {
        const el = document.createElementNS(ns, tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    },

    /* Create and append multiple children at once. */
    appendAll(parent, children) {
        children.forEach(c => parent.appendChild(c));
        return parent;
    },

    /* Read the current theme's CSS custom property value from <body>. */
    cssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    },

    /* Format a coefficient for display, e.g. -1 -> "-", 1 -> "" */
    coeffStr(c, isFirst = false) {
        if (c === 1) return isFirst ? '' : '+ ';
        if (c === -1) return '- ';
        if (c >= 0) return (isFirst ? '' : '+ ') + c;
        return '- ' + Math.abs(c);
    },

    /* Simple numeric answer checker for try-it-yourself boxes. */
    checkNumeric(inputEl, expected, resultEl, tolerance = 0.001) {
        const val = parseFloat(inputEl.value);
        if (isNaN(val)) {
            resultEl.textContent = 'Enter a number first.';
            resultEl.className = 'check-result';
            return false;
        }
        const ok = Math.abs(val - expected) < tolerance;
        resultEl.textContent = ok ? 'Correct!' : `Not quite — try again.`;
        resultEl.className = 'check-result ' + (ok ? 'check-yes' : 'check-no');
        return ok;
    }
};

window.AlgLib = AlgLib;
