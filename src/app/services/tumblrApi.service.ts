import { Injectable } from '@angular/core';
import { Constants } from '../constants';
import { Http, Response, Jsonp, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as $ from 'jquery';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TumblrApi {

    constructor(private http: Jsonp) {

    }

    public getPostsByTag(tag: string, offset, count) {
        let url = this.makeUrl('/posts');
        return $.get({
             url,
            dataType: 'jsonp',
            data: {
                tag,
                offset,
                limit: count
            }
        });
    }

    public getAvatarLink(size) {
        return this.makeUrl('/avatar/' + size);
    }

    public getBlogInfo() {
        let url = this.makeUrl('/info');
        return $.get({
            url,
            dataType: 'jsonp'
        });
    }

    public getBlogPosts(offset, count) {
        let url = this.makeUrl('/posts');
        return $.get({
            url,
            dataType: 'jsonp',
            data: {
                offset,
                limit: count
            }
        });
    }

    private makeUrl(path: string, params = []) {
        return Constants.tumblrBaseUrl
            + Constants.blogName
            + path
            + '?api_key='
            + Constants.OAuthKey;
    }

    private extractData(res: Response) {
        let body = res.json();
        return body.data || body;
    }

    private handleError(error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
