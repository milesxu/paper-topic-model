import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoryTreeComponent } from './category-tree/category-tree.component';
import { MapsComponent } from './maps/maps.component';
import { PerformanceComponent } from './performance/performance.component';
import { RankDialogComponent } from './rank-dialog/rank-dialog.component';
import { WordCloudComponent } from './word-cloud/word-cloud.component';
import { PaperDetailComponent } from './paper-detail/paper-detail.component';
import { PapersComponent } from './papers/papers.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
// import { API_URL } from './env';

// const config: SocketIoConfig = { url: API_URL, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    CategoryTreeComponent,
    MapsComponent,
    PerformanceComponent,
    RankDialogComponent,
    WordCloudComponent,
    PaperDetailComponent,
    PapersComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTreeModule,
    MatCheckboxModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatGridListModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule
    // SocketIoModule.forRoot(config)
  ],
  entryComponents: [RankDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
