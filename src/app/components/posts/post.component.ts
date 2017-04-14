import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  Output,
  AfterViewInit,
  EventEmitter
} from '@angular/core';

import { EmitterService } from '../../services/emitter.service';

@Component({
  selector: 'post',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './post.component.html'
})

export class PostComponent implements Component {
    @Input() post;
    public photo;
    public photos = [];

    constructor(private emitter: EmitterService) {
    }

    ngOnInit() {
        console.log('init for post', this.post);
        this.getPhoto();
        if (this.post.photoset_layout) {
            this.getPhotosFromPost();
        }
    }

    public tagClicked(tag: string) {
        this.emitter.send({cmd: 'tagClicked', msg: tag});
    }

    private getPhoto() {
        this.photo = this.post.photos[0].original_size.url;
    }

    private getPhotosFromPost() {
        if (this.post.photoset_layout) {
            let photoIndex = 0;
            let layoutArray = this.layoutToArray(this.post.photoset_layout);
            console.log('layout array', layoutArray);
            for (let row of layoutArray) {
                let temp = [];
                for (let i = 0; i < row; i++) {
                    console.log(photoIndex);
                    temp.push(this.post.photos[photoIndex++]);
                }
                this.photos.push(temp);
            }
        } else {
            this.photos.push(this.post.photos[0]);
        }
        console.log('parsed photo layout', this.photos);
    }

    private layoutToArray(layout) {
        let array = [];
        for (let i = 0; i < layout.length; i++) {
            let entry = +layout[i];
            array.push(entry);
        }

        return array;
    }
}