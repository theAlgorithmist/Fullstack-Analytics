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
 * Typescript Math Toolkit:  Some methods for performing one-way, and cross-tab analysis on a data frame.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import {tableData     } from './DataFrame';
import {TSMT$DataFrame} from './DataFrame';
import {TSMT$Chi2     } from './Chi2';

export class TSMT$TableAnalysis
{
  protected __chisq: TSMT$Chi2;

  constructor()
  {
    this.__chisq = new TSMT$Chi2();
  }

  /**
   * Create a one-way table of categorical data for the specified column
   *
   * @param frame: TSMT$DataFrame
   *
   * @param category : String - Category or column name
   *
   * @param asProportion : Boolean - True if the count is to be converted into a percentage (which is automatically rounded to two decimal places)
   * @default false
   *
   * @return Object - name-value or key-value pairs.  Keys contain independent data items in the specified column of the original.  Values are the frequency count of each item.
   */
  public oneWayTable(frame: TSMT$DataFrame, category: string, _asPercentage: boolean=false): Object
  {
    const data: Array<tableData> = frame.getColumn(category);

    if (data.length == 0) {
      return new Object();
    }

    const n: number = data.length;

    // store occurrences of the category here
    let count: Object = new Object();
    let i: number;
    let item: any;

    for (i = 0; i < n; ++i)
    {
      item = data[i];

      if (count.hasOwnProperty(item))
      {
        // increment
        count[item]++;
      }
      else
      {
        // initialize
        count[item] = 1;
      }
    }

    if (_asPercentage)
    {
      const n1: number = 1.0/n;

      for (item in count) {
        count[item] = (count[item] * n1 * 100).toFixed(2);
      }
    }

    return count;
  }

