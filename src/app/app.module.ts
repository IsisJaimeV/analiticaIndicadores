import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FilterComponent } from './common/filter/filter.component';
import { HeaderComponent } from './common/header/header.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { NotFoundComponent } from './views/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    FilterComponent,
    HeaderComponent,
    DashboardComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
