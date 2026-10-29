"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const db={get(k,d){try{const v=JSON.parse(localStorage.getItem('rf_'+k));return v??d}catch{return d}},set(k,v){try{localStorage.setItem('rf_'+k,JSON.stringify(v))}catch{}}};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const r1=n=>Math.round(n*10)/10;
const TODAY=iso(new Date());
// name, kcal, protein, carbs, fat per 100 g
const DEMO=[["Rolled oats",389,16.9,66.3,6.9],["Banana",89,1.1,22.8,.3],["Chicken breast, cooked",165,31,0,3.6],["White rice, cooked",130,2.7,28,.3],["Whole egg",143,12.6,.7,9.5],["Paneer",265,18.3,1.2,20.8],["Greek yogurt",59,10,3.6,.4],["Peanut butter",588,25,20,50],["Whole milk",61,3.2,4.8,3.3],["Roti (chapati)",297,9.8,50,7.5],["Dal, cooked",116,9,20,.4],["Almonds",579,21,22,50],["Salmon, cooked",208,22,0,13],["Sweet potato",86,1.6,20,.1],["Whey protein",400,80,8,6],["Apple",52,.3,14,.2]].map((a,i)=>({id:'d'+i,name:a[0],cal:a[1],p:a[2],c:a[3],f:a[4],serving:100}));
const PAGES={overview:["Overview","Your training, in rhythm.","A clear view of your food and lifting progress.","Home","◫"],nutrition:["Nutrition","Fuel the work.","Search foods, log meals and watch your macros.","Food","◉"],training:["Training log","Every rep counts.","Record your lifts and see how load builds over time.","Training","↗"],calendar:["Goal calendar","Stack the days.","Check in on each day you hit your goals.","Calendar","▦"],foods:["Food library","Your own foods.","Add custom foods so logging is one tap.","Foods","▤"]};
let S={goals:db.get('goals',{cal:2400,p:180,c:250,f:75}),diary:db.get('diary',{}),lifts:db.get('lifts',[]),done:db.get('done',{}),custom:db.get('custom',[]),note:db.get('note','')};
const save=k=>db.set(k,S[k]);
let page='overview',pending=null,sel=TODAY,view=new Date();view.setDate(1);

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200)}
function tween(el,to){const from=el._v||0;el._v=to;const t0=performance.now();if(matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=Math.round(to).toLocaleString();return}
(function f(n){const k=Math.min(1,(n-t0)/900),e=1-Math.pow(1-k,3);el.textContent=Math.round(from+(to-from)*e).toLocaleString();if(k<1)requestAnimationFrame(f)})(t0)}
const dayFood=d=>S.diary[d]||[];
const totals=d=>dayFood(d).reduce((a,x)=>({cal:a.cal+x.cal,p:a.p+x.p,c:a.c+x.c,f:a.f+x.f}),{cal:0,p:0,c:0,f:0});
const allFoods=()=>[...S.custom,...DEMO];

function go(p){page=p;$$('.page').forEach(e=>e.classList.toggle('active',e.id==='p-'+p));
$$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
const m=PAGES[p];$('#crumb').textContent=m[0];$('#page-title').textContent=m[1];$('#page-sub').textContent=m[2];
$('#quick-add').textContent=p==='training'?'＋ Log a lift':'＋ Log food';scrollTo({top:0});render()}

