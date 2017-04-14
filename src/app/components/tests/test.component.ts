import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'test.component.html',
    templateUrl: './test.component.html',
})
export class TestComponent implements OnInit {
    public questions = [];

    constructor() { }

    ngOnInit() { 

    }

    public addQuestion() {
        this.questions.push({name: 'Question' + (this.questions.length + 1)})
    }

    public exportTest() {
        console.log(JSON.stringify(this.questions))
    }

}