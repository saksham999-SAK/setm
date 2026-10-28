const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const toast = (message) => {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(()=>el.classList.remove('show'), 2800);
};
function showPage(name){
  $$('.page').forEach(p=>p.classList.toggle('active-page', p.id === `page-${name}`));
  $$('.nav-link[data-page]').forEach(b=>b.classList.toggle('active', b.dataset.page===name));
  const label = ({discover:'Discover',myteam:'My team',hackathons:'Hackathons',invitations:'Invitations',profile:'My profile'})[name] || 'Discover';
  $('#pageCrumb').textContent=label;
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('[data-page]').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
$('#findTeamBtn').addEventListener('click',()=>{ $('#searchInput').focus(); $('#matchGrid').scrollIntoView({behavior:'smooth',block:'center'}); toast('Your recommended teammates are below.'); });
$('#filterToggle').addEventListener('click',()=>$('#filterPanel').classList.toggle('open'));
function filterMatches(){
  const q=$('#searchInput').value.trim().toLowerCase();
  const skill=$('#skillFilter').value;
  const avail=$('#availabilityFilter').value;
  let count=0;
  $$('.match-card').forEach(card=>{
    const text=(card.dataset.name+' '+card.dataset.skills+' '+card.innerText).toLowerCase();
    const okQ=!q||text.includes(q);
    const okS=skill==='all'||card.dataset.primary===skill||card.dataset.skills.toLowerCase().includes(skill.toLowerCase());
    const okA=avail==='all'||card.dataset.availability===avail;
    card.classList.toggle('hidden',!(okQ&&okS&&okA)); if(okQ&&okS&&okA)count++;
  });
  $('#matchCount').textContent=String(count).padStart(2,'0');
}
$('#searchInput').addEventListener('input',filterMatches);
$('#skillFilter').addEventListener('change',filterMatches);
$('#availabilityFilter').addEventListener('change',filterMatches);
$('#clearFilters').addEventListener('click',()=>{$('#searchInput').value='';$('#skillFilter').value='all';$('#availabilityFilter').value='all';filterMatches();toast('Filters cleared.');});
$('#sortBtn').addEventListener('click',()=>{
  const grid=$('#matchGrid'); const cards=$$('.match-card',grid).sort((a,b)=>Number(b.dataset.score)-Number(a.dataset.score));
  cards.forEach(c=>grid.appendChild(c)); toast('Sorted by compatibility score.');
});
let modalAction=null;
function openModal(title,text,extra,action){
  $('#modalTitle').textContent=title;$('#modalText').textContent=text;$('#modalExtra').innerHTML=extra||'';
  modalAction=action;$('#modalBackdrop').classList.add('open');
}
function closeModal(){$('#modalBackdrop').classList.remove('open');modalAction=null;}
$('#modalClose').addEventListener('click',closeModal);$('#modalCancel').addEventListener('click',closeModal);
$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});
$('#modalConfirm').addEventListener('click',()=>{if(modalAction)modalAction();closeModal();});
$$('[data-invite]').forEach(btn=>btn.addEventListener('click',()=>{
  const name=btn.dataset.invite;
  openModal('Invite '+name,`Send ${name} an invitation to join Build for Tomorrow.`, '<div class="modal-extra-box">Team: Build for Tomorrow · Code for Good 2026<br>Open role: based on current team skill gaps</div>',()=>{
    btn.textContent='Invited ✓';btn.disabled=true;btn.style.opacity='.65';
    $('#sentTabCount').textContent=String(Number($('#sentTabCount').textContent)+1);
    toast(`Invitation sent to ${name} (demo).`);
  });
}));
$$('.event-details').forEach(btn=>btn.addEventListener('click',()=>{
  const name=btn.dataset.event;
  const details={
    'Code for Good 2026':'48-hour in-person event · Teams of 3–5 · Social impact theme.',
    'Sparkathon':'36-hour online event · Teams of 2–4 · Open innovation.',
    'Inclusive Innovators':'24-hour hybrid event · Teams of 2–5 · Accessibility theme.'
  };
  openModal(name,details[name]+' This is sample event information for the HackMatch demo.', '<div class="modal-extra-box">Eligibility: Open to registered participants<br>Team formation: Supported by HackMatch</div>',()=>toast(`Opened ${name} details (demo).`));
}));
$$('.tab').forEach(tab=>tab.addEventListener('click',()=>{
  $$('.tab').forEach(t=>t.classList.toggle('active',t===tab));
  const kind=tab.dataset.tab;let visible=0;
  $$('.invitation-row').forEach(row=>{const ok=row.dataset.kind===kind;row.classList.toggle('hidden',!ok);if(ok)visible++;});
  if(!visible)$('#invitationList').insertAdjacentHTML('beforeend','<div class="empty-state" id="emptyInvites">Nothing here yet.</div>');
  else $('#emptyInvites')?.remove();
}));
$$('.accept-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const row=btn.closest('.invitation-row'); const name=$('b',row)?.textContent.trim()||'Request';
  openModal('Confirm acceptance?','Accepting this will update the sample invitation or join-request status.','<div class="modal-extra-box">Demo mode: no backend or real account changes are connected.</div>',()=>{
    row.querySelector('.invitation-actions').innerHTML='<span class="status-pill">Accepted ✓</span>';toast('Accepted in demo.');updateInviteCount();
  });
}));
$$('.reject-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const row=btn.closest('.invitation-row');
  openModal('Decline this request?','The item will be marked declined in this local demo.','',()=>{
    row.querySelector('.invitation-actions').innerHTML='<span class="pending-label">Declined</span>';toast('Declined in demo.');updateInviteCount();
  });
}));
function updateInviteCount(){
  const n=$$('.invitation-row[data-kind="received"] .invitation-actions .accept-btn').length;
  $('#inviteCount').textContent=String(n);
}
$('#saveProfileBtn').addEventListener('click',()=>{
  const name=$('#profileName').value.trim();
  if(!name){toast('Please enter a display name.');return;}
  $('.user-mini strong').textContent=name;
  $('.profile-summary h2').textContent=name;
  toast('Profile updated for this demo session.');
});
$('#portfolioBtn').addEventListener('click',()=>openModal('Portfolio link','Add a portfolio URL to your profile to make it available here.','<label style="display:grid;gap:7px;font-size:11px;color:#777"><span>Portfolio URL</span><input id="portfolioUrl" placeholder="https://your-portfolio.example" style="padding:10px;border:1px solid #e8e7f0;border-radius:8px;width:100%"></label>',()=>toast('Portfolio action is a UI demo only.')));
$('#editTeamBtn').addEventListener('click',()=>openModal('Edit team','Team details can be edited here in a connected implementation.','<div class="modal-extra-box">Current team: Build for Tomorrow<br>Recruiting: Yes · Target size: 5</div>',()=>toast('Team edit saved in demo.')));
$('#createHackathonBtn').addEventListener('click',()=>openModal('Create a hackathon','Organizer event creation is represented as a demo interaction.','<div class="modal-extra-box">A connected version would validate organizer permissions, deadlines, eligibility, and team-size limits.</div>',()=>toast('Event creation is not connected to a backend yet.')));
$('#notificationBtn').addEventListener('click',()=>openModal('Notifications','Here are the latest sample updates.','<div class="modal-extra-box">• Rohan invited you to Team Nova<br>• Meera invited you to GreenByte<br>• Kabir requested to join your team</div>',()=>toast('Notifications viewed.')));
$('#helpBtn').addEventListener('click',()=>openModal('Help & feedback','HackMatch helps you discover teammates and form hackathon teams.','<div class="modal-extra-box">This prototype uses sample data and local interactions. It does not send real invitations.</div>',()=>toast('Thanks for checking the demo.')));
$('#inviteFilterBtn').addEventListener('click',()=>toast('Choose Received, Sent, or Join requests using the tabs below.'));
$('#profileSkills,#profileTech,#profileAbout,#profileHeadline').forEach(el=>el.addEventListener('input',()=>{
  const filled=[$('#profileName').value,$('#profileHeadline').value,$('#profileAbout').value,$('#profileSkills').value,$('#profileTech').value].filter(x=>x.trim()).length;
  const score=Math.round(filled/5*100);$('#profileStrength').textContent=score+'%';$('#profileStrengthBar').style.width=score+'%';
}));
filterMatches();
