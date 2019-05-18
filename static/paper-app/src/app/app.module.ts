import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PapersComponent } from './papers/papers.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MapsComponent } from './maps/maps.component';
// import { MatTreeModule } from '@angular/material/tree';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { PaperDetailComponent } from './paper-detail/paper-detail.component';
import { PerformanceComponent } from './performance/performance.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { WordCloudComponent } from './word-cloud/word-cloud.component';
import { CategoryTreeComponent } from './category-tree/category-tree.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { NzTreeModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { RankDialogComponent } from './rank-dialog/rank-dialog.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { API_URL } from './env';

const config: SocketIoConfig = { url: API_URL, options: {} };

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    PapersComponent,
    MapsComponent,
    PaperDetailComponent,
    PerformanceComponent,
    WordCloudComponent,
    CategoryTreeComponent,
    RankDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatMenuModule,
    // MatTreeModule,
    MatPaginatorModule,
    MatListModule,
    MatGridListModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    HighchartsChartModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    NzTreeModule,
    // NzModalModule,
    MatDialogModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config)
  ],
  entryComponents: [RankDialogComponent],
  providers: [
    { provide: NZ_I18N, useValue: en_US }
    // { provide: NZ_MODAL_CONFIG, useValue: { nzMaskClosable: true } }
  ],
  // providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
