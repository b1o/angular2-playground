import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EnviromentService {
    public speed;
    public onChange = new EventEmitter();

    public changeSpeed(amount) {
        this.speed = amount; 
        this.onChange.emit(amount);
        console.log('emitted speed: ', amount)
    }

}