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
    var now=new Date();
    var monthEnd=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59);
    var qs='timeMin='+encodeURIComponent(now.toISOString())+
      '&timeMax='+encodeURIComponent(monthEnd.toISOString())+'&maxResults=50';
    fetch('/api/events?'+qs).then(function(res){return res.json();}).then(function(events){
      if(!events || !events.length){noEvents();return;}
      upcomingEl.innerHTML=events.map(function(e){
        var d=new Date(e.date+'T00:00:00');
        return '<li><div class="update"><span>'+M[d.getMonth()]+'</span><strong>'+d.getDate()+'</strong></div>'+
               '<div class="upmeta"><h4>'+esc(e.title)+'</h4>'+(e.details?'<p>'+esc(e.details)+'</p>':'')+'</div></li>';
      }).join('');
    }).catch(noEvents);
  }

  // "A week at Saint Paul": the next 7 days from the same calendar, grouped by day.
  // The hardcoded schedule in the markup stays as the fallback if the request fails.
  var weekEl=document.getElementById('week-ledger');
  if(weekEl){
    var TZ='America/Los_Angeles';
    var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var todayKey=new Date().toLocaleDateString('en-CA',{timeZone:TZ}); // YYYY-MM-DD
    var dayKeys=[];
    for(var i=0;i<7;i++){
      var p=todayKey.split('-');
      var base=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]+i,12));
      dayKeys.push(base.toISOString().slice(0,10));
    }
    // one extra day so events late on the seventh day are included; grouping below trims to the seven days
    var weekEnd=new Date(Date.now()+8*24*60*60*1000);
    var wqs='timeMin='+encodeURIComponent(new Date().toISOString())+
      '&timeMax='+encodeURIComponent(weekEnd.toISOString())+'&maxResults=100';
    fetch('/api/events?'+wqs).then(function(res){
      if(!res.ok) throw new Error('bad status');
      return res.json();
    }).then(function(events){
      if(!Array.isArray(events)) throw new Error('bad payload');
      var html='';
      dayKeys.forEach(function(key,idx){
        var list=events.filter(function(e){return e.date===key;});
        if(!list.length) return;
        var d=new Date(key+'T12:00:00Z');
        var label=idx===0?'Today':DAYS[d.getUTCDay()];
        html+='<div class="day"><h3>'+label+'</h3><div class="slots">'+
          list.map(function(e){
            var when=e.time||'All day';
            var where=e.location?' <span class="where">· '+esc(e.location)+'</span>':'';
            return '<div class="slot"><div class="t">'+esc(when)+'</div><div class="d">'+esc(e.title)+where+'</div></div>';
          }).join('')+
          '</div></div>';
      });
      if(!html){
        weekEl.innerHTML='<p class="lede">Nothing on the calendar for the next seven days. Check the <a href="/calendar/">full calendar</a> for what is coming up.</p>';
      } else {
        weekEl.innerHTML=html;
      }
    }).catch(function(){
      /* keep the static schedule shown in the markup */
    });
  }
})();
