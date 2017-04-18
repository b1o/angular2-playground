import { EnviromentService } from './components/particles/enviroment.service';
import { ParticlesComponent } from './components/particles/particles.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { PostComponent } from './components/posts/post.component';
import { TumblrApi } from './services/tumblrApi.service';
import { EmitterService } from './services/emitter.service';
import { UserCardComponent } from './components/user/user.component';
import { MdlModule } from '@angular-mdl/core';
import { TestComponent } from './components/tests/test.component';
import { QuestionComponent } from './components/tests/question.component';
import { AudioComponent } from './components/audio-visualizer/audio.component';

import 'jquery';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HomeComponent,
    PostComponent,
    UserCardComponent,
    TestComponent,
    QuestionComponent,
    AudioComponent,
    ParticlesComponent
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    JsonpModule,
    MdlModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    TumblrApi,
    EmitterService,
    EnviromentService
  ],
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
  ) { }

}