const STATS=[["cal","CALORIES","kcal","--c:var(--green)","◉"],["p","PROTEIN","g","--c:var(--coral)","◆"],["c","CARBS","g","--c:var(--gold)","◆"],["f","FAT","g","--c:var(--blue)","◆"]];
function renderStats(){const t=totals(TODAY);const box=$('#stats');
if(!box.children.length)box.innerHTML=STATS.map(s=>`<article class="stat"><div class="stat-h"><span>${s[1]}</span><span style="color:var(${s[3].slice(5,-1)})">${s[4]}</span></div><div class="stat-v"><b data-v="${s[0]}">0</b> / <span data-g="${s[0]}"></span> ${s[2]}</div><div class="bar" style="${s[3]}"><i data-b="${s[0]}"></i></div><div class="stat-f"><span data-l="${s[0]}"></span><span>Daily target</span></div></article>`).join('');
STATS.forEach(([k,,u])=>{const v=t[k],g=S.goals[k];tween(box.querySelector(`[data-v=${k}]`),v);box.querySelector(`[data-g=${k}]`).textContent=g.toLocaleString();
const b=box.querySelector(`[data-b=${k}]`);requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.width=Math.min(100,v/g*100)+'%'));b.parentElement.classList.toggle('over',v>g);
box.querySelector(`[data-l=${k}]`).textContent=v>g?`${Math.round(v-g)} ${u} over`:`${Math.round(g-v)} ${u==='kcal'?'kcal left':'g to go'}`})}
const foodRow=(x,del)=>`<div class="row"><div class="grow"><b>${esc(x.name)}</b><small>${x.g} g · P ${r1(x.p)} · C ${r1(x.c)} · F ${r1(x.f)}</small></div><span class="kcal">${Math.round(x.cal)} kcal</span>${del?`<button class="del" data-del-food="${x.id}" aria-label="Remove ${esc(x.name)}">×</button>`:''}</div>`;
const sorted=()=>[...S.lifts].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
const liftRow=(w,del)=>`<div class="row"><div class="fi">↗</div><div class="grow"><b>${esc(w.exercise)}</b><small>${w.sets} × ${w.reps} @ ${w.weight} ${w.unit}${w.notes?' · '+esc(w.notes):''}</small></div><span class="chip">${w.date===TODAY?'Today':w.date}</span>${del?`<button class="del" data-del-lift="${w.id}" aria-label="Delete lift">×</button>`:''}</div>`;
const empty=(i,t,p,b,pg)=>`<div class="empty"><div class="ei">${i}</div><strong>${t}</strong><span>${p}</span><button class="btn ghost" data-go="${pg}">${b}</button></div>`;

function render(){
$('#today-label').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
renderStats();const food=dayFood(TODAY),lifts=sorted();
$('#ov-meals').innerHTML=food.length?food.slice(-4).reverse().map(x=>foodRow(x)).join(''):empty('＋','No food logged yet','Add your first meal to start tracking today.','Add food','nutrition');
$('#ov-lifts').innerHTML=lifts.length?lifts.slice(0,4).map(w=>liftRow(w)).join(''):empty('↗','No sessions logged','Record your first lift to see it here.','Log a lift','training');
const todayLift=lifts.some(w=>w.date===TODAY),t=totals(TODAY),pct=t.cal/S.goals.cal;
$('#focus-t').textContent=!food.length&&!todayLift?'Keep showing up':pct>=1?'Calories hit — nice work':todayLift?'Lift logged. Now fuel it':'Food is moving';
$('#focus-p').textContent=!food.length&&!todayLift?'Log your lifts and meals to build a picture of your progress.':`You’re at ${Math.round(Math.min(pct,9.99)*100)}% of calories and ${Math.round(t.p)} g protein. ${todayLift?'Training is done for today.':'No lift logged yet today.'}`;
$('#note').value=S.note;
$('#diary').innerHTML=food.length?food.slice().reverse().map(x=>foodRow(x,1)).join(''):'<div class="empty"><div class="ei">＋</div><strong>Nothing logged yet</strong><span>Search above and add your first food.</span></div>';
$('#food-count').textContent=food.length+(food.length===1?' item':' items');
$('#sum-date').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
$('#summary').innerHTML=STATS.map(([k,n,u,c])=>{const v=t[k],g=S.goals[k];return `<div class="macro"><div class="macro-h"><b>${n[0]+n.slice(1).toLowerCase()}</b><span>${Math.round(v)} / ${g} ${u}</span></div><div class="bar${v>g?' over':''}" style="${c}"><i style="width:${Math.min(100,v/g*100)}%"></i></div></div>`}).join('');
$('#history').innerHTML=lifts.length?lifts.map(w=>liftRow(w,1)).join(''):'<div class="empty"><div class="ei">↗</div><strong>No lifts yet</strong><span>Save your first lift on the left.</span></div>';
const vol=lifts.filter(w=>Date.now()-new Date(w.date)<7*864e5+864e5).reduce((a,w)=>a+w.sets*w.reps*(w.unit==='lb'?w.weight*.4536:w.weight),0);
$('#lift-sum').textContent=lifts.length?`${lifts.length} logged · ${Math.round(vol).toLocaleString()} kg volume this week`:'Your recent logged work.';
$('#custom-list').innerHTML=S.custom.length?S.custom.map(x=>`<div class="row"><div class="grow"><b>${esc(x.name)}</b><small>per ${x.serving} g · P ${x.p} · C ${x.c} · F ${x.f}</small></div><span class="kcal">${x.cal} kcal</span><button class="del" data-del-custom="${x.id}" aria-label="Delete ${esc(x.name)}">×</button></div>`).join(''):'<div class="empty"><div class="ei">▤</div><strong>No custom foods</strong><span>Add one above and it shows up in food search.</span></div>';
$('#lib-count').textContent=S.custom.length+(S.custom.length===1?' food':' foods');
if(page==='nutrition')search();if(page==='calendar')renderCal()}

