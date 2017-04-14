import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
    selector: 'question',
    templateUrl: './question.component.html',
    styleUrls: ["../../app.component.css"]
})
export class QuestionComponent implements OnInit {
    @Input() public question;
    public isEditingTitle = false;

    constructor() { 
    }

    ngOnInit() { 
    }

    public editTitle() {
        this.isEditingTitle = true;
    }

    public addAnswer() {
        if (!this.question.answers) {
            this.question.answers = [];
        }

        this.question.answers.push(
            {
                name: `answers ${this.question.answers.length + 1}`,
                isRight: false,
                isEditing: false,
                id: this.question.answers.length
            });
    }

    public markAsRight(answer) {
        for (let answer of this.question.answers) {
            answer.isRight = false;
        }
        answer.isRight = true;
    }

    public editAnswer(answer) {
        for (let answer of this.question.answers) {
            answer.isEditing = false;
        }
        answer.isEditing = true;
    }

    public doneEditing(event) {
        console.log(event)

        for (let answer of this.question.answers) {
            answer.isEditing = false;
        }
    }

    public doneEditTitle(event) {
        if (event.keyCode === 13) {
            this.isEditingTitle = false;
        }
    }

    public keyPressed(event, isTitle = false) {
        if (event.keyCode === 13) {
            this.doneEditing(event);

        }
    }
}