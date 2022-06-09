const file = document.getElementById("a");
const canvas = document.getElementById("canvas");
const audio = document.getElementById("audio");


file.onchange = function() {

    const files = this.files;
    //console.log('FILES[0]: ', files[0])
    audio.src = URL.createObjectURL(files[0]);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    const flower = document.getElementById('center');



    const context = new AudioContext();
    let src = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 1024;

    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    function renderFrame() {
        requestAnimationFrame(renderFrame); 


        analyser.getByteFrequencyData(dataArray); 
        let sum = 0;

        for(let i = 0; i < bufferLength; i++) {
            if(i < 150) sum += dataArray[i];

            
        }

       
        let avg = sum / 150;
        flower.style.backgroundColor = avg > 230 ? "pink" : "yellow";
        flower.style.transform = `scale(${avg / 255})`;
        //flower.innerText = ~~avg;

    };

    
    audio.play();
    renderFrame();
};


