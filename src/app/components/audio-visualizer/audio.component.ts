import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { MdlSliderComponent } from '@angular-mdl/core';

@Component({
    selector: 'audio-vis',
    templateUrl: './audio.component.html'
})

export class AudioComponent implements AfterViewInit {
    public progress;
    public duration;
    public currentTime;
    @ViewChild('board') public canvas;
    @ViewChild('slider') public slider: MdlSliderComponent;
    public bufferLength = 512;
    public barRatio = 2.5;
    public barCount;
    public barHeightRatio = 2;
    public audioSrc;
    public useMic = false;
    public fullscreen = true;
    public file;
    private canvasContext: CanvasRenderingContext2D;;
    private audio: HTMLAudioElement;
    private audioContext: AudioContext = new AudioContext();
    private analyzer: AnalyserNode = this.audioContext.createAnalyser();
    private dataArray: Uint8Array = new Uint8Array(this.bufferLength);
    private WIDTH;
    private HEIGHT;
    private previousSliderValue;
    private source;
    private requestId;
    private proportion = (300 / this.bufferLength);
    private mic;
    private frameFinished = new EventEmitter();

    constructor() {
    }

    public play() {
        this.audio.play();
        requestAnimationFrame(this.draw.bind(this))
    }

    public pause() {
        this.audio.pause();
        this.frameFinished.subscribe(
            () => {
                cancelAnimationFrame(this.requestId);

            }
        )

    }

    public onSliderChange(value) {
        this.analyzer.fftSize = value;
    }

    public getSliderStep() {
        console.log(this.bufferLength);
    }

    public fileChanged(event) {
        let fileSrc = URL.createObjectURL(event.target.files[0]);
        this.audio.src = fileSrc;
    }

    public changeInput() {
        cancelAnimationFrame(this.requestId);
        this.canvasContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        if (this.useMic) {
            this.mic.getTracks()[0].stop();
            this.source.disconnect();
            this.analyzer.disconnect();
            this.source = null;
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.analyzer);
            this.analyzer.connect(this.audioContext.destination);
            this.analyzer.fftSize = this.bufferLength;
            this.analyzer.smoothingTimeConstant = 0.5;
            this.useMic = false;
        } else {
            this.source.disconnect();
            this.audio.pause();
            this.analyzer.disconnect();
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                this.mic = stream;
                this.source = this.audioContext.createMediaStreamSource(stream);
                this.source.connect(this.analyzer);
                this.bufferLength = 2048;
                this.dataArray = new Uint8Array(2048)
                this.analyzer.fftSize = this.bufferLength;
                this.useMic = true;
                this.draw()
            });
        }
    }

    public ngAfterViewInit() {
        this.canvas.nativeElement.width = window.innerWidth;
        this.canvas.nativeElement.height = window.innerHeight;
        this.canvasContext = this.canvas.nativeElement.getContext('2d');
        this.WIDTH = this.canvas.nativeElement.width;
        this.HEIGHT = this.canvas.nativeElement.height;
        if (this.useMic) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                this.source = this.audioContext.createMediaStreamSource(stream);
                this.source.connect(this.analyzer);
                this.analyzer.fftSize = this.bufferLength;
            });

            return;
        }
        this.audio = new Audio();
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyzer);
        this.analyzer.connect(this.audioContext.destination);
        this.analyzer.fftSize = this.bufferLength;
        this.analyzer.smoothingTimeConstant = 0.5;
        this.audio.addEventListener('loadedmetadata', (data) => {
            console.log(data)
            this.duration = (this.audio.duration / 60).toFixed(2) ;
        });
        this.canvasContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    }

    public str_pad_left(time, pad, length) {
        return (new Array(length + 1).join(pad) + time).slice(-length);
    }

    public draw() {
        let self = this;
        let minutes = Math.floor(this.audio.currentTime / 60);
        let seconds = Math.floor((this.audio.currentTime - minutes * 60));
        this.currentTime = this.str_pad_left(minutes, '0', 2) + ':' + this.str_pad_left(seconds, '0', 2);
        this.progress = (( (this.audio.currentTime) / this.audio.duration ) * 100).toFixed(2);
        this.requestId = requestAnimationFrame(this.draw.bind(this));
        this.canvasContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        this.canvasContext.fillStyle = 'rgb(200, 200, 200)';
        if (!this.useMic) {
            this.analyzer.getByteFrequencyData(this.dataArray);
            let x = 0;
            let barWidth = (this.WIDTH / this.bufferLength) * this.barRatio;
            this.barCount = Math.floor(this.WIDTH / barWidth);
            let barHeight;
            let finished = true;
            for (let i = 0; i < this.bufferLength; i += 2) {
                if (this.dataArray[i] > 0) {
                    finished = false;
                    let barHeight = this.dataArray[i];

                    this.canvasContext.beginPath();
                    this.canvasContext.strokeStyle = `rgb(${(barHeight * 2) - 1}, ${255 - barHeight}, 0)`;
                    this.canvasContext.lineWidth = 2;
                    this.canvasContext.arc(this.WIDTH / 2, this.HEIGHT / 2, (this.dataArray[i]) * 2, 0, 2 * Math.PI);
                    this.canvasContext.stroke();
                }
            }

            if (finished) {
                this.frameFinished.emit()
            }
        } else {
            this.canvasContext.lineWidth = 2;
            this.canvasContext.strokeStyle = 'rgb(0, 0, 0)';
            this.analyzer.getByteTimeDomainData(this.dataArray);

            this.canvasContext.beginPath();

            let sliceWidth = this.WIDTH / this.bufferLength;
            let x = 0;
            for (let i = 0; i < this.bufferLength; i++) {

                let v = this.dataArray[i] / 128.0;
                let y = v * this.HEIGHT / 2;

                if (i === 0) {
                    this.canvasContext.moveTo(x, y);
                } else {
                    this.canvasContext.lineTo(x, y);
                }

                x += sliceWidth;
            }

            this.canvasContext.lineTo(this.canvas.nativeElement.width, this.canvas.nativeElement.height / 2);
            this.canvasContext.stroke();

        }
    }
}
