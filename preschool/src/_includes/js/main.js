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
})();
