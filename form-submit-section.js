/* ── 8. FORM VALIDATION & SUBMIT ── */
(function(){
  var form    = document.getElementById('requestForm');
  var btn     = document.getElementById('submitBtn');
  var success = document.getElementById('formSuccess');
  if(!form) return;

  var fields = [
    {id:'yourName',    ok:function(v){ return v.trim().length>=2; }},
    {id:'recipientName',ok:function(v){ return v.trim().length>=1; }},
    {id:'email',       ok:function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }},
    {id:'occasion',    ok:function(v){ return v!==''; }},
    {id:'message',     ok:function(v){ return v.trim().length>=10; }},
  ];

  function validate(fc){
    var el  = document.getElementById(fc.id);
    var err = el && el.parentElement.querySelector('.form-error');
    var valid = fc.ok(el?el.value:'');
    if(el)  el.classList.toggle('error',!valid);
    if(err) err.classList.toggle('visible',!valid);
    return valid;
  }

  fields.forEach(function(fc){
    var el = document.getElementById(fc.id);
    if(!el) return;
    el.addEventListener('blur', function(){ validate(fc); });
    el.addEventListener('input', function(){
      if(fc.ok(el.value)) validate(fc);
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    
    // Validate all fields
    var allValid = fields.every(validate);
    if(!allValid) return;

    // Show loading state
    btn.classList.add('loading');

    // Send email using EmailJS - FIXED VARIABLES
    emailjs.send(
      'service_105scfq',
      'template_kyizxgj',
      {
        from_name: document.getElementById('yourName').value,
        from_email: document.getElementById('email').value,
        recipient_name: document.getElementById('recipientName').value,
        occasion: document.getElementById('occasion').value,
        message: document.getElementById('message').value
      }
    ).then(function(response){
      btn.classList.remove('loading');
      form.style.display = 'none';
      success.hidden = false;
      
      // Reset form after 3 seconds
      setTimeout(function(){
        form.reset();
        form.style.display = '';
        success.hidden = true;
        fields.forEach(function(fc){
          var el = document.getElementById(fc.id);
          if(el) el.classList.remove('error');
        });
        btn.classList.remove('loading');
      }, 3000);
    }).catch(function(error){
      btn.classList.remove('loading');
      alert('Error sending request. Please try again later.\nError: ' + (error.text || error.message));
    });
  });
})();