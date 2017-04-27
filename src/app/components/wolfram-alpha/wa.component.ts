import { Http } from '@angular/http';
import { Component, OnInit } from '@angular/core';

declare var $;

@Component({
    selector: 'wolfram',
    templateUrl: './wa.component.html',
})
export class WolframComponent implements OnInit {
    private readonly apiKey = "KY8GHT-YWX2KEE34L";
    private client;

    private baseUrl = 'https://api.wolframalpha.com/v2/'
    public pods = [];
    public query;

    constructor(private http: Http) {
    }

    private makeUrl(query: string) {
        let result = `${this.baseUrl}simple?i=${query}&format=image&appid=${this.apiKey}`;
        return result;
    }

    public sendQuery(query: string) {
        $.get({
            url: this.makeUrl(query),
            dataType: 'image/gif',
            success: (data) => {
                console.log(data)
            }

        })
    }


    ngOnInit() {

    }
}