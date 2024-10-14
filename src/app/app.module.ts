import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { WorkItemComponent } from './work-item/work-item.component';
import { WorkItemService } from './work-item.service';

@NgModule({
  declarations: [AppComponent, WorkItemComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [WorkItemService],
  bootstrap: [AppComponent],
})
export class AppModule {}
