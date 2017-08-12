/** 
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// platform imports
import { Injectable     } from '@angular/core';
import { Http, Response } from '@angular/http';

// rxjs
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

/**
 * A simple logging service to interact with a service layer to manage handling of errors and other progress information
 */

export enum LogLevel
{
  ALL,
  INFO,
  DEBUG,
  WARN,
  ERROR,
  NONE
}

@Injectable()
export class LoggingService
{
  protected _logURL: string;        // url to call to log information to server
  protected _level: number;         // logging level - defaults to LogLevel.ALL
  protected _header: Array<string>; // header that precedes a logged message - typically used to convey the level of the message

 /**
  * Construct a new logging service
  *
  * @param _http: Http Injected Http instance from the platform
  */
  constructor(protected _http: Http) 
  {
    this._logURL = "";
    this._level  = LogLevel.ALL;

    this._header = ['NONE: ', 'INFO: ', 'DEBUG: ', 'WARNING: ', 'ERROR: ', 'ALL: ' ];
  }

  public static validLevel(level: number): level is LogLevel
  {
    return level == LogLevel.ALL || level == LogLevel.DEBUG || level == LogLevel.ERROR || level == LogLevel.INFO || level == LogLevel.NONE || level == LogLevel.WARN;
  }

 /**
  * Assign a log level
  *
  * @param level: number Log level (should be one of the levels described in LogLevel)
  */
  public set logLevel(level: number)
  {
    if (LoggingService.validLevel(level))
      this._level = level;
  }

 /**
  * Assign a url to use in order to send log data to a server (otherwise it is only written to console)
  *
  * @param _url: string URL of external service
  *
  * @return Observable<any>
  */
  public set logUrl(url: string)
  {
    if (url != "")
      this._logURL = url;
  }

 /**
  * Log the supplied message if it is at least as high as the current log level
  *
  * @param level: number Log level of the message
  *
  * @param message: Message to be logged
  *
  * @return nothing Message is logged to console if level is valid and greater than or equal to currently set log level.  If a URL is provided for message logging,
  * the message may also be sent to a server.
  */
  public log(level: number, message: string): void
  {
    if (LoggingService.validLevel(level) && level >= this._level)
    {
      // in reality, we would use a mix of console output and service calls
      const d: Date     = new Date(); 
      const dateAndTime = d.getDate() + "/" + (d.getMonth()+1)  + "/"  + d.getFullYear() + " @ "  + d.getHours() + ":"  + d.getMinutes();

      const outputMsg: string = this._header[level] + " at " + dateAndTime + "  -  " + message;
      console.log( outputMsg );

      if (this._logURL)
      {
        // send logging message to server
      }
    }
  }
}
