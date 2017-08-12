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

/**
 * Root component for the R dataframe demo.  This component only displays summary information returned from
 * cross-tab analysis performed on the server.  Since the main focus of this demo is server-side analytics,
 * there is not much to this component.
 *
 * NOTE: Make sure you adjust the URL in the service call, below, to match your server setup
 */

// platform
import { Component
       , OnInit
       } from '@angular/core';

import { Response } from '@angular/http';

// internal
import { ServiceLayer } from './ServiceLayer';

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit
{
  // note that these will need to be make public or provide accessors for static analysis

  // statistical results
  protected _df: string   = '0';    // degrees of freedom
  protected _q: string    = '0';     // q-value
  protected _chi2: string = '0';  // chi-2 value

  // tabulation
  protected _n00: number = 0;
  protected _r00: number = 0;
  protected _c00: number = 0;
  protected _t00: number = 0;

  protected _n01: number = 0;
  protected _r01: number = 0;
  protected _c01: number = 0;
  protected _t01: number = 0;

  protected _row0: number = 0;

  protected _n10: number = 0;
  protected _r10: number = 0;
  protected _c10: number = 0;
  protected _t10: number = 0;

  protected _n11: number = 0;
  protected _r11: number = 0;
  protected _c11: number = 0;
  protected _t11: number = 0;

  protected _row1: number = 0;

  protected _n20: number = 0;
  protected _r20: number = 0;
  protected _c20: number = 0;
  protected _t20: number = 0;

  protected _n21: number = 0;
  protected _r21: number = 0;
  protected _c21: number = 0;
  protected _t21: number = 0;

  protected _row2: number = 0;

  constructor(protected _service: ServiceLayer)
  {
    // emnpty
  }

  public ngOnInit(): void
  {
    // change the URL to conform to how you setup the server - the code below was specific to my personal test environment
    this._service.getData('http://localhost:8000/api/getData')
                 .subscribe((data: Response) => this.__onServiceComplete(data.json()));
  }

  protected __onServiceComplete(data: Object): void
  {
    console.log( 'returned: ', data );

    this._df   = data['df'];
    this._q    = data['q'];
    this._chi2 = <string> (+data['chi2']).toFixed(4);

    const table: Object = data['table'];

    // two groups with two summary columns and a row total column.  There are three rows, one, for each model type
    // 'SE', 'SEL', and 'SES'.

    const SEL: Array<Object | number> = table['SEL'];
    const SE: Array<Object | number>  = table['SE'];
    const SES: Array<Object | number> = table['SES'];

    let cell: Object = SEL[0];

    this._n00 = cell['n'];
    this._r00 = +cell['r'];
    this._c00 = +cell['c'];
    this._t00 = +cell['t'];

    cell = SEL[1];
    this._n01 = +cell['n'];
    this._r01 = +cell['r'];
    this._c01 = +cell['c'];
    this._t01 = +cell['t'];

    this._row0 = +SEL[2];

    cell = SE[0];
    this._n10 = +cell['n'];
    this._r10 = +cell['r'];
    this._c10 = +cell['c'];
    this._t10 = +cell['t'];

    cell = SE[1];
    this._n11 = +cell['n'];
    this._r11 = +cell['r'];
    this._c11 = +cell['c'];
    this._t11 = +cell['t'];

    this._row1 = +SE[2];

    cell = SES[0];
    this._n20 = +cell['n'];
    this._r20 = +cell['r'];
    this._c20 = +cell['c'];
    this._t20 = +cell['t'];

    cell = SES[1];
    this._n21 = +cell['n'];
    this._r21 = +cell['r'];
    this._c21 = +cell['c'];
    this._t21 = +cell['t'];

    this._row2 = +SES[2];
  }
}
