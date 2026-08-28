const cabins = [
  // Adicione/remova caminhos no array images para colocar quantas fotos quiser em cada cabana.
  {name:'Vale dos Sonhos', desc:'2 adultos | 1 criança menor de 7 anos', price:'A partir de R$ 189 por noite', images:['assets/cabana.jpeg','assets/hero-cabana.jpeg','assets/experiencia.jpeg']},
  {name:'Cabana Mirante', desc:'Refúgio para casal com vista panorâmica', price:'Consulte valores e datas', images:['assets/hero-cabana.jpeg','assets/cabana.jpeg','assets/experiencia.jpeg']},
  {name:'Jardim Secreto', desc:'Privacidade, natureza e conforto', price:'Consulte valores e datas', images:['assets/experiencia.jpeg','assets/cabana.jpeg','assets/hero-cabana.jpeg']},
  {name:'Valle Sagrado', desc:'Experiência romântica em meio à natureza', price:'Consulte valores e datas', images:['assets/cabana.jpeg','assets/experiencia.jpeg','assets/hero-cabana.jpeg']}
];
let reservations=[]; let viewDate=new Date(); let start=null,end=null;
const $=s=>document.querySelector(s);
function iso(d){return d.toISOString().slice(0,10)}
function dateBR(s){return new Date(s+'T00:00:00').toLocaleDateString('pt-BR')}
function occupied(cabin, d){return reservations.some(r=>r.cabin===cabin&&r.status!=='cancelled'&&r.checkIn<=d&&d<r.checkOut)}
async function loadReservations(){
  try{const r=await fetch('/api/reservations'); reservations=await r.json()}catch{reservations=[]}
  renderCalendar(); renderAvailability();
}
function renderCabins(){
  $('#cabinGrid').innerHTML=cabins.map((c,index)=>{
    const photos=(c.images||[c.image]).filter(Boolean);
    return `<article class="cabin-card" data-carousel="${index}">
      <div class="cabin-carousel" data-carousel-index="${index}">
        <div class="carousel-track">${photos.map((photo,i)=>`<img class="carousel-slide ${i===0?'is-active':''}" src="${photo}" alt="${c.name} — foto ${i+1}" loading="lazy">`).join('')}</div>
        ${photos.length>1?`<button class="carousel-arrow prev" type="button" aria-label="Foto anterior de ${c.name}" data-carousel-action="prev">‹</button><button class="carousel-arrow next" type="button" aria-label="Próxima foto de ${c.name}" data-carousel-action="next">›</button><div class="carousel-dots" aria-label="Fotos de ${c.name}">${photos.map((_,i)=>`<button type="button" class="carousel-dot ${i===0?'is-active':''}" aria-label="Ir para foto ${i+1}" data-slide="${i}"></button>`).join('')}</div>`:''}
        <span class="carousel-counter">1 / ${photos.length}</span>
      </div>
      <div class="cabin-body"><p>${c.desc}</p><h3>${c.name}</h3><div class="price">${c.price}</div><a class="btn" href="#reservas" data-cabin="${c.name}">CONSULTAR DATAS</a></div>
    </article>`;
  }).join('');
  $('#cabinSelect').innerHTML=cabins.map(c=>`<option>${c.name}</option>`).join('');
  document.querySelectorAll('[data-cabin]').forEach(b=>b.addEventListener('click',()=>$('#cabinSelect').value=b.dataset.cabin));
  initCarousels();
}

