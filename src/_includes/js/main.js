(function(){
  // mobile nav
  var t=document.getElementById('navtoggle'),n=document.getElementById('mainnav');
  t.addEventListener('click',function(){
    var open=n.classList.toggle('open');
    t.setAttribute('aria-expanded',open?'true':'false');
  });
  n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');t.setAttribute('aria-expanded','false');}});

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

  // upcoming events, filtered from today (sourced from the Events CMS collection)
  function esc(s){
    return String(s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  var EVENTS=[
{%- for event in collections.event %}
    [{{ event.data.date | htmlDateString | jsstring | safe }},{{ event.data.title | jsstring | safe }},{{ event.data.details | default("") | jsstring | safe }}]{% if not loop.last %},{% endif %}
{%- endfor %}
  ];
  var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var now=new Date();now.setHours(0,0,0,0);
  var next=EVENTS.filter(function(e){return new Date(e[0]+'T00:00:00')>=now;});
  var list=(next.length?next:EVENTS.slice(-6)).slice(0,7);
  if(!next.length){document.getElementById('uphint').textContent='Looking ahead — these dates return each year on the church calendar.';}
  document.getElementById('upcoming').innerHTML=list.map(function(e){
    var d=new Date(e[0]+'T00:00:00');
    return '<li><div class="update"><span>'+M[d.getMonth()]+'</span><strong>'+d.getDate()+'</strong></div>'+
           '<div class="upmeta"><h4>'+esc(e[1])+'</h4>'+(e[2]?'<p>'+esc(e[2])+'</p>':'')+'</div></li>';
  }).join('');
})();
