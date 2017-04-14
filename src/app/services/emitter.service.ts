import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EmitterService {
    private emitter = new EventEmitter();

    public send(msg) {
        this.emitter.emit(msg);
    };

    public get() {
        if (!this.emitter) {
            return this.emitter = new EventEmitter();
        }

        return this.emitter;
    }
}