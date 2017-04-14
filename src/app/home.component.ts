import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  AfterViewInit,
  AfterViewChecked,
  HostListener,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { PostType } from './enums/post-type.enum';
import { TumblrApi } from './services/tumblrApi.service';
import { EmitterService } from './services/emitter.service';
import * as $ from 'jquery';

@Component({
  selector: 'home',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.css'
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  public blogInfo = {};
  public posts = [];
  public PostType = PostType;
  private currentPostCount = 0;
  private postOffset = 10;
  private tagView = false;
  private tagName;
  private subTitle;
  private sub;
  constructor(
    private tumblrApi: TumblrApi,
    private emitter: EmitterService,
    private route: ActivatedRoute) {



    this.sub = this.route.params.subscribe((params) => {
      this.tagName = params['tag'];
    });

    this.emitter.get().subscribe(
      (data) => {
        if (data.cmd === 'tagClicked') {
          this.getPostsByTag(data.msg);
        }
      }
    );
  }

  public getPostsByTag(tag: string) {
    this.currentPostCount = 0;
    this.tumblrApi.getPostsByTag(tag, this.currentPostCount, this.postOffset).then(
      (result) => {
        console.log('got tagged posts');
        this.tagView = true;
        this.tagName = tag;
        this.posts = result.response.posts;
        this.currentPostCount = result.response.posts.length;
        this.subTitle = 'Tagged: ' + this.tagName;
        document.body.scrollTop = 0;
      }
    );
  }

  public ngOnInit() {
    $(document).scroll((event) => {
      console.log($(document).height, $(document).scrollTop());
    });

    let self = this;
    this.tumblrApi.getBlogInfo().then((data) => {
      self.blogInfo = data.response.blog;
    });

    this.tumblrApi.getBlogPosts(this.currentPostCount, this.postOffset).then(
      (result) => {
        this.tagView = false;
        this.posts = result.response.posts;
        this.currentPostCount = result.response.posts.length;
        this.subTitle = 'Home';
        this.emitter.send({ cmd: 'subTitleChanged', msg: this.subTitle });
        console.log('got posts');
      }
    );

  }

  public loadMore() {
    let self = this;
    if (!this.tagView) {
      this.tumblrApi.getBlogPosts(this.currentPostCount, this.postOffset).then(
        (result) => {
          result.response.posts.forEach((post) => {
            self.posts.push(post);
          });
          this.currentPostCount += result.response.posts.length;
          console.log('got more posts');
        }
      );
    } else {
      this.tumblrApi.getPostsByTag(this.tagName, this.currentPostCount, this.postOffset).then(
        (result) => {
          result.response.posts.forEach((post) => {
            self.posts.push(post);
          });
          this.currentPostCount += result.response.posts.length;
          console.log('got more tagged posts');
        });
    }
  }

  @HostListener('scroll', ['$event'])
  public onScroll(event) {
    if(event.target.scrollHeight == $(event.target).scrollTop() + $(event.target).height()) {
      this.loadMore()
    }
  }
  public scrolled () {
    console.log('scrilled')
  }
}
