import { element } from 'protractor';
import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';

class DebugSystem {
    private canvas;
    private requestAnimId;
    private drawer: Drawer;

    constructor(canvas, drawer: Drawer) {
        this.canvas = canvas;
        this.drawer = drawer;

    }

    public showMouseCoords(e: MouseEvent) {
        if (!this.drawer.getElementById('mouse')) {
            let mouse = {
                id: 'mouse',
                x: e.pageX,
                y: e.pageY,
                draw: function (canvas: CanvasRenderingContext2D) {
                    canvas.font = "15px Arial";
                    canvas.fillStyle = 'red'
                    canvas.fillText(`${this.x} \ ${this.y}`, this.x, this.y)
                }
            }

            this.drawer.elements.push(mouse);
        } else {
            let mouse = this.drawer.getElementById('mouse');
            mouse.x = e.pageX;
            mouse.y = e.pageY;
        }
    }
}

module speed {
    export let speed = 0;
}

class Drawer {
    public elements = [];
    public requestAnimId;
    private context;
    private width;
    private height;
    private source;
    private audio: HTMLAudioElement;
    private bufferLength = 64;
    private audioContext: AudioContext = new AudioContext();
    private analyzer: AnalyserNode = this.audioContext.createAnalyser();
    private dataArray: Uint8Array = new Uint8Array(this.bufferLength);
    private framefinished = true;

    constructor(context: CanvasRenderingContext2D, width, height) {
        this.context = context;
        this.width = width;
        this.height = height;
        console.log('drawer')


        this.audio = new Audio();
        this.audio.src = "assets/music.mp3"
        this.audio.volume = 0.2;
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyzer);
        this.analyzer.connect(this.audioContext.destination);
        this.analyzer.fftSize = this.bufferLength;
        this.analyzer.smoothingTimeConstant = 0.5;
        this.audio.addEventListener('loadedmetadata', (data) => {
            console.log(data)
        });
        console.log(this.analyzer)
        this.audio.play()
    }

    public getElementById(id) {
        return this.elements.filter(
            (el) => {
                return el.id == id;
            }
        )[0]
    }

    public draw() {
        //this.requestAnimId = requestAnimationFrame(this.draw.bind(this))
        //requestAnimationFrame(this.draw.bind(this))
        if (this.framefinished) {
            if (this.analyzer) {
                this.analyzer.getByteFrequencyData(this.dataArray);

            }
            let avgSpeed = 0;

            for (let i = 0; i < this.bufferLength; i++) {
                this.context.fillStyle = 'black'
                this.context.fillRect(0, 0, this.width, this.height);
                this.context.font = "15px Arial";
                this.context.fillStyle = 'red'
                this.context.fillText(`particles: ${this.elements.length}`, 100, 100)
                avgSpeed += this.dataArray[i];
                for (let element of this.elements) {
                    if (element.type && element.type == 'particle') {
                        if (!element.visible || ((element.position.x > this.width || element.position.x < 0) || (element.position.y > this.height || element.position.y < 0))) {
                            this.elements.splice(this.elements.indexOf(element), 1)
                        }
                    }
                    speed.speed = (this.dataArray[i] / 128);
                    element.draw(this.context)
                }
                this.framefinished = false;

            }
            this.framefinished = true;
        }
    }
}

@Component({
    selector: 'particles',
    templateUrl: './particles.component.html'
})
export class ParticlesComponent implements OnInit {
    @ViewChild('canvas') private canvas: ElementRef;
    private canvasContext: CanvasRenderingContext2D;
    private cHeight;
    private cWidth;
    private generator: ParticleGenerator;
    public debug = true;
    public debugSystem;
    private drawer: Drawer;


    constructor() {
    }

    public mouseMove(event) {
        //this.generator.starter = new Point2D(event.pageX, event.pageY)
        this.debugSystem.showMouseCoords(event)
    }

    ngOnInit() {
        console.log('init')
        this.cHeight = this.canvas.nativeElement.height = window.innerHeight;
        this.cWidth = this.canvas.nativeElement.width = window.innerWidth;
        this.canvasContext = this.canvas.nativeElement.getContext('2d');
        this.canvasContext.fillStyle = "red";
        this.canvasContext.fillRect(0, 0, this.cWidth, this.cHeight);
        this.drawer = new Drawer(this.canvasContext, this.cWidth, this.cHeight);

        if (this.debug) {
            this.debugSystem = new DebugSystem(this.canvas.nativeElement, this.drawer);
        }



        this.generator = new ParticleGenerator(this.drawer, this.cWidth, this.cHeight);
        this.generator.starter = new Point2D(this.cWidth / 2, this.cHeight / 2)

        setInterval(() => {
            this.generator.generateParticles(4);
            //    this.generator.generateParticles(1);
        }, 90)

        setInterval(this.drawer.draw.bind(this.drawer), 10)
        // this.drawer.draw()
    }
}

class ParticleGenerator {
    private store = [];
    private width;
    private height;
    private nextId = 0;
    private drawer: Drawer;
    public velocityX: 10;
    public velocityY: 10;
    public starter = new Point2D(200, 200);
    private sub = {}

    constructor(drawer, width, height) {
        this.width = width;
        this.height = height;
        this.drawer = drawer;
    }

    public getPartices(): Array<Particle> {
        return this.store;
    }

    public count() {
        return this.store.length;
    }

    public generateParticles(amount: number) {
        for (let i = 0; i < amount; i++) {
            let particle = new Particle('yellow', new Point2D(this.starter.x, this.starter.y), this.nextId, 1)
            this.drawer.elements.push(particle)
            this.nextId++;
            // let a = particle.lifeEnd.subscribe((data) => { 
            //    // console.log(data);
            //     let index = this.drawer.elements.indexOf(this.drawer.getElementById(data))
            //     this.drawer.elements.splice(index, 1)
            //     this.sub[particle.id].unsubscribe()
            // });
            // this.sub[particle.id] = a;
        }
    }

    private getRandomStartingPoint(): Point2D {
        //let x = Math.floor(Math.random() * this.width) + 1;
        //let y = Math.floor(Math.random() * this.height) + 1;
        let x = this.width / 2;
        let y = this.height / 2;
        return new Point2D(x, y);
    }
}

class Point2D {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}


class Particle {
    public type = 'particle'
    public position: Point2D;
    public color;
    public id;
    public radius;
    center;
    visible = true;
    speed = 0;
    direction;
    directions = [1, 0, -1];
    lifeEnd = new EventEmitter();
    r;
    g;
    b;
    constructor(color: string, position: Point2D, id, radius) {
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.id = id;
        this.r = Math.floor(Math.random() * 255) + 1;
        this.g = Math.floor(Math.random() * 255) + 1;
        this.b = Math.floor(Math.random() * 255) + 1;
        this.center = new Point2D(position.x, position.y)
        this.direction = new Point2D((Math.random() * 2) - 1, (Math.random() * 2) - 1);
    }

    public draw(context) {
        this.position.x += speed.speed * this.direction.x;
        this.position.y += speed.speed * this.direction.y;
        if (this.radius <= 10) {
            this.radius += 0.005;
        } else {
            this.visible = false;
            //this.lifeEnd.emit(this.id);
        }

        if (this.visible) {
            context.beginPath()
            context.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${((this.radius - 10) / 10) * -1})`;
            context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
            context.closePath()
            context.fill()
        }
    }
}