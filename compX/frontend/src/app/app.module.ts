import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JobItemComponent } from './jobs/job-item/job-item.component';
import { HttpClientModule } from '@angular/common/http';
import { CreateEditJobComponent } from './jobs/create-edit-job/create-edit-job.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateEditPartComponent } from './jobs/create-edit-job/create-edit-part/create-edit-part.component';

@NgModule({
  declarations: [
    AppComponent,
    JobItemComponent,
    CreateEditJobComponent,
    CreateEditPartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
