var audio_file = document.getElementById("a");
var glasba = document.getElementById("audio");
var timepos;
var arr=[];
var timing;
var times = [];
var times2= [];
var url;
var out = document.getElementById("output");
var dur=1;
function updateProgressState() {
  
    if (glasba.paused) {
      return;
    }
      if(Math.round(glasba.currentTime * 10) / 10==timepos){
        
        blip();
        times.shift();
        timepos=times[0];
      }
      else if(Math.round(glasba.currentTime * 10) / 10>timepos){
        times.shift();
        timepos=times[0];
      }
  
      
      requestAnimationFrame(updateProgressState);
      
  }
  
  glasba.addEventListener('play', updateProgressState);
  glasba.addEventListener('playing', updateProgressState);
  glasba.onseeking=function(){
      if(Math.floor(glasba.currentTime)<timepos){
        times=[];
        for(let i = 0; i<times2.length;i++){
          times.push(times2[i]);
        }
        timepos=times[0];
      }
     // console.log("test");
  };
audio_file.addEventListener("change", function() {
   
    var file = this.files[0];

    var name = document.getElementById("name");
    //audio = new Audio(file.path);
    url = URL.createObjectURL(file);
    glasba.src = url;
   
});
document.getElementById('inputfile')
            .addEventListener('change', function() {
              
            var fr=new FileReader();
            fr.onload=function(){    
                times=fr.result.replace(/\r\n/g,'\n').split('\n');
                console.log(times);
                for(var i =0; i<times.length;i++){
                    times[i]=Math.round(times[i] * 10) / 10;
                    times2.push(times[i]);
                }
                timepos=times[0];
                console.log(times);  
                var min=glasba.duration/60;
                
                out.innerHTML="BPM: "+Math.floor(times.length/min);        
            }
            fr.readAsText(this.files[0]);
           // arr=fr.result.replace(/\r\n/g,'\n').split('\n');
           // console.log(arr);
            
        });
        var red = document.getElementById("center");
        async function blip(){
          red.style.background="red";
          
          await sleep(500);
          red.style.background="white";
        }
        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
      }
      


        //.replace(/\r\n/g,'\n').split('\n');