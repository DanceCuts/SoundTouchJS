/**
 * Loosely based on an example from:
 * http://onlinetonegenerator.com/pitch-shifterBuffer.html
 */

// This is pulling SoundTouchJS from the local file system. See the README for proper usage.
import { PitchShifter, PitchShifterBuffer } from '../dist/soundtouch.js';

const fileInput = document.getElementById('fileinput');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const tempoSlider = document.getElementById('tempoSlider');
const tempoOutput = document.getElementById('tempo');
tempoOutput.innerHTML = tempoSlider.value;
const pitchSlider = document.getElementById('pitchSlider');
const pitchOutput = document.getElementById('pitch');
pitchOutput.innerHTML = pitchSlider.value;
const keySlider = document.getElementById('keySlider');
const keyOutput = document.getElementById('key');
keyOutput.innerHTML = keySlider.value;
const volumeSlider = document.getElementById('volumeSlider');
const volumeOutput = document.getElementById('volume');
volumeOutput.innerHTML = volumeSlider.value;
const currTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const progressMeter = document.getElementById('progressMeter');

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain();
let shifterBuffer, outputNode;

const loadSource = async (file) => {
  playBtn.setAttribute('disabled', 'disabled');
  if (shifterBuffer) {
    shifterBuffer.off();
  }
  audioCtx.decodeAudioData(await file.arrayBuffer(), (audioBuffer) => {
    console.log('decoded the buffer', audioBuffer);
    shifterBuffer = new PitchShifterBuffer(audioCtx, audioBuffer);
    shifterBuffer.tempo = tempoSlider.value;
    shifterBuffer.pitch = pitchSlider.value;
    duration.innerHTML = shifterBuffer.formattedDuration;
    playBtn.removeAttribute('disabled');
  });
};

fileInput.onchange = (e) => {
  loadSource(e.target.files[0]);
};

let is_playing = false;
const play = function () {
  outputNode = audioCtx.createBufferSource();
  outputNode.buffer = shifterBuffer.processBuffer();
  outputNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  audioCtx.resume().then(() => {
    is_playing = true;
    this.setAttribute('disabled', 'disabled');
    outputNode.start(audioCtx.currentTime + 2);
  });
};

const pause = function (playing = false) {
  shifterBuffer.stop();
  is_playing = playing;
  playBtn.removeAttribute('disabled');
};

playBtn.onclick = play;
stopBtn.onclick = pause;

tempoSlider.addEventListener('input', function () {
  tempoOutput.innerHTML = shifterBuffer.tempo = this.value;
});

pitchSlider.addEventListener('input', function () {
  pitchOutput.innerHTML = shifterBuffer.pitch = this.value;
  shifterBuffer.tempo = tempoSlider.value;
});

keySlider.addEventListener('input', function () {
  shifterBuffer.pitchSemitones = this.value;
  keyOutput.innerHTML = this.value / 2;
  shifterBuffer.tempo = tempoSlider.value;
});

volumeSlider.addEventListener('input', function () {
  volumeOutput.innerHTML = gainNode.gain.value = this.value;
});

progressMeter.addEventListener('click', function (event) {
  const pos = event.target.getBoundingClientRect();
  const relX = event.pageX - pos.x;
  const perc = relX / event.target.offsetWidth;
  pause(is_playing);
  shifterBuffer.percentagePlayed = perc;
  progressMeter.value = 100 * perc;
  currTime.innerHTML = shifterBuffer.timePlayed;
  if (is_playing) {
    play();
  }
});
