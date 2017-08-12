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

// logging service
import {LogLevel      } from './Logging';
import {LoggingService} from './Logging';

/**
 * A (very) simple http service to request and return data from back-end services
 */

@Injectable()
export class ServiceLayer 
{
 /**
  * Construct a new basic service
  *
  * @param _http: Http Injected Http instance from the platform
  *
  * @param _logger: LoggingService Injected logging service
  */
  constructor(protected _http: Http, protected _logger: LoggingService) 
  {
  }

 /**
  * Assign a logging level
  *
  * @param level: number Logging level 
  *
  * @return nothing Only messages at this level or higher will be logged
  */
  public set logLevel(level: number)
  {
    this._logger.logLevel = level;
  }

 /**
  * Log a specified message at the specified log level
  *
  * @param level: message level
  *
  * @param message: string Message to be logged
  */
  public logMessage(level: number, message: string): void
  {
    // everything is deferred to the logger
    this._logger.log(level, message);
  }

 /**
  * Retrieve data from from the requested URL
  *
  * @param _url: string URL of external service
  *
  * @return Observable<any>
  */
  public getData(url: string): Observable<Object>
  {
    if (url != "")
    {
      this._logger.log( LogLevel.INFO, "service layer, get data from: " +  url );

      return this._http.get(url)
             .catch( (err: any, caught:Observable<any>) => this.__errHandler(err, caught));
    }
  }

  private __errHandler( error: Response | any, caught: Observable<any> ): any
  {
    let errMsg: string = "DATA REQUEST FAILED: ";

    if (error instanceof Response) 
    {
      const body: any = error.json() || '';
      const err: any  = body.error || JSON.stringify(body);
      
      errMsg += `${error.status} - ${error.statusText || ''} ${err}`;
    }
    else
      errMsg += error.message ? error.message : error.toString();

    this._logger.log(LogLevel.ERROR, errMsg);
  }
}