  /**
   * Create a CrossTable between two columns of data
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @param category1 : String - Name of first category that represents the independent variable in the contingency analysis
   *
   * @param category 2 : String - Name of second category that represents the dependent variable(s)
   *
   * @param grouping : Array - Optional array of space-delimited Strings used to group the second category for counting
   * purposes (in which case the second column must contain character data).  If this argument is omitted or the array is
   * blank, then the number of columns in the cross-table with be equal to the number of unique items in the second category
   * of data.  Otherwise, the number of columns in the CrossTable is the number of elements in the grouping array.  For
   * example, a collection of colors such as 'Black,' 'Silver', 'Gray', 'White', 'Blue', 'Gold', 'Green', 'Yellow', 'Red'
   * might be grouped as ["Black Silver White Gray", "Blue Gold Green Red Yellow"].  This results in a CrossTable with
   * two columns, one for each group.
   *
   * @param colNames : Array - Optional array of column names associated with each group.  It is only necessary to
   * provide this information of grouping is applied.  Otherwise, column names consist of each unique value in the
   * dependent variable.
   *
   * @return Object - 'chi2' property is total chi-squared value for the table, 'df' (table degrees of freedom), and
   * 'q' property represents the q-value or probability that the table results occur by chance, based on chi-squared.
   * The 'table' property is an Object with keys consisting of an element of the CrossTable with the exception of the
   * final column which contains the row count.  Row names are unique category names of the independent variable.  Output
   * is ordered by ROWS.
   *
   * Interior cell objects contains 'c' property, which is the fraction of the column total, 'r' property for fraction of
   * the row total, 't' property for fraction of the table total, and 'n' property for the cell count.  'chi2' property
   * may be added in the future for cell chi-2 value.
   *
   * The array will be empty if inputs are invalid.  It is acceptable to not supply the grouping argument as lack of
   * presence of that array is interpreted as there is no grouping applied in the dependent variable.
   *
   */
  public crossTable(frame: TSMT$DataFrame,
                    category1: string,
                    category2: string,
                    grouping: Array<string>,
                    colNames: Array<string>): Object
  {
    const x: Array<tableData> = frame.getColumn(category1);
    const y: Array<tableData> = frame.getColumn(category2);

    if (x.length == 0 || y.length == 0) {
      return new Object();
    }

    let grouped: boolean = grouping != undefined && grouping != null;
    if (grouped) {
      grouped = grouping.hasOwnProperty("length");
    }

    let i: number;
    let j: number;
    let len: number;

    let columnNames: Array<string> = !colNames || !colNames.hasOwnProperty("length") ? new Array<string>() : colNames;

    if (columnNames.length != grouping.length)
    {
      // provide some default column name so at least the table data gets returned
      len = grouping.length;

      for (i = 0; i < len; ++i) {
        columnNames[i] = "G" + i.toString();
      }
    }

    // final output table
    let counts: Object = new Object();
    const n: number    = x.length;

    // build the output table
    let item: any;
    let col: tableData;

    // groups stored in arrays - if the data is not grouped, then create a grouped array from the unique elements
    // in the dependent variable
    let groups: Array<Array<string>>;
    let columns: number;

    if (!grouped)
    {
      grouping = new Array<any>();

      for (i = 0; i < n; ++i)
      {
        item = y[i];

        if (grouping.indexOf(item) == -1) {
          grouping.push(item);
        }
      }
    }

    // convert groups into a collection of arrays that can be quickly checked for presence of an item
    columns = grouping.length;
    groups  = new Array<Array<string>>();

    for (i = 0; i < columns; ++i) {
      groups.push(grouping[i].split(" "));
    }

    // process each element in the independent variable
    let row: Array<number>;
    for (i = 0; i < n; ++i)
    {
      item = x[i];
      col  = y[i];

      let g: Array<string>;

      // which group?
      let indx: number = -1;
      for (j = 0; j < columns; ++j)
      {
        g    = groups[j];
        indx = g.indexOf(col.toString());

        if (indx != -1)
        {
          indx = j;
          break;
        }
      }

      // update the count in the appropriate row
      if (counts.hasOwnProperty(item))
      {
        row = counts[item];
        if (isNaN(row[indx]))
        {
          row[indx] = 1;
        }
        else
        {
          row[indx]++;
        }
      }
      else
      {
        row          = new Array<number>();
        row[indx]    = 1;
        counts[item] = row;
      }
    }

    // get the row and column counts - we have to keep the column counts in separate array - the row totals are
    // appended onto each row count array
    let rowCount: number = 0;
    let colCount: number = 0;

    const columnCounts = new Array<number>();

    for (j = 0; j < columns; ++j) {
      columnCounts.push(0);
    }

    let sum: number = 0.0;
    let key: string;

    for (key in counts)
    {
      rowCount = 0;
      if (counts.hasOwnProperty(key))
      {
        row = counts[key];

        for (j = 0; j < columns; ++j)
        {
          columnCounts[j] += row[j];
          rowCount        += row[j];
        }

        row.push(rowCount);

        sum += rowCount;
      }
    }

    // and, finally, compute chi-2 and the other goodies, then load them into the table
    let expected: Object = new Object();
    let chi2: number     = 0.0;
    let e: number;
    let t: number;
    let s: number;
    let obj: Object;
    let theRow: Array<any>;

    sum = 1.0/sum;

    for (key in counts)
    {
      if (counts.hasOwnProperty(key))
      {
        if (!expected.hasOwnProperty(key)) {
          expected[key] = [];
        }

        e        = expected[key];                 // row-vector of expected (and then observed - expected) values
        theRow   = counts[key];                   // current row counts
        rowCount = theRow[columns];               // count was appended onto the array in previous step

        for (j = 0; j < columns; ++j)
        {
          t    = (columnCounts[j]*rowCount)*sum;  // divide is probably a wash next to memory access times
          s    = theRow[j] - t;                   // observed - expected
          e[j] = s*s/t;                           // (o-e)^2 / e

          chi2 += e[j];

          obj      = {};
          obj['n'] = theRow[j];
          obj['r'] = theRow[j]/rowCount;
          obj['c'] = theRow[j]/columnCounts[j];
          obj['t'] = theRow[j]*sum;

          // don't like this, but it's fast and uses less memory - will likely substitute something cleaner in the future
          theRow[j] = obj;
        }
      }
    }

    const df: number = (n-1)*(columns-1);
    this.__chisq.nu  = df;

    return {chi2: chi2, df: df, q: this.__chisq.q(chi2), table: counts};
  }

