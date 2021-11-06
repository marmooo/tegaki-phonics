const tegakiPanel = document.getElementById("tegakiPanel");
let canvases = [...tegakiPanel.getElementsByTagName("canvas")];
let pads = [];
let problems = [];
let problemCandidate;
let answerEn = "Gopher";
let answerJa = "ゴファー";
let firstRun = true;
let englishVoices = [];
let hinted = false;
let correctCount = problemCount = 0;
const canvasCache = document.createElement("canvas").getContext("2d");
let endAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
  if (localStorage.getItem("voice") != 1) {
    document.getElementById("voiceOn").classList.add("d-none");
    document.getElementById("voiceOff").classList.remove("d-none");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleVoice() {
  if (localStorage.getItem("voice") == 1) {
    speechSynthesis.cancel();
    localStorage.setItem("voice", 0);
    document.getElementById("voiceOn").classList.add("d-none");
    document.getElementById("voiceOff").classList.remove("d-none");
  } else {
    localStorage.setItem("voice", 1);
    document.getElementById("voiceOn").classList.remove("d-none");
    document.getElementById("voiceOff").classList.add("d-none");
    unlockAudio();
    loopVoice(answerEn, 3);
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/end.mp3"),
    loadAudio("mp3/correct3.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    endAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
  });
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function (resolve) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", function () {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  allVoicesObtained.then((voices) => {
    englishVoices = voices.filter((voice) => voice.lang == "en-US");
  });
}
loadVoices();

function loopVoice(text, n) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = "en-US";
  for (let i = 0; i < n; i++) {
    speechSynthesis.speak(msg);
  }
}

function respeak() {
  loopVoice(answerEn, 1);
}

function setTegakiPanel() {
  while (tegakiPanel.firstChild) {
    tegakiPanel.removeChild(tegakiPanel.lastChild);
  }
  pads = [];
  for (let i = 0; i < answerEn.length; i++) {
    const box = document.createElement("tegaki-box");
    tegakiPanel.appendChild(box);
  }
  const boxes = tegakiPanel.getElementsByTagName("tegaki-box");
  canvases = [...boxes].map((box) => box.shadowRoot.querySelector("canvas"));
}

function showPredictResult(canvas, result) {
  const pos = canvases.indexOf(canvas);
  const answerWord = answerEn[pos];
  let matched = false;
  for (let i = 0; i < result.length; i++) {
    if (result[i] == answerWord) {
      matched = true;
      break;
    }
  }
  if (matched) {
    canvas.setAttribute("data-predict", answerWord);
  } else {
    canvas.setAttribute("data-predict", result[0]);
  }
  let reply = "";
  for (let i = 0; i < canvases.length; i++) {
    const alphabet = canvases[i].getAttribute("data-predict");
    if (alphabet) {
      reply += alphabet;
    } else {
      reply += " ";
    }
  }
  document.getElementById("reply").innerText = reply;
  return reply;
}

function initSignaturePad(canvas) {
  const pad = new SignaturePad(canvas, {
    minWidth: 2,
    maxWidth: 2,
    penColor: "black",
    backgroundColor: "white",
    throttle: 0,
    minDistance: 0,
  });
  pad.onEnd = function () {
    predict(this.canvas);
  };
  return pad;
}

