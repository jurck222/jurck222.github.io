const file = document.getElementById("a");
const canvas = document.getElementById("canvas");
const audio = document.getElementById("audio");

var threshold = 230;  //Point where turn the "flower" pink
var frequencies = 10; //Number of records to count (You want to look for lower frequencies)

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
        requestAnimationFrame(renderFrame); // Takes callback function to invoke before rendering


        analyser.getByteFrequencyData(dataArray); // Copies the frequency data into dataArray
        // Results in a normalized array of values between 0 and 255
        // Before this step, dataArray's values are all zeros (but with length of 8192)

        let sum = 0;

        for(let i = 0; i < bufferLength; i++) {
            if(i < frequencies) sum += dataArray[i];

            //Do some other stuff
        }

        //Change CSS according to threshold
        let avg = sum / frequencies;
        flower.style.backgroundColor = avg > threshold ? "pink" : "yellow";
        flower.style.transform = `scale(${avg / 255})`;
        flower.innerText = ~~avg;

    };

    //!!This functions have to be called outside of the rendering function (renderFrame)!!
    audio.play();
    renderFrame();
};


/* Sliders */
const sliderF = document.querySelector(".slider.f");
const sliderFvalue = document.querySelector(".slider-value.f");
const sliderT = document.querySelector(".slider.t");
const sliderTvalue = document.querySelector(".slider-value.t");

sliderF.oninput = function() {
  sliderFvalue.innerText = this.value;
  frequencies = +this.value;
}

sliderT.oninput = function() {
  sliderTvalue.innerText = this.value;
  threshold = +this.value;
}