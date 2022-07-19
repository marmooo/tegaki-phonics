const playPanel=document.getElementById("playPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),tegakiPanel=document.getElementById("tegakiPanel");let canvases=[...tegakiPanel.getElementsByTagName("canvas")];const gameTime=180;let pads=[],problems=[],answered=!1,hinted=!1,problemCandidate,answerEn="Gopher",answerJa="ゴファー",firstRun=!0,englishVoices=[],correctCount=problemCount=0;const canvasCache=document.createElement("canvas").getContext("2d");let endAudio,correctAudio;loadAudios();const AudioContext=window.AudioContext||window.webkitAudioContext,audioContext=new AudioContext;loadConfig();function loadConfig(){if(localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark"),localStorage.getItem("furigana")==1){const a=document.getElementById("addFurigana");addFurigana(a),a.setAttribute("data-done",!0)}}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}function addFurigana(){const a=document.getElementById("addFurigana");a.getAttribute("data-done")?(localStorage.setItem("furigana",0),location.reload()):(import("https://marmooo.github.io/yomico/yomico.min.js").then(a=>{a.yomico("index.yomi")}),localStorage.setItem("furigana",1),a.setAttribute("data-done",!0))}function playAudio(c,b){const a=audioContext.createBufferSource();if(a.buffer=c,b){const c=audioContext.createGain();c.gain.value=b,c.connect(audioContext.destination),a.connect(c),a.start()}else a.connect(audioContext.destination),a.start()}function unlockAudio(){audioContext.resume()}function loadAudio(a){return fetch(a).then(a=>a.arrayBuffer()).then(a=>new Promise((b,c)=>{audioContext.decodeAudioData(a,a=>{b(a)},a=>{c(a)})}))}function loadAudios(){promises=[loadAudio("mp3/end.mp3"),loadAudio("mp3/correct3.mp3")],Promise.all(promises).then(a=>{endAudio=a[0],correctAudio=a[1]})}function loadVoices(){const a=new Promise(function(b){let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",()=>{c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}});a.then(a=>{englishVoices=a.filter(a=>a.lang=="en-US")})}loadVoices();function loopVoice(b,c){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(b);a.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],a.lang="en-US";for(let b=0;b<c;b++)speechSynthesis.speak(a)}function respeak(){loopVoice(answerEn,1)}function setTegakiPanel(){while(tegakiPanel.firstChild)tegakiPanel.removeChild(tegakiPanel.lastChild);pads=[];for(let a=0;a<answerEn.length;a++){const b=createTegakiBox();tegakiPanel.appendChild(b)}const a=tegakiPanel.children;canvases=[...a].map(a=>a.querySelector("canvas"))}function showPredictResult(b,c){const f=canvases.indexOf(b),d=answerEn[f];let e=!1;for(let a=0;a<c.length;a++)if(c[a]==d){e=!0;break}e?b.setAttribute("data-predict",d):b.setAttribute("data-predict",c[0]);let a="";for(let b=0;b<canvases.length;b++){const c=canvases[b].getAttribute("data-predict");c?a+=c:a+=" "}return document.getElementById("reply").textContent=a,a}function initSignaturePad(b){const a=new SignaturePad(b,{minWidth:2,maxWidth:2,penColor:"black",backgroundColor:"white",throttle:0,minDistance:0});return a.addEventListener("endStroke",()=>{predict(a.canvas)}),a}function getImageData(d){const b=inputHeight=28;canvasCache.drawImage(d,0,0,b,inputHeight);const c=canvasCache.getImageData(0,0,b,inputHeight),a=c.data;for(let b=0;b<a.length;b+=4)a[b]=255-a[b],a[b+1]=255-a[b+1],a[b+2]=255-a[b+2];return c}function predict(a){const b=getImageData(a),c=canvases.indexOf(a);worker.postMessage({imageData:b,pos:c})}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a)+a)}function hideAnswer(){document.getElementById("answer").classList.add("d-none")}function showAnswer(){hinted=!0,document.getElementById("answer").classList.remove("d-none"),document.getElementById("answerEn").textContent=answerEn,document.getElementById("answerJa").textContent=answerJa}function nextProblem(){answered=hinted=!1;const a=document.getElementById("searchButton");a.disabled=!0,setTimeout(()=>{a.disabled=!1},2e3),problemCount+=1,problemCandidate.length<=0&&(problemCandidate=problems.slice());const b=problemCandidate.splice(getRandomInt(0,problemCandidate.length),1)[0],c=document.getElementById("cse-search-input-box-id"),[d,e]=b;answerEn=d,answerJa=e,c.value=answerJa,document.getElementById("reply").textContent="",hideAnswer(),document.getElementById("mode").textContent=="EASY"&&loopVoice(answerEn,3),document.getElementById("answer").classList.remove("d-none"),document.getElementById("answerEn").textContent="",document.getElementById("answerJa").textContent=answerJa,document.getElementById("wordLength").textContent=answerEn.length}function initProblems(){const a=document.getElementById("gradeOption").radio.value;fetch("data/"+a+".csv").then(a=>a.text()).then(a=>{problems=[],a.trim().split(/\n/).forEach(a=>{const[b,c]=a.split(",");problems.push([b,c])}),problemCandidate=problems.slice()})}function searchByGoogle(c){c.preventDefault();const a=document.getElementById("cse-search-input-box-id"),b=google.search.cse.element.getElement("searchresults-only0");if(nextProblem(),a.value==""?b.clearAllResults():b.execute(a.value),setTegakiPanel(),firstRun){const a=document.getElementById("gophers");while(a.firstChild)a.removeChild(a.lastChild);unlockAudio(),firstRun=!1}return!1}document.getElementById("cse-search-box-form-id").onsubmit=searchByGoogle;let gameTimer;function startGameTimer(){clearInterval(gameTimer);const a=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(gameTimer),playAudio(endAudio),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),document.getElementById("score").textContent=correctCount,document.getElementById("total").textContent=problemCount)},1e3)}let countdownTimer;function countdown(){clearTimeout(countdownTimer),countPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const a=document.getElementById("counter");a.textContent=3,countdownTimer=setInterval(()=>{const b=["skyblue","greenyellow","violet","tomato"];if(parseInt(a.textContent)>1){const c=parseInt(a.textContent)-1;a.style.backgroundColor=b[c],a.textContent=c}else clearTimeout(countdownTimer),countPanel.classList.add("d-none"),playPanel.classList.remove("d-none"),correctCount=problemCount=0,document.getElementById("score").textContent=correctCount,document.getElementById("total").textContent=problemCount,document.getElementById("searchButton").classList.add("animate__heartBeat"),startGameTimer()},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function changeMode(){this.textContent=="EASY"?this.textContent="HARD":this.textContent="EASY"}customElements.define("tegaki-box",class extends HTMLElement{constructor(){super();const a=document.getElementById("tegaki-box").content.cloneNode(!0),c=a.querySelector("canvas"),b=initSignaturePad(c);a.querySelector(".eraser").onclick=()=>{b.clear()},pads.push(b),this.attachShadow({mode:"open"}).appendChild(a)}});function createTegakiBox(){const a=document.createElement("div"),c=document.getElementById("tegaki-box").content.cloneNode(!0);a.appendChild(c);const d=a.querySelector("canvas"),b=initSignaturePad(d);return a.querySelector(".eraser").onclick=()=>{b.clear()},pads.push(b),a}canvases.forEach(a=>{const b=initSignaturePad(a);pads.push(b),a.parentNode.querySelector(".eraser").onclick=()=>{b.clear(),showPredictResult(a," ")}});const worker=new Worker("worker.js");worker.addEventListener("message",a=>{if(answered)return;const b=showPredictResult(canvases[a.data.pos],a.data.result);b==answerEn&&(answered=!0,hinted||(correctCount+=1),playAudio(correctAudio),loopVoice(answerEn,1),document.getElementById("reply").textContent="⭕ "+answerEn,document.getElementById("searchButton").classList.add("animate__heartBeat"))}),initProblems(),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("addFurigana").onclick=addFurigana,document.getElementById("mode").onclick=changeMode,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("respeak").onclick=respeak,document.getElementById("showAnswer").onclick=showAnswer,document.getElementById("searchButton").addEventListener("animationend",a=>{a.target.classList.remove("animate__heartBeat")}),document.getElementById("mode").onclick=changeMode,document.getElementById("gradeOption").onchange=initProblems,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0}),document.ondblclick=a=>{a.preventDefault()},document.body.style.webkitUserSelect="none"