function getImageData(drawElement) {
  const inputWidth = inputHeight = 28;
  // resize
  canvasCache.drawImage(drawElement, 0, 0, inputWidth, inputHeight);
  // invert color
  const imageData = canvasCache.getImageData(0, 0, inputWidth, inputHeight);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

function predict(canvas) {
  const imageData = getImageData(canvas);
  const pos = canvases.indexOf(canvas);
  worker.postMessage({ imageData: imageData, pos: pos });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hideAnswer() {
  document.getElementById("answer").classList.add("d-none");
}

function showAnswer() {
  hinted = true;
  document.getElementById("answer").classList.remove("d-none");
  document.getElementById("answerEn").textContent = answerEn;
  document.getElementById("answerJa").textContent = answerJa;
}

function nextProblem() {
  const searchButton = document.getElementById("searchButton");
  searchButton.disabled = true;
  setTimeout(function () {
    searchButton.disabled = false;
  }, 2000);
  hinted = false;
  problemCount += 1;
  if (problemCandidate.length <= 0) {
    problemCandidate = problems.slice();
  }
  const problem =
    problemCandidate.splice(getRandomInt(0, problemCandidate.length), 1)[0];
  const input = document.getElementById("cse-search-input-box-id");
  const [en, ja] = problem;
  answerEn = en;
  answerJa = ja;
  input.value = answerJa;
  document.getElementById("reply").textContent = "";
  hideAnswer();
  if (document.getElementById("mode").textContent == "EASY") {
    document.getElementById("answer").classList.remove("d-none");
    document.getElementById("answerEn").textContent = answerEn;
    document.getElementById("answerJa").textContent = answerJa;
    if (localStorage.getItem("voice") == 1) {
      loopVoice(answerEn, 3);
    } else {
      speechSynthesis.cancel();
    }
  } else {
    document.getElementById("answer").classList.remove("d-none");
    document.getElementById("answerEn").textContent = "";
    document.getElementById("answerJa").textContent = answerJa;
  }
  document.getElementById("wordLength").innerText = answerEn.length;
}

function initProblems() {
  const grade = document.getElementById("gradeOption").radio.value;
  fetch("data/" + grade + ".csv").then((response) => response.text()).then(
    (tsv) => {
      problems = [];
      tsv.trim().split(/\n/).forEach((line) => {
        const [en, ja] = line.split(",");
        problems.push([en, ja]);
      });
      problemCandidate = problems.slice();
    },
  );
}

function searchByGoogle(event) {
  event.preventDefault();
  const input = document.getElementById("cse-search-input-box-id");
  const element = google.search.cse.element.getElement("searchresults-only0");
  nextProblem();
  if (input.value == "") {
    element.clearAllResults();
  } else {
    element.execute(input.value);
  }
  setTegakiPanel();
  if (firstRun) {
    const gophers = document.getElementById("gophers");
    while (gophers.firstChild) {
      gophers.removeChild(gophers.lastChild);
    }
    unlockAudio();
    firstRun = false;
  }
  return false;
}
document.getElementById("cse-search-box-form-id").onsubmit = searchByGoogle;

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  timeNode.innerText = "180秒 / 180秒";
  gameTimer = setInterval(function () {
    const arr = timeNode.innerText.split("秒 /");
    const t = parseInt(arr[0]);
    if (t > 0) {
      timeNode.innerText = (t - 1) + "秒 /" + arr[1];
    } else {
      clearInterval(gameTimer);
      playAudio(endAudio);
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      document.getElementById("score").textContent = correctCount;
      document.getElementById("total").textContent = problemCount;
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  clearTimeout(countdownTimer);
  gameStart.classList.remove("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.innerText = 3;
  countdownTimer = setInterval(function () {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.innerText) > 1) {
      const t = parseInt(counter.innerText) - 1;
      counter.style.backgroundColor = colors[t];
      counter.innerText = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add("d-none");
      playPanel.classList.remove("d-none");
      correctCount = problemCount = 0;
      document.getElementById("score").textContent = correctCount;
      document.getElementById("total").textContent = problemCount;
      document.getElementById("searchButton").classList.add(
        "animate__heartBeat",
      );
      startGameTimer();
    }
  }, 1000);
}

function changeMode() {
  if (this.textContent == "EASY") {
    this.textContent = "HARD";
  } else {
    this.textContent = "EASY";
  }
}

customElements.define(
  "tegaki-box",
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById("tegaki-box").content.cloneNode(
        true,
      );
      const canvas = template.querySelector("canvas");
      const pad = initSignaturePad(canvas);
      template.querySelector(".eraser").onclick = function () {
        pad.clear();
      };
      pads.push(pad);
      this.attachShadow({ mode: "open" }).appendChild(template);
    }
  },
);

canvases.forEach((canvas) => {
  const pad = initSignaturePad(canvas);
  pads.push(pad);
  canvas.parentNode.querySelector(".eraser").onclick = function () {
    pad.clear();
    showPredictResult(canvas, " ");
  };
});

const worker = new Worker("worker.js");
worker.addEventListener("message", function (e) {
  const reply = showPredictResult(canvases[e.data.pos], e.data.result);
  if (reply == answerEn) {
    if (!hinted) correctCount += 1;
    playAudio(correctAudio);
    if (localStorage.getItem("voice") == 1) {
      if (document.getElementById("mode").textContent == "HARD") {
        loopVoice(answerEn, 1);
      }
    }
    document.getElementById("reply").textContent = "◯ " + answerEn;
    document.getElementById("searchButton").classList.add("animate__heartBeat");
  }
});

initProblems();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("toggleVoice").onclick = toggleVoice;
document.getElementById("mode").onclick = changeMode;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("startButton").onclick = countdown;
document.getElementById("respeak").onclick = respeak;
document.getElementById("showAnswer").onclick = showAnswer;
document.getElementById("searchButton").addEventListener(
  "animationend",
  function () {
    this.classList.remove("animate__heartBeat");
  },
);
document.getElementById("mode").onclick = changeMode;
document.getElementById("gradeOption").onchange = initProblems;
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
