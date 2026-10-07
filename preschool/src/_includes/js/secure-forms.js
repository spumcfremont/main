// Forms marked data-secure-form="<name>" get a Cloudflare Turnstile check and
// are sent through /api/submit, which verifies the check before passing the
// answers on to Google Forms.
(function(){
  var forms=document.querySelectorAll('form[data-secure-form]');
  if(!forms.length)return;

  var widgets=[];
  window.__renderTurnstile=function(){
    forms.forEach(function(form,i){
      var box=form.querySelector('.cf-turnstile');
      if(!box)return;
      widgets[i]=window.turnstile.render(box,{
        sitekey:box.getAttribute('data-sitekey'),
        theme:'light',
        size:box.clientWidth<300?'compact':'normal'
      });
    });
  };
  var api=document.createElement('script');
  api.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__renderTurnstile';
  api.async=true;
  api.defer=true;
  document.head.appendChild(api);

  forms.forEach(function(form,i){
    var status=document.getElementById(form.getAttribute('data-status'));
    var button=form.querySelector('button[type="submit"]');
    var label=button.textContent;

    function say(message,isError){
      status.textContent=message;
      status.setAttribute('role',isError?'alert':'status');
      status.style.display='block';
    }
    function retry(){
      button.disabled=false;
      button.textContent=label;
      if(window.turnstile&&widgets[i]!==undefined)window.turnstile.reset(widgets[i]);
    }

    form.addEventListener('submit',function(e){
      e.preventDefault();
      var data=new URLSearchParams(new FormData(form));
      if(!data.get('cf-turnstile-response')){
        say('Please wait for the quick security check below to finish, then send again.',true);
        return;
      }
      button.disabled=true;
      button.textContent='Sending…';
      fetch('/api/submit?form='+encodeURIComponent(form.getAttribute('data-secure-form')),{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:data.toString()
      })
        .then(function(res){
          return res.json().catch(function(){return {};}).then(function(body){
            if(!res.ok||!body.ok)throw body;
          });
        })
        .then(function(){
          form.reset();
          form.style.display='none';
          say(form.getAttribute('data-success'),false);
          status.setAttribute('tabindex','-1');
          status.focus();
        })
        .catch(function(body){
          retry();
          if(body&&body.error==='captcha'){
            say('The security check didn\'t go through. Please try again.',true);
          }else{
            say(form.getAttribute('data-error'),true);
          }
        });
    });
  });
})();
