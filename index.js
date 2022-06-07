var audio_file = document.getElementById("a");
var song = document.getElementById("play");
song.addEventListener('click',start);
var positions=[];
var time;
var url;
var out = document.getElementById("output");
var audio = new Audio();
audio.addEventListener("playing",updateProgressState);

audio.addEventListener('ended', start);
function updateProgressState() {
  if (audio.paused) {
    return;
  }
  var progressIndicator = document.querySelector('#progress');
  if (progressIndicator && audio.duration) {
    progressIndicator.setAttribute('x', (audio.currentTime * 100 / audio.duration) + '%');
  }
  requestAnimationFrame(updateProgressState);
}
audio_file.addEventListener("change", function() {
    var file = this.files[0];

    var name = document.getElementById("name");
    //audio = new Audio(file.path);
    url = URL.createObjectURL(file);
    audio.src = url;
    name.innerHTML="Title: "+file.name;
    var reader = new FileReader();
    reader.onload = function() {
      console.log(reader.result);
      var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      var offlineContext = new OfflineContext(2, 30 * 44100, 44100);
      offlineContext.decodeAudioData(reader.result, function(buffer) {
        //audio = new Audio(buffer);
        var min = Math.floor(buffer.duration/60);
        var sec = Math.floor(buffer.duration%60);
        
        console.log(buffer.duration);
        time = buffer.duration;
        var dur = document.getElementById("duration");
        dur.innerHTML="Duration: "+min+"min and "+sec+"s"; 
        var source = offlineContext.createBufferSource();
        source.buffer = buffer;
        var lowpass = offlineContext.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 150;
        lowpass.Q.value = 1;
        source.connect(lowpass);
        var highpass = offlineContext.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 100;
        highpass.Q.value = 1;
        lowpass.connect(highpass);
        highpass.connect(offlineContext.destination);
        source.start(0);
        offlineContext.startRendering();
    });
    offlineContext.oncomplete = function(e) {
      var buffer = e.renderedBuffer;
     // console.log(buffer.sampleRate);
      var peaks = getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
      console.log(peaks);
      //draw(peaks);
      //var allPeaks = getAll([buffer.getChannelData(0), buffer.getChannelData(1)]);
      //console.log(buffer.getChannelData(0));
      var groups = getIntervals(peaks);
     // console.log(groups);
     var svg = document.querySelector('#svg');
     svg.innerHTML = '';
     var svgNS = 'http://www.w3.org/2000/svg';
     var rect;
     positions =[];
     peaks.forEach(function(peak) {
       rect = document.createElementNS(svgNS, 'rect');
       rect.setAttributeNS(null, 'x', (100 * peak.position / buffer.length) + '%');
       positions.push(100 * peak.position / buffer.length);
       console.log(100 * peak.position / buffer.length);
       rect.setAttributeNS(null, 'y', 0);
       rect.setAttributeNS(null, 'width', 1);
       rect.setAttributeNS(null, 'height', '100%');
       svg.appendChild(rect);
     });
     printPositions(positions,time);
     rect = document.createElementNS(svgNS, 'rect');
     rect.setAttributeNS(null, 'id', 'progress');
     rect.setAttributeNS(null, 'y', 0);
     rect.setAttributeNS(null, 'width', 1);
     rect.setAttributeNS(null, 'height', '100%');
     svg.appendChild(rect);

     svg.innerHTML = svg.innerHTML; // force repaint in some browsers

      var top = groups.sort(function(intA, intB) {
        return intB.count - intA.count;
      }).splice(0, 5);
      out.innerHTML="BPM: "+top[0].tempo;
      //console.log(top[0].tempo);
    }
  };
    reader.readAsArrayBuffer(file);
});
  

  function getPeaks(data) {
    var partSize = 22050/5,
        parts = data[0].length / partSize,
        peaks = [];
    console.log(data);
    for (var i = 0; i < parts; i++) {

      var max = 0;
      for (var j = i * partSize; j < (i + 1) * partSize; j++) {
        //console.log(data[0][j]);
        //console.log(j);
        var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
        if (!max || (volume > max.volume)) {
          max = {
            position: j,
            volume: volume
          };
        }
      }
      peaks.push(max);
    }
    peaks.sort(function(a, b) {
      return b.volume - a.volume;
    });
  
    peaks = peaks.splice(0, peaks.length * 0.5);
    peaks.sort(function(a, b) {
      return a.position - b.position;
    });
    return peaks;
  }
  function getIntervals(peaks) {
  
    var groups = [];
  
    peaks.forEach(function(peak, index) {
      for (var i = 1; (index + i) < peaks.length && i < 10; i++) {
        var group = {
          tempo: (60 * 44100) / (peaks[index + i].position - peak.position),
          count: 1
        };
  
        while (group.tempo < 90) {
          group.tempo *= 2;
        }
  
        while (group.tempo > 180) {
          group.tempo /= 2;
        }
  
        group.tempo = Math.round(group.tempo);
  
        if (!(groups.some(function(interval) {
          return (interval.tempo === group.tempo ? interval.count++ : 0);
        }))) {
          groups.push(group);
        }
      }
    });
    return groups;
  }
  function start(){
    if(audio.paused){
      audio.play();
    }
    else{
      audio.pause();
    }
  }
  function printPositions(){
    var p;
    var d= document.getElementById("time");
    var timestamp=0;
    for(let i = 0; i<positions.length;i++){
      timestamp=Math.floor(time*(positions[i]/100));
      p=document.createElement("p"); 
      if(timestamp>60){
       p.innerHTML=Math.floor(timestamp/60)+"min and "+Math.floor(timestamp%60)+"s";
      }
      else{
        p.innerHTML=timestamp+"s";
      }
      d.appendChild(p);
      
    }
  }
  