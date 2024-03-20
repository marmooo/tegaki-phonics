import signaturePad from"https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/+esm";const playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),tegakiPanel=document.getElementById("tegakiPanel");let canvases=[...tegakiPanel.getElementsByTagName("canvas")];const gameTime=180;let gameTimer,pads=[],problems=[],hinted=!1,problemCandidate,answerEn="cat",answerJa="ねこ",correctCount=0,totalCount=0;const canvasCache=document.createElement("canvas").getContext("2d",{alpha:!1,willReadFrequently:!0}),audioContext=new globalThis.AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3");let englishVoices=[];loadVoices(),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}async function playAudio(e,t){const s=await loadAudio(e,audioBufferCache[e]),n=audioContext.createBufferSource();if(n.buffer=s,t){const e=audioContext.createGain();e.gain.value=t,e.connect(audioContext.destination),n.connect(e),n.start()}else n.connect(audioContext.destination),n.start()}async function loadAudio(e,t){if(audioBufferCache[e])return audioBufferCache[e];const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}function unlockAudio(){audioContext.resume()}function loadVoices(){const e=new Promise(e=>{let t=speechSynthesis.getVoices();if(t.length!==0)e(t);else{let n=!1;speechSynthesis.addEventListener("voiceschanged",()=>{n=!0,t=speechSynthesis.getVoices(),e(t)}),setTimeout(()=>{n||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),t=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];e.then(e=>{englishVoices=e.filter(e=>e.lang=="en-US").filter(e=>!t.includes(e.voiceURI))})}function loopVoice(e,t){speechSynthesis.cancel();const n=new globalThis.SpeechSynthesisUtterance(e);n.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],n.lang="en-US";for(let e=0;e<t;e++)speechSynthesis.speak(n)}function respeak(){loopVoice(answerEn,1)}function setTegakiPanel(){for(;tegakiPanel.firstChild;)tegakiPanel.removeChild(tegakiPanel.lastChild);pads=[];for(let e=0;e<answerEn.length;e++){const t=createTegakiBox();tegakiPanel.appendChild(t)}const e=tegakiPanel.children;canvases=[...e].map(e=>e.querySelector("canvas"))}function showPredictResult(e,t){const i=canvases.indexOf(e),s=answerEn[i];let o=!1;for(let e=0;e<t.length;e++)if(t[e]==s){o=!0;break}o?e.setAttribute("data-predict",s):e.setAttribute("data-predict",t[0]);let n="";for(let e=0;e<canvases.length;e++){const t=canvases[e].getAttribute("data-predict");t?n+=t:n+=" "}return document.getElementById("reply").textContent=n,n}function initSignaturePad(e){const t=new signaturePad(e,{minWidth:2,maxWidth:2,penColor:"black",backgroundColor:"white",throttle:0,minDistance:0});return t.addEventListener("endStroke",()=>{predict(t.canvas)}),t}function getImageData(e){const n=28,s=28;canvasCache.drawImage(e,0,0,n,s);const o=canvasCache.getImageData(0,0,n,s),t=o.data;for(let e=0;e<t.length;e+=4)t[e]=255-t[e],t[e+1]=255-t[e+1],t[e+2]=255-t[e+2];return o}function predict(e){const t=getImageData(e),n=canvases.indexOf(e);worker.postMessage({imageData:t,pos:n})}function getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e)+e)}function hideAnswer(){document.getElementById("answerEn").classList.add("d-none")}function showAnswer(){hinted=!0,loopVoice(answerEn,1),document.getElementById("answerEn").classList.remove("d-none")}function nextProblem(){hinted=!1,problemCandidate.length<=0&&(problemCandidate=problems.slice());const e=problemCandidate.splice(getRandomInt(0,problemCandidate.length),1)[0];document.getElementById("reply").textContent="";const[t,n,s]=e;answerEn=t,answerJa=n,document.getElementById("answerEn").textContent=answerEn,document.getElementById("answerJa").textContent=answerJa,setTegakiPanel(),document.getElementById("mode").textContent=="EASY"?(loopVoice(answerEn,3),document.getElementById("answerEn").classList.remove("d-none")):hideAnswer(),document.getElementById("emoji").textContent=s}function initProblems(){const e=document.getElementById("gradeOption").radio.value;fetch("data/"+e+".csv").then(e=>e.text()).then(e=>{problems=[],e.trim().split(/\n/).forEach(e=>{const[t,n,s]=e.split(",");problems.push([t,n,s])}),problemCandidate=problems.slice()})}function countdown(){countPanel.classList.remove("d-none"),infoPanel.classList.add("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const e=document.getElementById("counter");e.textContent=3;const t=setInterval(()=>{const n=["skyblue","greenyellow","violet","tomato"];if(parseInt(e.textContent)>1){const t=parseInt(e.textContent)-1;e.style.backgroundColor=n[t],e.textContent=t}else clearTimeout(t),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),correctCount=totalCount=0,startGameTimer(),nextProblem()},1e3)}function startGame(){clearInterval(gameTimer),initTime(),countdown()}function startGameTimer(){const e=document.getElementById("time");gameTimer=setInterval(()=>{const t=parseInt(e.textContent);t>0?e.textContent=t-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),scoring())},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function scoring(){document.getElementById("score").textContent=`${correctCount} / ${totalCount}`}function changeMode(e){e.target.textContent=="EASY"?e.target.textContent="HARD":e.target.textContent="EASY"}class TegakiBox extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[globalCSS];const e=document.getElementById("tegaki-box").content.cloneNode(!0),t=e.querySelector("use"),s=t.getAttribute("href").slice(1),o=document.getElementById(s).firstElementChild.cloneNode(!0);t.replaceWith(o),this.shadowRoot.appendChild(e);const i=this.shadowRoot.querySelector("canvas"),n=initSignaturePad(i);this.shadowRoot.querySelector(".eraser").onclick=()=>{n.clear()},pads.push(n),document.documentElement.getAttribute("data-bs-theme")=="dark"&&this.shadowRoot.querySelector("canvas").setAttribute("style","filter: invert(1) hue-rotate(180deg);")}}customElements.define("tegaki-box",TegakiBox);function createTegakiBox(){const e=document.createElement("div"),n=document.getElementById("tegaki-box").content.cloneNode(!0);e.appendChild(n);const s=e.querySelector("canvas"),t=initSignaturePad(s);return e.querySelector(".eraser").onclick=()=>{t.clear()},pads.push(t),e}function getGlobalCSS(){let e="";for(const t of document.styleSheets)try{for(const n of t.cssRules)e+=n.cssText}catch{}const t=new CSSStyleSheet;return t.replaceSync(e),t}const globalCSS=getGlobalCSS();canvases.forEach(e=>{const t=initSignaturePad(e);pads.push(t),e.parentNode.querySelector(".eraser").onclick=()=>{t.clear(),showPredictResult(e," ")}});const worker=new Worker("worker.js");worker.addEventListener("message",e=>{const t=showPredictResult(canvases[e.data.pos],e.data.result);t==answerEn&&(totalCount+=1,hinted||(correctCount+=1),playAudio("correct",.3),loopVoice(answerEn,1),document.getElementById("reply").textContent="⭕ "+answerEn,nextProblem())}),initProblems(),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("mode").onclick=changeMode,document.getElementById("restartButton").onclick=startGame,document.getElementById("startButton").onclick=startGame,document.getElementById("respeak").onclick=respeak,document.getElementById("showAnswer").onclick=showAnswer,document.getElementById("mode").onclick=changeMode,document.getElementById("gradeOption").onchange=initProblems,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})