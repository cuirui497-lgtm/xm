/* Editorial motion system — native WAAPI, no network dependencies. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches||!('IntersectionObserver'in window)||!Element.prototype.animate)return;
 const ease='cubic-bezier(.19,1,.22,1)',animations=new Set(),observers=[],seen=new WeakSet(),pending=new Set();
 let disabled=false,openingUntil=0;
 function play(el,keys,duration=1350,delay=0){if(disabled)return;const glass=el.matches('#about .portrait-card,#about .experience article,#approach .abilities article');if(glass)el.classList.add('is-revealing');const a=el.animate(keys,{duration,delay,easing:ease,fill:'both'});animations.add(a);function release(){animations.delete(a);if(glass)el.classList.remove('is-revealing')}a.finished.then(()=>{release();a.cancel()},release);return a}
 function lines(title){if(title.dataset.motionLines)return [...title.querySelectorAll('.motion-line-inner')];title.dataset.motionLines='1';const groups=[[]];[...title.childNodes].forEach(n=>{if(n.nodeName==='BR')groups.push([]);else groups.at(-1).push(n)});title.replaceChildren();groups.forEach(nodes=>{const mask=document.createElement('span'),inner=document.createElement('span');mask.className='motion-line';inner.className='motion-line-inner';nodes.forEach(n=>inner.append(n));mask.append(inner);title.append(mask)});return [...title.querySelectorAll('.motion-line-inner')]}
 function titleIn(el,delay=0){lines(el).forEach((line,i)=>play(line,[{transform:'translate3d(0,125%,0) rotate(5deg) scaleY(1.2)'},{transform:'translate3d(0,0,0) rotate(0deg) scaleY(1)'}],1650,delay+i*170))}
 function wait(el){if(seen.has(el))return false;seen.add(el);el.classList.add('motion-pending');pending.add(el);return true}
 function show(el){el.classList.remove('motion-pending');pending.delete(el)}
 const hero=document.querySelector('.hero');
 if(hero){const heading=hero.querySelector('h1'),copy=hero.querySelector('.hero-copy'),art=hero.querySelector('.hero-art');lines(heading);
  const atTop=!location.hash&&scrollY<100;
  if(atTop){const curtain=document.createElement('div');curtain.className='opening-curtain';curtain.setAttribute('aria-hidden','true');curtain.innerHTML='<div class="opening-word-mask"><div class="opening-word">CUI RUI<span>®</span></div></div><div class="opening-rule"></div><div class="opening-caption">UI & VISUAL DESIGN / SELECTED WORKS 2026</div>';document.body.append(curtain);openingUntil=performance.now()+1800;
   play(curtain.querySelector('.opening-word'),[{transform:'translateY(120%) scaleX(.7)',opacity:0},{transform:'translateY(0) scaleX(1)',opacity:1}],1000);
   play(curtain.querySelector('.opening-rule'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],1200,100);
   const exit=play(curtain,[{transform:'translate3d(0,0,0)'},{transform:'translate3d(0,-100%,0)'}],1450,850);exit?.finished.then(()=>curtain.remove()).catch(()=>curtain.remove());setTimeout(()=>curtain.remove(),4500);
   play(art,[{clipPath:'inset(8% 8% 8% 8%)',scale:'1.07'},{clipPath:'inset(0 0 0 0)',scale:'1'}],2300,950);
   titleIn(heading,1350);
   play(copy.querySelector('.eyebrow'),[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],1100,1300);
   play(copy.querySelector('p'),[{opacity:0,transform:'translateY(45px)'},{opacity:1,transform:'translateY(0)'}],1400,1850);
   play(copy.querySelector('.solid-button'),[{opacity:0,translate:'0 36px',scale:'.92'},{opacity:1,translate:'0 0',scale:'1'}],1250,2050);
   play(document.querySelector('.site-nav'),[{opacity:0,translate:'0 -100%'},{opacity:1,translate:'0 0'}],1200,1250);
   play(hero.querySelector('.hero-bottom'),[{opacity:0},{opacity:1}],1100,2300);
  }else if(hero.getBoundingClientRect().bottom>0){titleIn(heading,120)}
 }
 const titleTimes=new WeakMap();
 const headObserver=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;show(target);const section=target.closest('section');titleTimes.set(section,performance.now());const delay=Math.max(0,openingUntil-performance.now());const h=target.querySelector('h2');if(h)titleIn(h,delay);const label=target.querySelector('.eyebrow');if(label)play(label,[{opacity:0,translate:'-28px 0'},{opacity:1,translate:'0 0'}],1100,delay);const filters=target.querySelector('.filters');if(filters)play(filters,[{opacity:0,translate:'0 28px'},{opacity:1,translate:'0 0'}],1200,delay+400);headObserver.unobserve(target)})},{threshold:.08,rootMargin:'0px 0px -7% 0px'});observers.push(headObserver);
 document.querySelectorAll('.section-head').forEach(el=>{const h=el.querySelector('h2');if(h)lines(h);if(wait(el))headObserver.observe(el)});
 const itemObserver=new IntersectionObserver(entries=>{entries.forEach(({target:el,isIntersecting})=>{if(!isIntersecting)return;show(el);const section=el.closest('section'),elapsed=performance.now()-(titleTimes.get(section)||0),titleLead=Math.max(0,520-elapsed),index=Number(el.dataset.motionIndex)||0,delay=Math.max(0,openingUntil-performance.now(),titleLead)+index*140;
  if(el.matches('.project-card,.portrait-card')){const image=el.querySelector('.project-image,.portrait-photo');if(image){play(image,[{clipPath:'inset(0 0 100% 0 round 5px)'},{clipPath:'inset(0 0 0% 0 round 5px)'}],1600,delay+120);const img=image.querySelector('img');if(img&&el.matches('.portrait-card'))play(img,[{scale:'1.18'},{scale:'1'}],2100,delay+120)}play(el,[{opacity:.15,translate:'0 85px',rotate:'1.5deg'},{opacity:1,translate:'0 0',rotate:'0deg'}],1550,delay)}
  else if(el.matches('.contact h2')){play(el,[{clipPath:'inset(0 0 100% 0)',translate:'0 85px'},{clipPath:'inset(0 0 0% 0)',translate:'0 0'}],1650,delay)}
  else play(el,[{opacity:0,translate:'0 76px',scale:'.95'},{opacity:1,translate:'0 0',scale:'1'}],1450,delay);
  itemObserver.unobserve(el)
 })},{threshold:.06,rootMargin:'0px 0px -5% 0px'});observers.push(itemObserver);
 function register(scope=document){scope.querySelectorAll('.portrait-card,.about-body,.experience article,.project-card,.abilities article,.contact .eyebrow,.contact h2,.contact-links>*,.contact footer').forEach(el=>{if(!wait(el))return;const siblings=[...el.parentElement.children];el.dataset.motionIndex=el.matches('.about-body')?'1':String(siblings.indexOf(el)%(innerWidth<=820?1:3));itemObserver.observe(el)});}
 register();const grid=document.querySelector('#projects');const mutation=new MutationObserver(records=>{records.forEach(record=>record.removedNodes.forEach(node=>{if(node.nodeType!==1)return;[node,...node.querySelectorAll('.motion-pending')].forEach(el=>{pending.delete(el);itemObserver.unobserve(el)})}));register(grid)});if(grid)mutation.observe(grid,{childList:true});
 document.addEventListener('focusin',e=>{const el=e.target.closest('.motion-pending');if(el){show(el);itemObserver.unobserve(el);headObserver.unobserve(el)}});
 preference.addEventListener('change',()=>{if(!preference.matches)return;disabled=true;animations.forEach(a=>a.cancel());observers.forEach(o=>o.disconnect());mutation.disconnect();pending.forEach(show);document.querySelector('.opening-curtain')?.remove()});
})();
