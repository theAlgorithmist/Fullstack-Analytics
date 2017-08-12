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
 * Typescript Math Toolkit:  Statistical methods for columns of a data frame
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import {TSMT$DataStats} from './DataStats';
import {TSMT$DataFrame} from './DataFrame';
import {tableData     } from './DataFrame';

// basic statistics on a single column of data
export enum SingleStatEnum
{
  MIN,
  MAX,
  RANGE,
  MEAN,
  MEDIAN,
  MODE,
  HARMONIC_MEAN,
  GEOMETRIC_MEAN,
  STDDEV,
  SKEWNESS,
  KURTOSIS
}

// basic statistics on two columns of data
export enum DoubleStatEnum
{
  CORRELATION,
  COVARIANCE
}

export class TSMT$FrameStats
{
  protected __stats: TSMT$DataStats;

  constructor()
  {
    this.__stats = new TSMT$DataStats();
  }

  /**
   * Access summary statistics for a column of numerical data
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @param category : String Category or column name, which must contain numeric data
   *
   * @return Array<number> Five-number summary of the data column, min., 1st quartile, median, 3rd quartile, max.
   */
  public getSummary(frame: TSMT$DataFrame, category: string): Array<number>
  {
    const data: Array<number> = < Array<number> > frame.getColumn(category);

    if (data.length > 0)
    {
      this.__stats.data = data;

      return this.__stats.fiveNumbers;
    }

    return [];
  }

  /**
   * Access a basic statistic of a single column of numerical data (statistic returns a single number)
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @param category : String - Category or column name
   *
   * @param type: number Member of SingleStatEnum to indicate the type of statistic to compute
   *
   * @return number - Requested statistic value or zero if inputs are invalid
   */
  public singleStat(frame: TSMT$DataFrame, category: string, type: number): number
  {
    const data: Array<number> = < Array<number> > frame.getColumn(category);

    if (data.length > 0)
    {
      this.__stats.data = data;

      switch (type)
      {
        case SingleStatEnum.MIN:
          return this.__stats.min;

        case SingleStatEnum.MAX:
          return this.__stats.max;

        case SingleStatEnum.RANGE:
          return this.__stats.max - this.__stats.min;

        case SingleStatEnum.MEAN:
          return this.__stats.mean;

        case SingleStatEnum.MEDIAN:
          return this.__stats.median;

        case SingleStatEnum.MODE:
          return this.__stats.mode;

        case SingleStatEnum.STDDEV:
          return this.__stats.std;

        case SingleStatEnum.GEOMETRIC_MEAN:
          return this.__stats.geometricMean;

        case SingleStatEnum.HARMONIC_MEAN:
          return this.__stats.harmonicMean;

        case SingleStatEnum.SKEWNESS:
          return this.__stats.skewness;

        case SingleStatEnum.KURTOSIS:
          return this.__stats.kurtosis;

        default:
          return 0;
      }
    }

    return 0;
  }

  /**
   * Access a basic statistic of two columns of numerical data (statistic returns a single number)
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @param category1 : string - First column name
   *
   * @param category2 : string - Second column name
   *
   * @param type: number Member of DoubleStatEnum to indicate the type of statistic to compute
   *
   * @return number - Requested statistic value or zero if inputs are invalid
   */
  public doubleStat(frame: TSMT$DataFrame, category1: string, category2: string, type: number): number
  {
    const x: Array<number> = < Array<number> > frame.getColumn(category1);
    const y: Array<number> = < Array<number> > frame.getColumn(category2);

    if (x.length > 0 && y.length > 0)
    {
      switch (type)
      {
        case DoubleStatEnum.CORRELATION:
          return this.__stats.correlation(x, y);

        case DoubleStatEnum.COVARIANCE:
          return this.__stats.covariance(x, y);

        default:
          return 0;
      }
    }

    return 0;
  }

  /**
   * Return fences (lower/upper ranges) for the current data based on inter-quartile range for use in
   * simple outlier detection
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @param category : String - Category or column name
   *
   * @return Object - 'lower' and 'upper' properties for lower/upper fence values or lower/upper values of zero if
   * inputs are invalid
   */
  public getFences(frame: TSMT$DataFrame, category: string): Object
  {
    const data: Array<number> = < Array<number> > frame.getColumn(category);

    if (data.length > 0)
    {
      const num: Array<number> = this.__stats.fiveNumbers;
      const q1: number         = num[1];
      const q3: number         = num[3];
      const iqr: number        = q3 - q1;

      return { lower: q1-1.5*iqr, upper: q3+1.5*iqr }
    }

    return {lower: 0, upper: 0};
  }

  /**
   * Access quantiles of a category or column of numerical data
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @param category : String - Category or column name
   *
   * @param q : Number - Quantile fraction in (0,1), i.e. 0.25 for quartiles, 0.2 for quintiles, or 0.1 for deciles.
   *
   * @return Array - First and last elements are min and max elements of the data column.  Middle elements are the requested quantiles in order, i.e. 0.25, 0.5, 0.75 or
   * 0.2, 0.4, 0.6, 0.8 - currently computed by straight linear interpolation.  Will likely get more sophisticated in a future release.
   *
   * Array will be empty for invalid data and quartile will default to 0.25 for invalid entries.
   */
  public getQuantiles(frame: TSMT$DataFrame, category: string, q: number): Array<number>
  {
    const data: Array<number> = < Array<number> > frame.getColumn(category);

    if (data.length > 0)
    {
      this.__stats.data = data;

      return this.__stats.getQuantile(q);
    }

    return []
  }

  /**
   * Transform all column data in the table to z-scores return the data in an Array
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @return Array - 2D Array of z-scored data.  The original table is unchanged
   */
  public zScore(frame: TSMT$DataFrame): Array<Array<number>>
  {
    let output:Array<Array<tableData>> = frame.table;
    const n: number                    = frame.size;  // column count

    let i: number;
    let len: number;
    let mu: number;
    let sigma: number;

    // process the data by column
    let j: number;
    let col: Array<number>;

    for (j = 0; j < n; ++j)
    {
      // all columns should be numeric data
      col = < Array<number> > output[j];
      len = col.length;

      // (mu, sigma) for column
      this.__stats.data = col;

      mu    = this.__stats.mean;
      sigma = 1.0/this.__stats.std;  // tbd - add numerical check

      // z-scores for the column
      for (i = 0; i < len; ++i) {
        col[i] = (col[i] - mu) * sigma;
      }
    }

    return <Array<Array<number>>> output;
  }
}
