import { TParticlesComponent } from './components/threejs-particles/Tparticles.component';
import { ParticlesComponent } from './components/particles/particles.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { TestComponent } from './components/tests/test.component';
import { AudioComponent } from './components/audio-visualizer/audio.component';

export const ROUTES: Routes = [
  { path: '', component: AudioComponent },
  {
    path: 'home', component: HomeComponent, children: [
      { path: 'tagged/:tag', component: HomeComponent }
    ]
  },
  { path: 'test', component: TestComponent },
  { path: 'music', component: AudioComponent },
  { path: 'particles', component: ParticlesComponent },
  {path: 'threejs', component: TParticlesComponent}
  
];
