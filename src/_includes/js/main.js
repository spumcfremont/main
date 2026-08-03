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

  // upcoming events, filtered from today
  var EVENTS=[
    ['2026-04-02',"Maundy Thursday — Family Foot Washing","7:00 p.m. · Passionate Worship"],
    ['2026-04-03',"Good Friday Prayer Walk","7:00 p.m. · All ages, Kingdom Kidz &amp; SPY"],
    ['2026-04-05',"Easter Sunday — Contemporary Worship","10:00 a.m."],
    ['2026-04-18',"Core Team Quarterly Meeting",""],
    ['2026-04-23',"Leader-Shift Training","Lighthouse Family Care Ministry"],
    ['2026-05-02',"Dinner Dance Fundraiser","6:00 p.m. · Fellowship Hall"],
    ['2026-05-10',"Mother's Day Worship Service","10:00 a.m."],
    ['2026-05-17',"Evangelistic Sunday","10:00 a.m. · Witness Ministry"],
    ['2026-05-24',"Evangelistic Sunday","10:00 a.m. · Witness Ministry"],
    ['2026-06-07',"Leader-Shift Training","Eric Antonio &amp; Ptr. Bong Simon"],
    ['2026-06-21',"Father's Day Worship Service","10:00 a.m."],
    ['2026-06-28',"Pastors Appreciation Sunday","10:00 a.m. · SPPRC"],
    ['2026-07-05',"Welcome Event for Our New Pastor","10:00 a.m. · SPPRC"],
    ['2026-07-20',"VBS 2026: Rainforest Falls","July 20–24 · 8:30–11:30 a.m."],
    ['2026-08-01',"Core Team Quarterly Meeting",""],
    ['2026-09-13',"Grandparents Day Worship","10:00 a.m."],
    ['2026-10-10',"Core Team Quarterly Meeting",""],
    ['2026-10-18',"Children's Sunday","Kingdom Kidz lead worship · 10:00 a.m."],
    ['2026-10-21',"United Women in Faith District Meeting",""],
    ['2026-11-08',"Church Anniversary Sunday Worship","10:00 a.m."],
    ['2026-11-14',"Auction Fundraiser","12:00 noon · Finance Committee"],
    ['2026-11-22',"Hearty Harvest","Outreach Ministry"],
    ['2026-12-06',"Christmas Parents &amp; Kids Fellowship","10:00 a.m. · Kingdom Kidz"],
    ['2026-12-22',"Simbang Gabi with United Methodist Men","6:00 p.m. · with SPY"],
    ['2026-12-23',"Simbang Gabi with United Women in Faith","6:00 p.m. · with Kingdom Kidz"],
    ['2026-12-27',"Christmas Institute","December 27–30 · SPY"]
  ];
  var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var now=new Date();now.setHours(0,0,0,0);
  var next=EVENTS.filter(function(e){return new Date(e[0]+'T00:00:00')>=now;});
  var list=(next.length?next:EVENTS.slice(-6)).slice(0,7);
  if(!next.length){document.getElementById('uphint').textContent='Looking ahead — these dates return each year on the church calendar.';}
  document.getElementById('upcoming').innerHTML=list.map(function(e){
    var d=new Date(e[0]+'T00:00:00');
    return '<li><div class="update"><span>'+M[d.getMonth()]+'</span><strong>'+d.getDate()+'</strong></div>'+
           '<div class="upmeta"><h4>'+e[1]+'</h4>'+(e[2]?'<p>'+e[2]+'</p>':'')+'</div></li>';
  }).join('');
})();
