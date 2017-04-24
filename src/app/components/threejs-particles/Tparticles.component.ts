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
    constructor() {


        //this.pointCloud = new THREE.Points(this.geometry, this.material);
    }

    generate() {
        this.analyzer.getByteFrequencyData(this.dataArray)
        for (let i = 0; i < 2000; i++) {
            let material = new THREE.MeshPhongMaterial({
                map: this.textureLoader.load('assets/particle.png')
            })

            let geometry = new THREE.SphereGeometry(2)
            let mesh = new THREE.Mesh(geometry, material)
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.position.x = 0;
            mesh.position.y = 0;
            mesh.position.z = 0;
            mesh.name = "a" + i;
            this.scene.add(mesh)

        }
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


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement)


        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 1000
        this.camera.position.x = this.camera.position.x * 0.75;
        this.camera.position.y = this.camera.position.y * 0.75;

        this.controls = new OrbitControls(this.camera);
        var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        light.position.set(50, 50, 50);
        this.scene.add(light);
        //this.scene.add(this.pointCloud);
        this.generate()
        this.audio.play()
        this.render()
    }

    randomIntFromInterval(min, max) {
        return Math.random() * (max - min + 1) + min;
    }

    render() {
        requestAnimationFrame(this.render.bind(this));
        // this.generate()
        this.analyzer.getByteFrequencyData(this.dataArray)
        this.progress = (this.audio.currentTime / this.audio.duration) * 100
        this.scene.traverse((e: any) => {
            if (e instanceof THREE.Mesh) {
                if (!e['direction']) {
                    e['direction'] = new THREE.Vector3(this.randomIntFromInterval(-1, 1), this.randomIntFromInterval(-1, 1), this.randomIntFromInterval(0.5, 1))
                    e['life'] = this.randomIntFromInterval(10, 30);
                    e['speed'] = 20;
                }
                //e.rotation.x = this.dataArray[50] / 1000;
                //e.rotation.y = this.dataArray[e.id] / 50;
                e.position.x += ((e['speed'] * this.dataArray[e.id] / 128) + 1) * e['direction'].x
                e.position.y += ((e['speed'] * this.dataArray[e.id] / 128) + 1) * e['direction'].y
                e.position.z += ((e['speed'] * this.dataArray[e.id] / 128) + 1) * e['direction'].z
                e['life'] -= 0.05;
                if (e['life'] <= 0) {
                    e.position.x = this.randomIntFromInterval(-100, 100);
                    e.position.y = this.randomIntFromInterval(-100, 100);
                    e.position.z = this.randomIntFromInterval(0, 100);
                    e['direction'] = new THREE.Vector3(e.position.x, e.position.y, e.position.z).normalize()
                    e['life'] = this.randomIntFromInterval(10, 30);
                }


                //e.scale.multiplyScalar((this.dataArray[e.id] / 255) + 0.1)
                let material: any = e.material
                //console.log(material.color)
                material.color.setRGB(this.dataArray[e.id], this.dataArray[e.id], this.dataArray[e.id])
            }
        })

        this.renderer.render(this.scene, this.camera)
    }
}