  /**
   * Create a full cross-tabulation between the first column of data and all other columns of data.  All data must be
   * numerical in the input data frame
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @return Array<Array<Object>> Each Object contains 'n', 'r', 'c', and 't' properties, just as CrossTable, without
   * the row sum value.  Length with be m x n where m is number of data items and n is the number of numerical
   * observations.  Output is ordered by columns.
   */
  public crossTabulation(frame: TSMT$DataFrame): Object
  {
    if (frame.size == 0) {
      return new Object();
    }

    const table: Array<Array<tableData>> = frame.table;

    // final output table
    const counts:Array<any> = new Array<any>();
    const n: number         = frame.size;
    let chi2: number        = 0.0;

    // build the output table
    let item: number;
    let i: number;
    let j: number;
    let col: Array<number>;
    let sum: number;
    let columns: number = frame.categories.length - 1;

    // row and column counts
    let colCount: number           = 0;
    const rowCounts: Array<number> = new Array<number>();

    for (j = 0; j < n; ++j) {
      rowCounts.push(0);
    }

    const colCounts: Array<number> = new Array<number>();
    for (i = 0; i < columns; ++i) {
      colCounts.push(0);
    }

    // process each element in the independent variable against each other column in the table - since the table is
    // column-major, process the data by column
    sum = 0.0;

    for (j = 0; j < columns; ++j)
    {
      col = <Array<number>> table[j+1];

      colCount = 0;
      for (i = 0; i < n; ++i)
      {
        colCount     += col[i];
        rowCounts[i] += col[i];
      }

      colCounts[j] = colCount;

      sum += colCount;
    }

    // finish off production table
    let e: number;
    let t: number;
    let obj: any;
    let rowCount: number;
    let s: number;

    sum = 1.0/sum;  // 1/total count

    for (j = 0; j < columns; ++j)
    {
      col = <Array<number>> table[j+1];

      counts[j] = new Array<any>();
      e         = counts[j];  // column vector of expected (and then observed - expected) values

      for (i = 0; i < n; ++i)
      {
        rowCount = rowCounts[i];  // current row count

        // the usual suspects
        t    = (colCounts[j]*rowCount)*sum;     // divide is probably a wash next to memory access times
        s    = col[i] - t;                      // observed - expected
        e[i] = s*s/t;                           // (o-e)^2 / e

        chi2 += e[i];

        obj      = {};
        obj['n'] = col[i];
        obj['r'] = col[i]/rowCount;
        obj['c'] = col[i]/colCounts[j];
        obj['t'] = col[i]*sum;

        // fast, but not clean ... this loop will likely be refactored in the future
        e[i] = obj;
      }
    }

    // degrees of freedom
    const df: number = (n-1)*(columns-1);
    this.__chisq.nu = df;

    return {chi2:chi2, df:df, q:this.__chisq.q(chi2), table:counts};
  }

  /**
   * Normalize a data frame (all columns should be of numeric type) and return the data in an Array
   *
   * @param frame: TSMT$DataFrame Data Frame
   *
   * @return Array - 2D Array of normalized data, i.e. each column is normalized to the range [0,1] with 0 equal to the
   * minimum column element and 1 equal to the column maximum.  The original table is unchanged
   */
  public normalize(frame: TSMT$DataFrame): Array<Array<number>>
  {
    const output:Array<Array<tableData>> = frame.table;
    const n: number                      = frame.size;  // column count

    let i: number;
    let minValue: number;
    let maxValue: number;

    // process the data by column
    let len: number;
    let j: number;
    let col: Array<number>;
    let r: number;

    for (j = 0; j < n; ++j)
    {
      col = <Array<number>> output[j];
      len = col.length;

      minValue = Number.MAX_VALUE;
      maxValue = -Number.MAX_VALUE;

      for (i = 0; i < len; ++i)
      {
        if (col[i] < minValue) {
          minValue = col[i];
        }

        if (col[i] > maxValue) {
          maxValue = col[i];
        }
      }

      // inverse of range
      r = 1.0/(maxValue - minValue);

      // normalize the column
      for (i = 0; i < len; ++i) {
        col[i] = r * (col[i] - minValue);
      }
    }

    return <Array<Array<number>>> output;
  }

  /**
   * convert a table object with items and counts into an array of Objects with 'item' and 'count' properties.
   *
   * @param obj: Object Table object computed from one-way table analysis
   *
   * @returns Array<Object> Each array element contains an 'item' (name) and 'count' (item count) properties; allows
   * results to be processed in a simple list format
   */
  public toArray(obj: Object): Array<Object>
  {
    const table: Array<Object> = new Array<Object>();

    for (let key in obj) {
      table.push({item: key, count: obj[key]});
    }

    return table;
  }
}
