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

  // tour request form — submit via fetch so Netlify Forms captures it without a page reload
  var tourForm=document.getElementById('tour-form');
  if(tourForm){
    tourForm.addEventListener('submit',function(e){
      e.preventDefault();
      var status=document.getElementById('tour-status');
      var data=new URLSearchParams(new FormData(tourForm)).toString();
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data})
        .then(function(res){
          if(!res.ok){throw new Error('Submission failed');}
          tourForm.reset();
          tourForm.style.display='none';
          status.textContent='Thanks! We\'ll reach out to confirm your tour time.';
          status.style.display='block';
        })
        .catch(function(){
          status.textContent='Something went wrong sending that. Please call us directly at (510) 429-3993.';
          status.style.display='block';
        });
    });
  }
})();
