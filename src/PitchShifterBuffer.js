/*
*  PitchShifterBuffer class. Processes an entire audio buffer with current pitch/tempo settings, and creates a new buffer with the processed audio.
*  Not sure how useful this is, processing makes a huge lag spike.
*/

import SoundTouch from './SoundTouch';
import SimpleFilter from './SimpleFilter';
import WebAudioBufferSource from './WebAudioBufferSource';
import minsSecs from './minsSecs';

export default class PitchShifterBuffer {
  constructor(context, audioBuffer) {
    this._context = context;
    this._duration = audioBuffer.duration;
    this._length = audioBuffer.length;
    this._numberOfChannels = audioBuffer.numberOfChannels;
    this._sampleRate = audioBuffer.sampleRate;

    this._soundtouch = new SoundTouch();
    this._filter = new SimpleFilter(new WebAudioBufferSource(audioBuffer), this._soundtouch);
  }
  
  processBuffer() {
    const temp = new Float32Array(this._length);
    const extractedLength = this._filter.extract(temp, this._length / 2);
    this._buffer = this._context.createBuffer(this._numberOfChannels, temp.length, this._sampleRate);
    const left = this._buffer.getChannelData(0);
    const right = this._buffer.getChannelData(1);
    for (let i = 0; i < extractedLength; i++) {
      left[i] = temp[i * 2];
      right[i] = temp[i * 2 + 1];
    }
    return this._buffer;
  } 

  get buffer() {
    return this._buffer;
  }

  get formattedDuration() {
    return minsSecs(this._duration);
  }

  get formattedTimePlayed() {
    return minsSecs(this.timePlayed);
  }

  get percentagePlayed() {
    return (
      (100 * this._filter.sourcePosition) / (this._duration * this._sampleRate)
    );
  }

  set percentagePlayed(perc) {
    this._filter.sourcePosition = parseInt(
      perc * this._duration * this._sampleRate
    );
    this.sourcePosition = this._filter.sourcePosition;
    this.timePlayed = this.sourcePosition / this._sampleRate;
  }

  set pitch(pitch) {
    this._soundtouch.pitch = pitch;
  }

  set pitchSemitones(semitone) {
    this._soundtouch.pitchSemitones = semitone;
  }

  set rate(rate) {
    this._soundtouch.rate = rate;
  }

  set tempo(tempo) {
    this._soundtouch.tempo = tempo;
  }
}