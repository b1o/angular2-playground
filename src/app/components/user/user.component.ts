import { Component, OnChanges, Input } from '@angular/core';
import { TumblrApi } from '../../services/tumblrApi.service';
import { EmitterService } from '../../services/emitter.service';

@Component({
    selector: 'user-card',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserCardComponent implements OnChanges {
    @Input() public user;
    @Input() public subTitle;
    public avatar;
    constructor(private tumblrApi: TumblrApi, private emitter: EmitterService) {
        this.avatar = this.tumblrApi.getAvatarLink(512);
        this.emitter.get().subscribe(
            (data) => {
                if (data.cmd === 'subTitleChanged') {
                    this.subTitle = data.msg;
                }
            }
        );
    }

    public ngOnChanges() {
        console.log('init user card for', this.user);

    }
}
