(function(){
  // header shrinks on scroll
  var hdr=document.getElementById('hdr');
  function syncHdr(){hdr.classList.toggle('stuck',window.scrollY>12);}
  window.addEventListener('scroll',syncHdr,{passive:true});syncHdr();

  // mobile nav
  var t=document.getElementById('navtoggle'),n=document.getElementById('mainnav');
  t.addEventListener('click',function(){
    var open=n.classList.toggle('open');
    t.setAttribute('aria-expanded',open?'true':'false');
  });
  n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');t.setAttribute('aria-expanded','false');}});
  document.addEventListener('click',function(e){
    if(n.classList.contains('open') && !n.contains(e.target) && e.target!==t){
      n.classList.remove('open');
      t.setAttribute('aria-expanded','false');
    }
  });

  // scroll reveal
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{rootMargin:'0px 0px -12% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  // four-I path active state
  var nodes=[].slice.call(document.querySelectorAll('.path-node'));
  var targets=nodes.map(function(a){return document.getElementById(a.dataset.target);});
  function sync(){
    var best=-1;
    targets.forEach(function(sec,i){
      if(sec && sec.getBoundingClientRect().top<=200) best=i;
    });
    nodes.forEach(function(a,i){a.classList.toggle('on',i===best);});
  }
  window.addEventListener('scroll',sync,{passive:true});sync();

  // upcoming events, from the church's shared Google Calendar (via a Netlify Function proxy)
  function esc(s){
    return String(s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var upcomingEl=document.getElementById('upcoming');
  if(upcomingEl){
    function noEvents(){
      document.getElementById('uphint').textContent='No upcoming events posted yet — check back soon!';
    }
    fetch('/api/events').then(function(res){return res.json();}).then(function(events){
      if(!events || !events.length){noEvents();return;}
      upcomingEl.innerHTML=events.map(function(e){
        var d=new Date(e.date+'T00:00:00');
        return '<li><div class="update"><span>'+M[d.getMonth()]+'</span><strong>'+d.getDate()+'</strong></div>'+
               '<div class="upmeta"><h4>'+esc(e.title)+'</h4>'+(e.details?'<p>'+esc(e.details)+'</p>':'')+'</div></li>';
      }).join('');
    }).catch(noEvents);
  }

  // Contact Us form — submits to a Google Form (Sheet) via fetch, no-cors since
  // Google's response isn't readable cross-origin; success is assumed once the
  // request is sent without throwing (matches the fixed pattern used elsewhere).
  var contactForm=document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit',function(e){
      e.preventDefault();
      var status=document.getElementById('contact-status');
      var data=new URLSearchParams(new FormData(contactForm));
      fetch(contactForm.action,{method:'POST',mode:'no-cors',body:data})
        .then(function(){
          contactForm.reset();
          contactForm.style.display='none';
          status.textContent='Thanks for reaching out — we\'ll be in touch soon.';
          status.style.display='block';
        })
        .catch(function(){
          status.textContent='Something went wrong sending that. Please email us directly at welcome@belongatstpaul.org.';
          status.style.display='block';
        });
    });
  }
})();