function initCarousels(){
  document.querySelectorAll('.cabin-carousel').forEach(carousel=>{
    const slides=[...carousel.querySelectorAll('.carousel-slide')];
    const dots=[...carousel.querySelectorAll('.carousel-dot')];
    const counter=carousel.querySelector('.carousel-counter');
    let current=0;
    let touchStartX=0;
    const show=(index)=>{
      current=(index+slides.length)%slides.length;
      slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===current));
      dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===current));
      if(counter) counter.textContent=`${current+1} / ${slides.length}`;
    };
    carousel.querySelector('[data-carousel-action="prev"]')?.addEventListener('click',()=>show(current-1));
    carousel.querySelector('[data-carousel-action="next"]')?.addEventListener('click',()=>show(current+1));
    dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.slide))));
    carousel.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
    carousel.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchStartX;if(Math.abs(delta)>45) show(current+(delta<0?1:-1));},{passive:true});
  });
}
function renderCalendar(){
  const y=viewDate.getFullYear(),m=viewDate.getMonth(); $('#monthTitle').textContent=viewDate.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const first=new Date(y,m,1), last=new Date(y,m+1,0); let html=['dom','seg','ter','qua','qui','sex','sáb'].map(x=>`<div class="dow">${x}</div>`).join('');
  for(let i=0;i<first.getDay();i++) html+=`<button class="day muted" tabindex="-1"></button>`;
  const selectedCabin=$('#cabinSelect')?.value||cabins[0].name;
  for(let n=1;n<=last.getDate();n++){
    const d=new Date(y,m,n),s=iso(d),busy=occupied(selectedCabin,s),isStart=start===s,isEnd=end===s,inRange=start&&end&&s>start&&s<end;
    html+=`<button class="day ${busy?'occupied ':''}${isStart||isEnd?'selected ':''}${inRange?'inrange ':''}${iso(new Date())===s?'today':''}" ${busy?'disabled':''} data-date="${s}">${n}</button>`;
  }
  $('#calendar').innerHTML=html;
  document.querySelectorAll('.day[data-date]').forEach(b=>b.addEventListener('click',()=>selectDate(b.dataset.date)));
}
function selectDate(s){
  if(!start||end||s<start){start=s;end=null}
  else if(s===start)return;
  else{end=s; if(hasConflict($('#cabinSelect').value,start,end)){end=null;$('#formMessage').textContent='Há uma ocupação nesse intervalo. Escolha outras datas.'}}
  $('#checkIn').value=start||'';$('#checkOut').value=end||'';renderCalendar();
}
function hasConflict(cabin,a,b){let d=new Date(a+'T00:00:00'),last=new Date(b+'T00:00:00');while(d<last){if(occupied(cabin,iso(d)))return true;d.setDate(d.getDate()+1)}return false}
function renderAvailability(){
  const month=String(viewDate.getMonth()+1).padStart(2,'0'),year=viewDate.getFullYear();
  const rows=cabins.map(c=>{let busy=reservations.filter(r=>r.cabin===c.name&&r.status!=='cancelled'&&r.checkOut>=`${year}-${month}-01`&&r.checkIn<=`${year}-${month}-31`);return `<div class="avail-row"><span>${c.name}</span><span class="${busy.length?'status-busy':'status-ok'}">${busy.length?'Ocupada em datas reservadas':'Disponível'}</span></div>`}).join('');
  $('#availabilityList').innerHTML='<h4>Resumo de disponibilidade</h4>'+rows;
}
$('#prevMonth').onclick=()=>{viewDate.setMonth(viewDate.getMonth()-1);renderCalendar();renderAvailability()};
$('#nextMonth').onclick=()=>{viewDate.setMonth(viewDate.getMonth()+1);renderCalendar();renderAvailability()};
$('#cabinSelect').onchange=()=>{start=null;end=null;$('#checkIn').value='';$('#checkOut').value='';renderCalendar()};
$('#checkIn').onchange=e=>{start=e.target.value;end=null;$('#checkOut').value='';renderCalendar()};
$('#checkOut').onchange=e=>{end=e.target.value;if(!start||end<=start||hasConflict($('#cabinSelect').value,start,end)){end=null;e.target.value='';$('#formMessage').textContent='Escolha um período válido e disponível.'}renderCalendar()};
$('#bookingForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),body=Object.fromEntries(fd);if(!start||!end){$('#formMessage').textContent='Selecione check-in e check-out.';return}body.checkIn=start;body.checkOut=end;$('#formMessage').textContent='Enviando...';try{const r=await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Não foi possível reservar.');$('#formMessage').textContent=`Reserva confirmada para ${data.cabin}, de ${dateBR(data.checkIn)} a ${dateBR(data.checkOut)}.`;e.target.reset();start=end=null;await loadReservations()}catch(err){$('#formMessage').textContent=err.message}};
$('.menu').onclick=()=>$('.topbar').classList.toggle('menu-open');
$('#year').textContent=new Date().getFullYear();renderCabins();loadReservations();
