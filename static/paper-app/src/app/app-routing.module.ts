import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PapersComponent } from './papers/papers.component';
import { MapsComponent } from './maps/maps.component';
import { PerformanceComponent } from './performance/performance.component';
import { WordCloudComponent } from './word-cloud/word-cloud.component';

const routes: Routes = [
  { path: 'papers', component: PapersComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'performance', component: PerformanceComponent },
  { path: 'word-cloud', component: WordCloudComponent },
  { path: '', redirectTo: '/papers', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