function search(){const q=$('#q').value.trim().toLowerCase();const list=allFoods().filter(f=>f.name.toLowerCase().includes(q));
$('#hint').textContent=q?`${list.length} result${list.length===1?'':'s'} for “${$('#q').value.trim()}”`:'Showing all foods. Values are per 100 g unless a custom serving is set.';
$('#results').innerHTML=list.length?list.map(f=>`<div class="row"><div class="grow"><b>${esc(f.name)}</b><small>per ${f.serving} g · ${f.cal} kcal · P ${f.p} · C ${f.c} · F ${f.f}</small></div><button class="btn ghost" data-add="${f.id}">Add</button></div>`).join(''):'<div class="empty"><div class="ei">⌕</div><strong>No match</strong><span>Try another word, or add it to your food library.</span><button class="btn ghost" data-go="foods">Create custom food</button></div>'}

function open(id){$(id).classList.add('open');setTimeout(()=>$(id).querySelector('input')?.focus(),60)}
function close(){$$('.backdrop').forEach(b=>b.classList.remove('open'))}
function prev(){const g=+$('#amt').value||0,k=g/pending.serving;$('#m-prev').innerHTML=[["Calories",pending.cal*k,''],["Protein",pending.p*k,'g'],["Carbs",pending.c*k,'g'],["Fat",pending.f*k,'g']].map(a=>`<div><small>${a[0]}</small><b>${Math.round(a[1]*10)/10}${a[2]}</b></div>`).join('')}

function renderCal(){const y=view.getFullYear(),m=view.getMonth(),n=new Date(y,m+1,0).getDate(),off=view.getDay();
$('#mtitle').textContent=view.toLocaleDateString('en-US',{month:'long',year:'numeric'});
let h=['S','M','T','W','T','F','S'].map(d=>`<div class="dow">${d}</div>`).join('')+'<div class="day blank"></div>'.repeat(off),cnt=0;
for(let d=1;d<=n;d++){const k=iso(new Date(y,m,d)),dn=S.done[k],lg=dayFood(k).length||S.lifts.some(w=>w.date===k);if(dn)cnt++;
h+=`<button class="day${dn?' done':''}${lg?' logged':''}${k===TODAY?' today':''}${k===sel?' sel':''}" data-day="${k}" aria-label="${k}">${d}</button>`}
$('#cal').innerHTML=h;$('#streak').textContent=cnt+' completed this month';
const t=totals(sel),L=S.lifts.filter(w=>w.date===sel).length,dt=new Date(sel+'T00:00');
$('#sel-title').textContent=sel===TODAY?'Today':dt.toLocaleDateString('en-US',{weekday:'long'});$('#sel-cap').textContent=dt.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
$('#dstats').innerHTML=`<div><small>Calories</small><b>${Math.round(t.cal)}</b> <small>/ ${S.goals.cal}</small></div><div><small>Protein</small><b>${Math.round(t.p)}</b> <small>/ ${S.goals.p} g</small></div><div><small>Carbs</small><b>${Math.round(t.c)}</b> <small>/ ${S.goals.c} g</small></div><div><small>Lifts logged</small><b>${L}</b></div>`;
const on=!!S.done[sel];$('#toggle').classList.toggle('on',on);$('#toggle').textContent=on?'✓ Day completed — tap to undo':'Mark this day complete'}

