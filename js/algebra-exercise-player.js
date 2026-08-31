(function(){
const hints={
ex31:['Check the powers first. Polynomial powers must be whole numbers ≥ 0.','For degree, standardise first; for addition/subtraction combine only like terms.'],
ex32:['Substitute the given value everywhere the variable occurs.','A zero makes P(x)=0; on a graph it is an x-axis crossing.'],
ex33:['For divisor (x−a), evaluate P(a).','If the remainder is 0, the divisor is a factor.'],
ex34:['Match the expression to a known identity before expanding.','For three terms, track square terms and the three pair-products carefully.'],
ex35:['Factorisation reverses multiplication. Look for a common factor or identity first.','For quadratic trinomials, split the middle term using numbers with the correct sum and product.'],
ex36:['For ax²+bx+c, multiply a·c and hunt for a pair whose sum is b.','After splitting the middle term, group in pairs and take common factors.'],
ex37:['Write Dividend = Divisor×Quotient + Remainder.','For synthetic division, include 0 for a missing power.'],
ex38:['Test easy integer zeroes first; once one factor is found, synthetic division reduces the cubic.','Remember: x−a is a factor exactly when P(a)=0.'],
ex39:['Factor each expression fully first.','For variables, the common factor uses the smallest exponent shared by all expressions.'],
ex310:['Generate at least two ordered pairs for each line and plot them.','The intersection point, if any, is the simultaneous solution.'],
ex311:['Express one variable in terms of the other, then substitute.','After finding one variable, substitute back and verify both equations.'],
ex312:['Multiply equations so one pair of coefficients becomes equal or opposite.','Add/subtract to eliminate one variable, then back-substitute.'],
ex313:['First write both equations in ax+by+c=0 form.','Use the coefficient cross-products carefully; verify the result in both equations.'],
ex314:['Translate the words into two equations before choosing a solving method.','Label unknowns clearly and verify the final values in the original story.'],
ex315:['Treat each MCQ as a mini concept check; eliminate impossible options first.','Use the shortest theorem or identity rather than doing unnecessary long algebra.']};
function splitQuestions(text){
  text=text.replace(/\r/g,'').trim();
  const lines=text.split('\n'); let arr=[],cur=[];
  for(let line of lines){
    if(/^\s*Exercise\s+3\./i.test(line)) continue;
    if(/^\s*\d+\.\s+/.test(line) && cur.length){arr.push(cur.join('\n').trim());cur=[line.trim()];}
    else if(line.trim()) cur.push(line.trimEnd());
  }
  if(cur.length) arr.push(cur.join('\n').trim());
  return arr.length?arr:[text];
}
function labHTML(id){
 const n=id.replace('ex3','');
 const title={1:'Polynomial Sorter',2:'Zero Explorer',3:'Remainder Machine',4:'Identity Tiles',5:'Factor Finder',6:'Middle-Term Hunt',7:'Division Stepper',8:'Synthetic Factor Hunt',9:'GCD Scanner',10:'Graph Lab',11:'Substitution Lab',12:'Elimination Lab',13:'Cross-Multiplication Lab',14:'Story → Equations',15:'MCQ Sprint'}[+n]||'Algebra Lab';
 let body='';
 if(+n===2) body=`<div class="lab-action">DRAG x · WATCH P(x)</div><input class="lab-slider" data-lab="zero" min="-3" max="6" value="1" step="1" type="range"><div class="lab-output"></div>`;
 else if(+n===3) body=`<div class="lab-action">CHANGE a · SEE THE REMAINDER</div><label>For P(x)=x²−5x+6 divided by (x−a)</label><input class="lab-slider" data-lab="rem" min="-2" max="6" value="2" step="1" type="range"><div class="lab-output"></div>`;
 else if(+n===4) body=`<div class="lab-action">DRAG a AND b · WATCH THE AREA IDENTITY</div><div class="lab-grid"><div class="lab-card">a <input data-lab="ia" class="lab-slider" type="range" min="1" max="8" value="4"></div><div class="lab-card">b <input data-lab="ib" class="lab-slider" type="range" min="1" max="8" value="3"></div></div><div class="lab-output"></div>`;
 else if(+n===5||+n===6) body=`<div class="lab-action">FIND THE PAIR</div><div class="lab-grid"><button class="lab-btn" data-pair="2,6">2 and 6</button><button class="lab-btn" data-pair="3,4">3 and 4</button><button class="lab-btn" data-pair="1,12">1 and 12</button></div><div class="lab-output">For x²+7x+12, choose a pair with product 12 and sum 7.</div>`;
 else if(+n===7||+n===8) body=`<div class="lab-action">STEP THROUGH</div><div class="lab-grid"><div class="lab-card"><strong>1</strong>Write coefficients in descending powers.</div><div class="lab-card"><strong>2</strong>Use the zero of the divisor.</div><div class="lab-card"><strong>3</strong>Bring down → multiply → add.</div><div class="lab-card"><strong>4</strong>Read quotient and remainder.</div></div>`;
 else if(+n===9) body=`<div class="lab-action">CHANGE EXPONENTS · WATCH THE GCD</div><div class="lab-grid"><div class="lab-card">x power A <input data-lab="gx1" class="lab-slider" type="range" min="1" max="6" value="3"></div><div class="lab-card">x power B <input data-lab="gx2" class="lab-slider" type="range" min="1" max="6" value="2"></div></div><div class="lab-output"></div>`;
 else if(+n>=10&&+n<=14) body=`<div class="lab-action">TRY VALUES · VERIFY BOTH EQUATIONS</div><div class="lab-grid"><div class="lab-card">x <input data-lab="lx" class="lab-slider" type="range" min="-5" max="10" value="3"></div><div class="lab-card">y <input data-lab="ly" class="lab-slider" type="range" min="-5" max="10" value="2"></div></div><div class="lab-output"></div>`;
 else body=`<div class="lab-action">TAP · TEST · EXPLAIN</div><div class="lab-grid"><div class="lab-card"><strong>Polynomial?</strong>Check exponents.</div><div class="lab-card"><strong>Degree?</strong>Find highest power.</div><div class="lab-card"><strong>Operation?</strong>Combine like terms only.</div></div>`;
 return `<div class="exercise-lab"><div class="lab-title">✦ ${title}</div><div class="small">Use this mini lab while solving the textbook questions below.</div>${body}</div>`;
}
function initLab(root,id){
 const out=root.querySelector('.lab-output'); if(!out)return;
 function update(){
  const z=root.querySelector('[data-lab="zero"]'); if(z){let x=+z.value,p=x*x-4*x+3;out.innerHTML=`x=${x} → P(x)=${p} ${p===0?'<b>ZERO!</b>':''}`;return}
  const r=root.querySelector('[data-lab="rem"]'); if(r){let a=+r.value,p=a*a-5*a+6;out.innerHTML=`a=${a} → remainder = P(${a}) = <b>${p}</b>`;return}
  const ia=root.querySelector('[data-lab="ia"]'),ib=root.querySelector('[data-lab="ib"]'); if(ia&&ib){let a=+ia.value,b=+ib.value;out.innerHTML=`(a+b)² = (${a}+${b})² = <b>${(a+b)**2}</b> · a²+2ab+b² = ${a*a}+${2*a*b}+${b*b}`;return}
  const g1=root.querySelector('[data-lab="gx1"]'),g2=root.querySelector('[data-lab="gx2"]'); if(g1&&g2){out.innerHTML=`Common x-power = min(${g1.value}, ${g2.value}) = <b>${Math.min(+g1.value,+g2.value)}</b>`;return}
  const lx=root.querySelector('[data-lab="lx"]'),ly=root.querySelector('[data-lab="ly"]'); if(lx&&ly){let x=+lx.value,y=+ly.value;out.innerHTML=`Try (${x},${y}) → x+y=${x+y}; 2x−y=${2*x-y}. ${x+y===5&&2*x-y===4?'<b>Both equations match!</b>':'Adjust x and y.'}`;return}
 }
 root.querySelectorAll('.lab-slider').forEach(x=>x.addEventListener('input',update)); root.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>{out.innerHTML=b.dataset.pair==='3,4'?'<b>Yes!</b> 3×4=12 and 3+4=7.':'Not this pair — check both product and sum.'}); update();
}
document.querySelectorAll('.ex-set').forEach(set=>{
 const pre=set.querySelector('.textbook-questions'); if(!pre)return;
 const qs=splitQuestions(pre.textContent); let idx=0; const id=set.id;
 const player=document.createElement('div'); player.className='question-player';
 player.innerHTML=labHTML(id)+`<div class="qp-top"><div><b>Original textbook question</b><div class="qp-count"></div></div><div class="qp-dots"></div></div><div class="qp-stage"><pre class="qp-question"></pre></div><div class="qp-controls"><div class="qp-nav"><button data-prev>← Previous</button><button data-next>Next →</button></div><span class="small">Attempt before opening hints.</span></div><div class="attempt-zone"><textarea placeholder="Write your step, idea, or answer here..."></textarea><div class="support-row"><button data-h1>Hint 1</button><button data-h2>Hint 2</button><button data-ai>Ask AI</button></div><div class="support-panel" data-p1></div><div class="support-panel" data-p2></div></div>`;
 pre.after(player); initLab(player,id);
 const qel=player.querySelector('.qp-question'),count=player.querySelector('.qp-count'),dots=player.querySelector('.qp-dots');
 dots.innerHTML=qs.map((_,i)=>`<span class="qp-dot" data-d="${i}"></span>`).join('');
 function render(){qel.textContent=qs[idx];count.textContent=`Question ${idx+1} of ${qs.length}`;player.querySelectorAll('.qp-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));player.querySelector('[data-prev]').disabled=idx===0;player.querySelector('[data-next]').disabled=idx===qs.length-1;player.querySelectorAll('.support-panel').forEach(p=>p.classList.remove('show')); if(window.MathJax?.typesetPromise) MathJax.typesetPromise([qel]);}
 player.querySelector('[data-prev]').onclick=()=>{if(idx>0){idx--;render();player.scrollIntoView({behavior:'smooth',block:'center'})}};
 player.querySelector('[data-next]').onclick=()=>{if(idx<qs.length-1){idx++;render();player.scrollIntoView({behavior:'smooth',block:'center'})}};
 player.querySelectorAll('.qp-dot').forEach(d=>d.onclick=()=>{idx=+d.dataset.d;render()});
 const hh=hints[id]||['Read the question carefully and identify the algebraic idea being tested.','Write the relevant theorem/identity before calculating.'];
 player.querySelector('[data-p1]').textContent=hh[0];player.querySelector('[data-p2]').textContent=hh[1];
 player.querySelector('[data-h1]').onclick=()=>player.querySelector('[data-p1]').classList.toggle('show');player.querySelector('[data-h2]').onclick=()=>player.querySelector('[data-p2]').classList.toggle('show');
 player.querySelector('[data-ai]').onclick=()=>{if(window.launchAIPrompt)launchAIPrompt('claude',`Class 9 Mathematics Chapter 3 Algebra, ${set.querySelector('summary').textContent.trim()}, Question ${idx+1}. The original textbook question is: ${qs[idx]}. Guide me one step at a time. Do not give the final answer immediately.`)};
 render();
});
})();
