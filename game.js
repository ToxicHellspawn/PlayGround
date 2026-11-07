(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);
  const state = { trust: 1, stage: 0, found: new Set(), shown: new Set(), done: false, sound: false, tick: 0 };
  let rainAudio = null;
  let choiceCursor = 0;
  const clues = {
    bin: { name: 'Tin star pin', icon: '✦', text: 'A little tin star with your initials scratched on the back: M.V. Aunt June gave it to you after you got lost at the planetarium. “Find your own north,” she said.' },
    puddle: { name: 'Voicemail', icon: '♫', text: 'Your cracked phone still has Aunt June’s last voicemail. At the end she says your private sign-off: “Same moon, same side.”' },
    poster: { name: 'Old photo', icon: '▧', text: 'A rain-softened photo tucked beneath a poster: you and a young raccoon, sharing a blueberry muffin on the fire escape. On the back: “Mara & Rasputin, best team.”' }
  };
  const turns = [
    { prompt: 'HOW DO YOU BEGIN?', lines: [
      ['Take a breath. “Okay. Tell me how you got my card.”', 'A little patience goes a long way.', 1],
      ['“That’s my face on the card. Hand it over.”', 'Maybe volume is not the same thing as proof.', -1],
      ['“Well, I do enjoy dumpster snacks…”', 'Rasputin looks briefly, dangerously hopeful.', 0]
    ]},
    { prompt: 'WHAT DO YOU ASK?', lines: [
      ['“What did you find in the wallet besides the card?”', 'You give him room to tell the truth.', 1],
      ['“You can borrow my name, but you can’t be me.”', 'He studies you. “That’s what a raccoon would say.”', 0],
      ['“I could have you relocated by sunrise.”', 'His ringed tail goes rigid. Not your best move.', -1]
    ]},
    { prompt: 'MAKE IT PERSONAL', lines: [
      ['Ask the question only you and Aunt June know.', 'A good memory is better than a perfect alibi.', 1, 'puddle'],
      ['“You know my name. What else do you know?”', 'He falters, but the little thief keeps listening.', 0],
      ['“You’re a raccoon. I’m calling animal control.”', '“I am a citizen,” he hisses, clutching the wallet.', -1]
    ]},
    { prompt: 'WHAT HAPPENS NEXT?', lines: [
      ['“Let’s get your name back, and fix mine together.”', 'For the first time, he looks less like a thief than a friend.', 1],
      ['“Keep the card for now. Just tell me the truth.”', 'The wallet lowers a little. It is a start.', 0],
      ['Reach for the wallet while he’s distracted.', 'A blur of fur. The wallet is somehow in his other paw.', -1]
    ]}
  ];
  const palette = { night:'#191b2b', navy:'#25253a', roof:'#343149', brick:'#48363b', brick2:'#5a4143', window:'#e9ae69', glow:'#f3ca86', wall:'#292a39', dark:'#181923', puddle:'#34384b', blue:'#707b9a', coat:'#bc7651', coat2:'#d39163', cream:'#eee0be', mask:'#252431', tail:'#9c5e43' };

  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function drawRaccoon(x,y,s=1){
    // Tail and striped silhouette
    rect(x+22*s,y+42*s,24*s,12*s,palette.tail); rect(x+35*s,y+39*s,15*s,10*s,'#d39b6c');
    rect(x+47*s,y+38*s,12*s,9*s,palette.tail); rect(x+57*s,y+36*s,9*s,8*s,'#d39b6c'); rect(x+63*s,y+35*s,7*s,7*s,palette.tail);
    // ears, head, mask
    rect(x+16*s,y+3*s,9*s,12*s,palette.coat);rect(x+42*s,y+2*s,10*s,13*s,palette.coat);
    rect(x+19*s,y+8*s,29*s,24*s,palette.coat2);rect(x+13*s,y+17*s,43*s,14*s,palette.coat2);
    rect(x+15*s,y+18*s,16*s,9*s,palette.mask);rect(x+33*s,y+18*s,17*s,9*s,palette.mask);
    rect(x+23*s,y+19*s,4*s,4*s,palette.cream);rect(x+40*s,y+19*s,4*s,4*s,palette.cream);rect(x+24*s,y+20*s,2*s,3*s,'#24212a');rect(x+41*s,y+20*s,2*s,3*s,'#24212a');
    rect(x+30*s,y+27*s,7*s,4*s,'#392b2c');rect(x+32*s,y+28*s,3*s,2*s,'#f3d9bd');
    // jacket/body, paws, feet
    rect(x+18*s,y+31*s,30*s,25*s,'#515268');rect(x+14*s,y+36*s,8*s,16*s,'#515268');rect(x+46*s,y+34*s,8*s,15*s,'#515268');
    rect(x+12*s,y+49*s,11*s,7*s,palette.coat2);rect(x+45*s,y+46*s,11*s,7*s,palette.coat2);
    rect(x+21*s,y+54*s,10*s,7*s,'#28252d');rect(x+37*s,y+54*s,10*s,7*s,'#28252d');rect(x+20*s,y+60*s,13*s,4*s,'#181923');rect(x+36*s,y+60*s,13*s,4*s,'#181923');
    // stolen ID card
    rect(x+48*s,y+43*s,13*s,9*s,'#eee0be');rect(x+50*s,y+45*s,3*s,3*s,'#b67c62');rect(x+54*s,y+45*s,5*s,1*s,'#77758a');rect(x+54*s,y+48*s,5*s,1*s,'#77758a');
  }
  function drawMara(x,y){
    // little raincoat human silhouette
    rect(x+13,y+1,17,5,'#342b36');rect(x+9,y+6,25,18,'#d79b78');rect(x+7,y+10,5,12,'#d79b78');rect(x+28,y+9,6,12,'#d79b78');
    rect(x+11,y+12,7,3,'#282638');rect(x+23,y+12,7,3,'#282638');rect(x+17,y+17,6,2,'#8e5353');
    rect(x+6,y+24,29,25,'#4e6475');rect(x+2,y+26,7,17,'#4e6475');rect(x+32,y+26,7,16,'#4e6475');
    rect(x+10,y+47,9,13,'#272936');rect(x+23,y+47,9,13,'#272936');rect(x+8,y+59,13,4,'#1b1b25');rect(x+22,y+59,14,4,'#1b1b25');
    rect(x+15,y+29,11,2,'#e1b28c');
  }
  function drawScene(){
    state.tick++;
    const w=640,h=300; rect(0,0,w,h,'#171827');
    // distant rooftops
    rect(0,57,90,120,'#222438');rect(3,47,83,12,'#303044');rect(10,25,27,23,'#26283d');rect(15,19,17,7,'#3b3b4e');
    rect(93,39,106,138,'#29283c');rect(102,27,12,12,'#393548');rect(154,18,29,21,'#242539');rect(160,11,16,8,'#393548');
    rect(466,50,174,126,'#252638');rect(476,35,34,15,'#343448');rect(538,17,21,34,'#222438');rect(535,13,28,5,'#3b3948');rect(584,37,44,13,'#343447');
    // skyline windows
    for(let i=0;i<5;i++){rect(12+i*15,66+(i%2)*3,5,10,i%3?'#646074':'#e3aa6c');rect(104+i*17,54+(i%3)*15,7,9,(i===1||i===4)?'#d5a26c':'#414055');rect(480+i*26,68+(i%2)*21,8,11,(i%3===0)?'#e0ad71':'#47475c')}
    // alley brick walls
    rect(0,167,640,72,'#39323b');rect(0,171,640,3,'#55434a');
    for(let row=0;row<4;row++){let yy=178+row*15;for(let col=-1;col<17;col++){let xx=col*43+(row%2)*21;rect(xx,yy,40,1,'#59454b');rect(xx,yy,1,12,'#2d2934')}}
    // fire escape
    rect(76,111,113,4,'#4c4652');rect(80,113,4,36,'#4c4652');rect(183,113,4,36,'#4c4652');rect(89,90,4,23,'#4c4652');rect(172,90,4,23,'#4c4652');rect(87,91,92,3,'#4c4652');
    // window / neon
    rect(109,68,42,38,'#26283a');rect(113,72,34,30,'#637083');rect(116,75,27,24,'#edbb75');rect(119,78,22,18,'#f5d197');rect(126,74,3,28,'#535164');rect(113,85,34,3,'#535164');
    rect(203,114,49,46,'#252638');rect(208,119,38,38,'#181a28');rect(213,125,28,32,'#242539');
    // poster by right wall
    rect(518,104,50,72,'#82736a');rect(522,108,42,64,'#ddd0ae');rect(526,112,34,10,'#925b50');rect(529,115,27,3,'#f0d4ae');rect(529,128,15,20,'#b17f66');rect(547,130,12,14,'#55556b');rect(527,153,33,2,'#857a6f');rect(527,159,27,2,'#857a6f');
    // bin
    rect(101,179,54,43,'#39444d');rect(96,176,65,7,'#586069');rect(107,222,10,5,'#22232d');rect(140,222,10,5,'#22232d');rect(112,188,4,25,'#59616a');rect(138,188,4,25,'#59616a');
    rect(86,209,10,8,'#b77153');rect(81,205,5,4,'#d99861');rect(155,215,13,6,'#d3b88a');
    // pavement
    rect(0,239,640,61,'#282a39');rect(0,239,640,3,'#51404a');
    for(let i=0;i<9;i++){let xx=(i*87+19)%640;rect(xx,250+(i%3)*13,42,1,'#343748');rect((xx+48)%640,261+(i%2)*9,28,1,'#343748')}
    // puddles reflections
    rect(215,269,133,6,'#3c4054');rect(236,265,90,4,'#4a4b60');rect(427,282,93,4,'#42465a');rect(439,278,67,3,'#52546a');
    // streetlamp
    rect(453,37,4,146,'#45404c');rect(446,34,19,5,'#45404c');rect(442,38,27,4,'#e8b66e');rect(440,42,31,2,'#f7d294');
    // warm lamplight pool
    rect(420,181,70,2,'#c39468');rect(432,178,42,3,'#aa845f');
    // characters
    drawMara(270,174);drawRaccoon(367,165,1);
    // stolen ID speech balloon
    rect(398,133,78,20,'#eee1c8');rect(405,153,5,5,'#eee1c8');rect(406,138,61,2,'#948679');rect(406,143,45,2,'#948679');rect(406,148,34,2,'#948679');
    // occasional rain, no external assets
    for(let i=0;i<34;i++){const rx=(i*97+state.tick*1.35)%650;const ry=(i*43+state.tick*2.7)%210;rect(rx,ry,1,4,'#9aa4c122')}
    // eyes catch a blink
    if(state.tick%190<7){rect(391,185,4,2,'#292633');rect(408,185,4,2,'#292633')}
  }
  function animate(){drawScene();requestAnimationFrame(animate)}
  function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2100)}
  function updateMeter(){
    const pct=Math.max(5,Math.min(100,state.trust/8*100));$('trustFill').style.width=pct+'%';
    const labels=['HOSTILE','WARY','CURIOUS','CONVINCED','TRUSTING'];
    const trustLabel=state.trust<=0?0:Math.min(labels.length-1,Math.floor(state.trust/2));
    $('trustText').textContent=labels[trustLabel];
    $('trustFill').style.background=state.trust>=5?'linear-gradient(90deg,#7ec6a0,#b2edc3)':'linear-gradient(90deg,#e98873,#ffc47d)';
    $('clueCount').textContent=state.found.size;
  }
  function drawChoices(){
    const wrap=$('choices');wrap.innerHTML='';$('evidenceList').innerHTML='';choiceCursor=0;
    if(state.done){
      wrap.className='choices ending';
      const won=state.trust>=5&&state.shown.size>=2;
      const heading=won?'A NAME, RETURNED':'THE NIGHT ISN’T OVER';
      const copy=won?'Rasputin carefully hands back your library card. “I think,” he says, “I’d rather be Rasputin.” You walk home together, carrying the same old photo between you.':'Rasputin disappears into the rain with your library card. You still know who you are. Tomorrow, you’ll come back with a better story—and perhaps a blueberry muffin.';
      wrap.innerHTML=`<div class="ending-card"><strong>${heading}</strong>${copy}<br><button class="restart-button" id="restart">↺ &nbsp;PLAY AGAIN</button></div>`;
      $('promptLabel').textContent='THE END';document.querySelector('.keyboard-hint').textContent='';$('restart').addEventListener('click',restart);return;
    }
    wrap.className='choices';$('promptLabel').textContent=turns[state.stage].prompt;
    turns[state.stage].lines.forEach((line,i)=>{
      const btn=document.createElement('button');btn.className='choice';btn.innerHTML=`<span class="key">0${i+1}</span>${line[0]}<span class="choice-note">${line[3]&&!state.found.has(line[3])?'(a detail might help)':''}</span>`;
      btn.addEventListener('click',()=>choose(line));wrap.appendChild(btn);
    });
    [...state.found].filter(id=>!state.shown.has(id)).forEach(id=>{
      const clue=clues[id],btn=document.createElement('button');btn.className='evidence-chip';btn.innerHTML=`${clue.icon} ${clue.name}`;btn.title='Present this clue to Rasputin';btn.addEventListener('click',()=>present(id));$('evidenceList').appendChild(btn);
    });
    if(!state.found.size)$('evidenceList').innerHTML='<span class="evidence-empty">Nothing yet…</span>';
  }
  function setDialogue(speaker,mood,text){$('speaker').textContent=speaker;$('mood').textContent=mood;$('dialogue').textContent=text}
  function choose(line){
    if(state.done)return;
    const [label,response,points,related]=line;
    let delta=points;
    if(related&&!state.found.has(related))delta=0;
    state.trust+=delta;
    const mood=state.trust>=5?'A LITTLE LESS SURE':state.trust>=3?'LISTENING':'STILL WARY';
    setDialogue('RASPUTIN',mood,`“${response}”`);
    state.stage++;
    updateMeter();
    if(state.stage>=turns.length){state.done=true;setTimeout(()=>{drawChoices();$('actionArea').scrollIntoView({behavior:'smooth',block:'nearest'});},200)}else drawChoices();
  }
  function present(id){
    if(state.shown.has(id)||state.done)return;
    const clue=clues[id];state.shown.add(id);state.trust++;
    const responses={bin:'He turns the little star over. “Aunt June gave you that. You cried all the way home when you thought you’d lost it.” He remembers.',puddle:'At the secret sign-off, the raccoon’s ears tilt. “Same moon, same side,” he whispers. “She said that to you every night.”',poster:'He stares at the faded photo. “That was the first muffin you shared with me. You called me Rasputin because I was dramatic.”'};
    setDialogue('RASPUTIN','A MEMORY STIRS',`You show him ${clue.name.toLowerCase()}. “${responses[id]}”`);
    updateMeter();document.querySelectorAll('.evidence-chip').forEach(el=>{if(el.textContent.includes(clue.name))el.remove()});
    toast('PROOF SHARED · TRUST +1');
  }
  function inspect(id){if(state.found.has(id))return;state.found.add(id);document.querySelector(`.hs-${id}`).classList.remove('visible');$('sceneHint').textContent=state.found.size===3?'ALL CLUES FOUND':'LOOK AROUND · '+(3-state.found.size)+' CLUE'+(3-state.found.size===1?'':'S');updateMeter();drawChoices();toast(`${clues[id].icon} FOUND: ${clues[id].name.toUpperCase()}`);setDialogue('YOU','FOUND SOMETHING',clues[id].text)}
  function restart(){state.trust=1;state.stage=0;state.found.clear();state.shown.clear();state.done=false;document.querySelectorAll('.hotspot').forEach(el=>el.classList.add('visible'));$('sceneHint').textContent='LOOK AROUND · 3 CLUES';$('evidenceList').innerHTML='';$('actionArea').classList.remove('ending');setDialogue('RASPUTIN','NOT CONVINCED','“I am Mara Vale,” the raccoon says, holding your library card upside down. “So unless you can prove otherwise, you’re the raccoon.”');updateMeter();drawChoices()}
  document.querySelectorAll('.hotspot').forEach(el=>el.addEventListener('click',()=>inspect(el.dataset.clue)));
  $('restartTop').addEventListener('click',restart);
  $('soundToggle').addEventListener('click',async()=>{
    state.sound=!state.sound;
    $('soundToggle').querySelector('b').textContent=state.sound?'ON':'OFF';
    if(state.sound){
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(AudioContext){
        if(!rainAudio){
          const audio=new AudioContext(),buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buffer.getChannelData(0);
          for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.35;
          const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
          source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=720;gain.gain.value=.035;
          source.connect(filter).connect(gain).connect(audio.destination);source.start();rainAudio={audio,source,gain};
        }
        await rainAudio.audio.resume();rainAudio.gain.gain.setTargetAtTime(.035,rainAudio.audio.currentTime,.25);
      }
      toast('SOFT RAIN · AMBIENCE ON');
    }else{
      if(rainAudio)rainAudio.gain.gain.setTargetAtTime(0,rainAudio.audio.currentTime,.12);
      toast('AMBIENCE OFF');
    }
  });
  document.addEventListener('keydown',e=>{
    if(state.done)return;
    const buttons=[...document.querySelectorAll('.choice')];
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      choiceCursor=(choiceCursor+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
      buttons[choiceCursor]?.focus();
    }else if(['1','2','3'].includes(e.key)){
      buttons[Number(e.key)-1]?.click();
    }else if(e.key==='Enter'){
      const focused=document.activeElement;
      if(focused?.classList.contains('choice'))focused.click();
      else buttons[choiceCursor]?.click();
    }
  });
  document.querySelectorAll('.hotspot').forEach(el=>el.classList.add('visible'));
  updateMeter();drawChoices();animate();
})();