document.addEventListener('click',e=>{const t=e.target.closest('button,[data-day]');if(!t)return;
if(t.dataset.page||t.dataset.go)return go(t.dataset.page||t.dataset.go);
if(t.dataset.add){pending=allFoods().find(f=>f.id===t.dataset.add);$('#m-name').textContent=pending.name;$('#m-meta').textContent=`${pending.cal} kcal per ${pending.serving} g`;$('#amt').value=pending.serving;prev();return open('#amt-m')}
if(t.dataset.delFood){S.diary[TODAY]=dayFood(TODAY).filter(x=>x.id!==t.dataset.delFood);save('diary');toast('Food removed');return render()}
if(t.dataset.delLift){S.lifts=S.lifts.filter(x=>x.id!==t.dataset.delLift);save('lifts');toast('Lift deleted');return render()}
if(t.dataset.delCustom){S.custom=S.custom.filter(x=>x.id!==t.dataset.delCustom);save('custom');toast('Food deleted');return render()}
if(t.dataset.day){sel=t.dataset.day;return renderCal()}
if(t.hasAttribute('data-close'))close()});
$$('.backdrop').forEach(b=>b.addEventListener('mousedown',e=>{if(e.target===b)close()}));
addEventListener('keydown',e=>{if(e.key==='Escape')close()});
$('#side-nav').innerHTML=Object.entries(PAGES).map(([k,v])=>`<button class="nav-item" data-page="${k}"><span>${v[4]}</span>${v[0]}</button>`).join('');
$('#m-nav').innerHTML=Object.entries(PAGES).map(([k,v])=>`<button class="nav-item" data-page="${k}"><span>${v[4]}</span><small>${v[3]}</small></button>`).join('');
$('#quick-add').onclick=()=>{if(page==='training'){$('#lift-form [name=exercise]').focus()}else{go('nutrition');setTimeout(()=>$('#q').focus(),50)}};
$('#bell').onclick=()=>{$('#bell').classList.remove('dot');toast('You’re all caught up')};
$('#edit-goals').onclick=()=>{const f=$('#goals-form');for(const k in S.goals)f[k].value=S.goals[k];open('#goals-m')};
$('#goals-form').onsubmit=e=>{e.preventDefault();const f=e.target;S.goals={cal:+f.cal.value,p:+f.p.value,c:+f.c.value,f:+f.f.value};save('goals');close();toast('Goals saved');render()};
$('#save-note').onclick=()=>{S.note=$('#note').value;save('note');$('#note-st').textContent='Saved just now';toast('Note saved')};
$('#note').oninput=()=>$('#note-st').textContent='Unsaved changes';
$('#search-form').onsubmit=e=>{e.preventDefault();search()};$('#q').oninput=search;
$('#amt').oninput=prev;
$('#confirm').onclick=()=>{const g=+$('#amt').value;if(!g||g<1)return toast('Enter an amount in grams');const k=g/pending.serving;
(S.diary[TODAY]=dayFood(TODAY)).push({id:uid(),name:pending.name,g,cal:pending.cal*k,p:pending.p*k,c:pending.c*k,f:pending.f*k});save('diary');close();toast(`Added ${pending.name}`);render()};
$('#lift-form').onsubmit=e=>{e.preventDefault();const f=e.target;S.lifts.push({id:uid(),exercise:f.exercise.value.trim(),date:f.date.value,sets:+f.sets.value,reps:+f.reps.value,weight:+f.weight.value,unit:f.unit.value,notes:f.notes.value.trim()});save('lifts');f.exercise.value='';f.weight.value='';f.notes.value='';toast('Lift saved');render()};
$('#lift-form [name=date]').value=TODAY;
$('#food-form').onsubmit=e=>{e.preventDefault();const f=e.target;S.custom.unshift({id:'c'+uid(),name:f.name.value.trim(),serving:+f.serving.value,cal:+f.cal.value,p:+f.p.value,c:+f.c.value,f:+f.f.value});save('custom');f.reset();f.serving.value=100;toast('Added to library');render()};
$('#prev').onclick=()=>{view.setMonth(view.getMonth()-1);renderCal()};$('#next').onclick=()=>{view.setMonth(view.getMonth()+1);renderCal()};
$('#today').onclick=()=>{view=new Date();view.setDate(1);sel=TODAY;renderCal()};
$('#toggle').onclick=()=>{S.done[sel]?delete S.done[sel]:S.done[sel]=true;save('done');toast(S.done[sel]?'Day marked complete 🎉':'Day unmarked');renderCal()};
go('overview');
