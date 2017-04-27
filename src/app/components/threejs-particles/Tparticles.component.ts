import { Component, AfterViewInit } from '@angular/core';
import * as THREE from 'three'
import * as TWEEN from 'tween.js'
let OrbitControls = require('three-orbit-controls')(THREE)

@Component({
    selector: 'tparticles',
    templateUrl: './Tparticles.component.html'
})
export class TParticlesComponent implements AfterViewInit {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls;

    private geometry: THREE.Geometry;
    private material;
    private textureLoader = new THREE.TextureLoader()
    private pointCloud: THREE.Points;
    private speed = 0.2;

    private deadParticles = [];

    private audio: HTMLAudioElement = new Audio();
    private audioCtx: AudioContext = new AudioContext();
    private analyzer: AnalyserNode = this.audioCtx.createAnalyser();
    private dataArray;
    private source;

    public audioName;
    public progress;
    private pivot;
    private clock: THREE.Clock;
    private light: THREE.DirectionalLight;
    constructor() {


        //this.pointCloud = new THREE.Points(this.geometry, this.material);
    }

    generate() {
        this.pivot = new THREE.Object3D();
        this.analyzer.getByteFrequencyData(this.dataArray)
        for (let i = 0; i < 1000; i++) {
            for (let s = 0; s < 2; s++) {
                let material = new THREE.MeshLambertMaterial({
                    color: 0xff0000
                })
                material.transparent = true;
                let geometry = new THREE.SphereGeometry(1)
                let mesh = new THREE.Mesh(geometry, material)
                mesh.position.x = this.randomIntFromInterval(-100, 100);
                mesh.position.y = this.randomIntFromInterval(-100, 100);
                mesh.position.z = this.randomIntFromInterval(50, 100);
                mesh.name = "" + i;
                this.scene.add(mesh)
                this.pivot.add(mesh)

            }
        }
        this.scene.add(this.pivot)
        //this.pointCloud = new THREE.Points(this.geometry, this.material);
    }

    fileChanged(file) {
        this.audio.pause();
        this.audio.src = URL.createObjectURL(file);
        this.audio.addEventListener('loadedmetadata', (data) => {
            this.audioName = file.name
            this.progress = 50;
            this.audio.play()
        })
    }

    ngAfterViewInit() {
        this.audio.src = "assets/music.mp3"
        this.audio.volume = 0.2;
        this.source = this.audioCtx.createMediaElementSource(this.audio);
        this.analyzer.fftSize = 4096;
        this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount)
        this.source.connect(this.analyzer);
        this.analyzer.connect(this.audioCtx.destination);
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock()
        this.clock.start()
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement)


        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.z = 1100
        this.camera.position.x = 0;
        this.camera.position.y = 0;

        this.controls = new OrbitControls(this.camera);
        var light = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(light);

        // this.light = new THREE.DirectionalLight(0xffffff, 0.1);
        // this.scene.add(this.light);
        // this.light.position.copy(this.camera.position)

        //this.scene.add(this.pointCloud);
        this.generate()
        this.audio.play()
        this.render()
    }

    pause() {
        this.audio.pause();
    }

    randomIntFromInterval(min, max) {
        return Math.random() * (max - min) + min;
    }

    convertRange(value, r1, r2) {
        return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
    }

    render() {
        requestAnimationFrame(this.render.bind(this));
        // this.generate()
        this.analyzer.getByteFrequencyData(this.dataArray)
        this.progress = (this.audio.currentTime / this.audio.duration) * 100
        for (let e of this.pivot.children) {
            if (e instanceof THREE.Mesh) {
                if (!e['direction']) {
                    e['direction'] = new THREE.Vector3(e.position.x, e.position.y, e.position.z).normalize()
                    e['life'] = this.randomIntFromInterval(10, 30);
                    e['speed'] = 15;
                }
                //e.rotation.x = this.dataArray[50] / 1000;
                //e.rotation.y = this.dataArray[e.id] / 50;
                e.position.x += ((e['speed'] * this.dataArray[e.name] / 128) - 1) * e['direction'].x
                e.position.y += ((e['speed'] * this.dataArray[e.name] / 128) - 1) * e['direction'].y
                e.position.z += ((e['speed'] * this.dataArray[e.name] / 128) - 1) * e['direction'].z
                e['life'] -= 0.05;
                if (e['life'] <= 0) {
                    e.position.x = 0// this.randomIntFromInterval(-100, 100);
                    e.position.y = 0//this.randomIntFromInterval(-100, 100);
                    e.position.z = 0//this.randomIntFromInterval(0, 100);
                    e['direction'] = new THREE.Vector3(this.randomIntFromInterval(-1, 1), this.randomIntFromInterval(-1, 1), this.randomIntFromInterval(0, 1)).normalize()
                    e['life'] = this.randomIntFromInterval(10, 30);
                }


                //this.pivot.position.z = this.dataArray[50];

                //e.scale.multiplyScalar((this.dataArray[e.id] / 255) + 0.1)
                let material: any = e.material
                //console.log(material.color)
                //material.opacity = this.dataArray[e.name] / 1
                // percent = (inputY - yMin) / (yMax - yMin);
                // outputX = percent * (xMax - xMin) + xMin;
                this.pivot.rotation.z +=(( this.dataArray[e.id] / 128 )-1 ) * this.clock.getDelta();

                let percent = 255 / 95
                material.color.setRGB(percent * this.dataArray[e.name], 255 - (percent * this.dataArray[e.name]), 0)
                e.material.needsUpdate = true;
            }
        }
        // this.light.position.copy(this.camera.position)
        // this.light.lookAt(this.pivot.position)
        this.renderer.render(this.scene, this.camera)
    }
}