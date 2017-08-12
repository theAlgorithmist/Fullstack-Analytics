import { BrowserModule  } from '@angular/platform-browser';
import { NgModule       } from '@angular/core';
import { HttpModule     } from '@angular/http';

import { AppComponent   } from './app.component';
import { ServiceLayer   } from './ServiceLayer';
import { LoggingService } from './Logging';

@NgModule({
  declarations: [
    AppComponent
  ],

  imports: [
    BrowserModule,
    HttpModule
  ],

  providers: [ServiceLayer, LoggingService],

  bootstrap: [AppComponent]
})
export class AppModule { }
