/**
 * Study Notebook — Real Numbers decimal-expansion helpers (Chapter 2)
 * Computes a fraction's long-division steps digit-by-digit and detects
 * exactly when a remainder repeats (proving the decimal is recurring) or
 * terminates (remainder hits 0) — then animates the steps one at a time so
 * a student watches periodicity happen instead of being told about it.
 */
const DecimalLib = (() => {

    /* p/q (q>0) -> { whole, digits:[...], repeatStart: index|null, terminates: bool } */
    function longDivide(p, q, maxDigits = 24) {
        const whole = Math.trunc(p / q);
        let remainder = Math.abs(p) % q;
        const digits = [];
        const seen = new Map(); // remainder -> digit index where it first appeared
        let repeatStart = null;
        let terminates = false;

        for (let i = 0; i < maxDigits; i++) {
            if (remainder === 0) { terminates = true; break; }
            if (seen.has(remainder)) { repeatStart = seen.get(remainder); break; }
            seen.set(remainder, i);
            remainder *= 10;
            const digit = Math.floor(remainder / q);
            digits.push({ digit, remainderBefore: remainder, remainderAfter: remainder % q });
            remainder = remainder % q;
        }
        return { whole, digits, repeatStart, terminates };
    }

    function formatResult(res) {
        const digitStr = res.digits.map(d => d.digit).join('');
        if (res.terminates) return `${res.whole}.${digitStr}`;
        if (res.repeatStart != null) {
            const nonRepeat = digitStr.slice(0, res.repeatStart);
            const repeat = digitStr.slice(res.repeatStart);
            return `${res.whole}.${nonRepeat}${repeat ? '(' + repeat + ')' : ''}…`;
        }
        return `${res.whole}.${digitStr}…`;
    }

    /* Render an animated step-by-step long-division trace into containerEl.
       Each step pops in with a short delay; once a repeated remainder is
       found, both occurrences are highlighted and connected visually. */
    function animate(containerEl, p, q, opts = {}) {
        const res = longDivide(p, q, opts.maxDigits || 24);
        containerEl.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'decimal-trace';
        containerEl.appendChild(wrap);

        const head = document.createElement('div');
        head.className = 'decimal-trace-head';
        head.innerHTML = `<span class="decimal-frac">${p}/${q}</span> <span class="decimal-arrow">→</span> <span class="decimal-result" id="dtResult-${Date.now()}"></span>`;
        wrap.appendChild(head);
        const resultEl = head.querySelector('.decimal-result');

        const stepsEl = document.createElement('div');
        stepsEl.className = 'decimal-steps';
        wrap.appendChild(stepsEl);

        res.digits.forEach((d, i) => {
            const row = document.createElement('div');
            row.className = 'decimal-step';
            row.style.animationDelay = (i * 260) + 'ms';
            row.innerHTML = `<span class="decimal-step-num">${i + 1}</span>` +
                `<span class="decimal-step-math">${d.remainderBefore} ÷ ${q} = <b>${d.digit}</b>, remainder ${d.remainderAfter}</span>`;
            stepsEl.appendChild(row);
            if (res.repeatStart === i) {
                row.classList.add('decimal-step-repeat-new');
                const flag = document.createElement('div');
                flag.className = 'decimal-repeat-flag';
                flag.style.animationDelay = ((i + 1) * 260) + 'ms';
                flag.textContent = `Remainder ${d.remainderAfter} already appeared at step ${res.repeatStart + 1} — the digits from here repeat forever.`;
                stepsEl.appendChild(flag);
                stepsEl.children[res.repeatStart].classList.add('decimal-step-repeat-orig');
            }
        });

        setTimeout(() => {
            resultEl.textContent = formatResult(res);
            resultEl.classList.add('decimal-result-in');
        }, (res.digits.length + 1) * 260);

        return res;
    }

    return { longDivide, formatResult, animate };
})();

window.DecimalLib = DecimalLib;
