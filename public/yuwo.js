// Signup form: sends the email to the server, which saves it to Google Sheets
  const form = document.getElementById('notify');
  const confirm = document.getElementById('confirm');
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const input = document.getElementById('email');
    const button = form.querySelector('button');
    const email = input.value.trim();

    if (!EMAIL_REGEX.test(email)){
      input.setCustomValidity('Please enter a valid email address.');
      input.reportValidity();
      return;
    }
    input.setCustomValidity('');

    button.disabled = true;
    try {
      const response = await fetch('/subscribe',{
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      });
      if (response.ok){
        form.classList.add('hide');
        confirm.classList.add('show');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('email').addEventListener('input', (e)=> e.target.setCustomValidity(''));

  // Nav "Get notified": center the form on screen and put the cursor in the email box
  document.querySelector('.nav-cta').addEventListener('click', (e)=>{
    e.preventDefault();
    const target = form.classList.contains('hide') ? confirm : form;
    target.scrollIntoView({ behavior:'smooth', block:'center' });
    if (target === form) document.getElementById('email').focus({ preventScroll:true });
  });


  // Gallery dots sync to horizontal scroll position
  const scroller = document.getElementById('scroller');
  const dots = Array.from(document.querySelectorAll('#dots .dot'));
  const frames = Array.from(document.querySelectorAll('.frame'));

  function updateDots(){
    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    frames.forEach((f, i) => {
      const dist = Math.abs((f.offsetLeft + f.clientWidth / 2) - scrollerCenter);
      if(dist < closestDist){ closestDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closest));
  }

  scroller.addEventListener('scroll', updateDots, { passive:true });
  window.addEventListener('resize', updateDots);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      frames[i].scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
    });
  });