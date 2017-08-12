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
 * Typescript Math Toolkit:  Some methods for working with tabular data or simple 'data frames' in R lingo. A data
 * frame consists of header information, or category labels, and a 2D set of either character, numerical, or boolean
 * data.  Categories are listed across the first row of the table and each data point is in a single row underneath
 * each category.  Thus, category data is down columns and must be consistent along each column (i.e. do not mix numeric
 * and character data in the same column).
 *
 * NOTE: Category labels (column names) are CASE SENSITIVE.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

export type tableData = string | number | boolean;

export enum ColumnTypeEnum
{
  NUMERIC,
  CHARACTER,
  BOOLEAN
}

export class TSMT$DataFrame
{
  protected _table: Array<Array<any>>;   // data table (array of arrays, stored column-major)
  protected _categories: Array<string>;  // categories (character labels) for each column
  protected _types: Array<number>;       // type of each category of data (NUMERIC, CHARACTER, or BOOLEAN)
  protected _column: Array<tableData>;   // cache most recently fetched column
  protected _category: string;           // cache most recently fetched column name or category

  constructor()
  {
    this._table      = new Array<Array<any>>();
    this._categories = new Array<string>();
    this._types      = new Array<number>();
    this._column     = new Array<tableData>();
    this._category   = "";
  }
  /**
   * Assign the data frame from an array of Objects, where each Object key corresponds to a category label.  It is
   * acceptable to have an 'id' or an '_id' key as these will automatically be removed from the category label list
   * (the latter is common for auto-insertion into Mongo).
   *
   * @param data : Array - Each element is an Object whose keys correspond to category labels.
   *
   * @param dataTypes:Array - One element for each column that indicates the type of data - must be Table.NUMERIC,
   * TABLE.CHARACTER, or TABLE.BOOLEAN.  The number of elements in this array must be the same as the number of elements
   * in the first array of the data parameter
   *
   * @return Nothing - The internal table is assigned provided that all input is valid
   */
  public fromArrayObj(data: Array<Object>, dataTypes: Array<number>): void
  {
    if (data == undefined || data == null || data.length < 1) {
      return;
    }

    if (!dataTypes || dataTypes.length == 0) {
      return;
    }

    this.__clear();

    const keys: Array<string> = Object.keys(data[0]);

    // remove '_id' and 'id'
    let index: number = keys.indexOf('_id');
    if (index != -1) {
      keys.splice(index, 1);
    }

    index = keys.indexOf('id');
    if (index != -1) {
      keys.splice(index, 1);
    }

    const numKeys: number = keys.length;
    const items: number   = data.length;
    this._categories      = keys.slice();

    // process each object into the data table
    let i: number;
    let j: number;
    let dataItem: Object;

    // build the table column-major
    for (j = 0; j < numKeys; ++j) {
      this._table.push( new Array<tableData>() );
    }

    for (i = 0; i < items; ++i)
    {
      dataItem = data[i];

      for (j = 0; j < numKeys; ++j) {
        this._table[j].push( dataItem[keys[j]] );
      }
    }
  }

  /**
   * Assign the data frame from an array of arrays (where the first row ALWAYS contains the category labels)
   *
   * @param data : Array - Each element is an array containing one row of data and the first row is ALWAYS the category labels
   *
   * @param dataTypes:Array - One element for each column that indicates the type of data - must be Table.NUMERIC,
   * TABLE.CHARACTER, or TABLE.BOOLEAN.  The number of elements in this array must be the same as the number of elements
   * in the first array of the data parameter
   *
   * @return Nothing - The internal table is assigned provided that all input is valid
   */
  public fromArray(data: Array<Array<any>>, dataTypes: Array<number>): void
  {
    if (data == undefined || data == null || data.length < 2) {
      return;
    }

    if (!dataTypes || dataTypes.length == 0) {
      return;
    }

    if (data[0].length != dataTypes.length) {
      return;
    }

    this.__clear();

    this._categories = data[0].slice();
    const n: number  = this._categories.length;

    this._types = dataTypes.slice();

    // initialize each column
    let i: number;
    for (i = 0; i < n; ++i) {
      this._table[i] = new Array();
    }

    // copy the data in, column-major
    const len: number = data.length;
    let j: number;
    let row: Array<number>;

    for (i = 1; i < len; ++i)
    {
      row = data[i];

      for (j = 0; j < n; ++j) {
        this._table[j].push(row[j]);
      }
    }
  }

  /**
   * Access the categories or character names assigned to each column of data
   *
   * @return Array - Array of column names (categories) in order originally input
   */
  public get categories(): Array<string>
  {
    return this._categories.slice();
  }

  /**
   * Access the data type of each category
   *
   * @return Array - Array of data types for each category name in the order originally input - refer to ColumnTypeEnum.
   */
  public get dataTypes(): Array<number>
  {
    return this._types.slice();
  }

  /**
   * Access a copy of the current table data
   */
  public get table(): Array<Array<tableData>>
  {
    const len: number = this.size;
    if (len == 0 ) {
      return [];
    }

    const output: Array<Array<tableData>> = new Array<Array<tableData>>();

    let j: number;
    let n: number = this._categories.length;

    for (j = 0; j < n; ++j)
    {
      output[j] = this._table[j].slice();
    }

    return output;
  }

  /**
   * Access the number of data items (not category labels) in a the table
   *
   * @return number - Number of data items in any column of the Table
   */
  public get size(): number
  {
    if( this._table.length == 0 ) {
      return 0;
    }

    return this._table[0].length;
  }

  /**
   * Access a single column of data as a standalone array
   *
   * @param category : String - category (column) name
   *
   * @return Array - Copy of the current data in the specified column or an empty array if the category name is incorrect
   */
  public getColumn(category: string): Array<tableData>
  {
    if (category == this._category) {
      return this._column.slice();
    }

    const index: number = this._categories.indexOf(category);

    if (index == -1) {
      return new Array<tableData>();
    }

    this._category = category;
    this._column   = this._table[index].slice();

    return this._column.slice();
  }

  /**
   * Remove a column from the current table
   *
   * @param category : String - category (column) name (often a dependent variable that will be forecast based on
   * remaining table data)
   *
   * @return Nothing - If the named column exists in the table, it is removed and all other columns are shifted left
   */
  public removeColumn(category: string): void
  {
    const index: number = this._categories.indexOf(category);

    if (index == -1) {
      return;
    }

    if (category == this._category) {
      this._category      = "";
      this._column.length = 0;
    }

    this._table.splice(index, 1);
  }


  /**
   * Break the current table (by row division) into a training set and a test, or validation set
   *
   * @param row: number - Zero-based row index so that all rows from 0 to row are in the training set and rows row+1 to
   * end of table are in the validation set.
   *
   * @param data: Array - Optional 2D data source to use in lieu of the current table; this is used in cases where
   * normalized or externally transformed data is used in analysis
   *
   * @return Object - 'train' property contains a 2D array of the training data and 'test' contains the test or
   * validation set as a 2D array
   */
  public split(row: number, data?: Array<Array<any>>): Object
  {
    let n: number;
    let m: number;

    if (!data)
    {
      n = this._table.length;
      m = n == 0 ? 0 : this._table[0].length;
    }
    else
    {
      n = data.length;
      m = n == 0 ? 0 : data[0].length;
    }

    if (row < 0 || row >= m) {
      return {train: [], test: []};
    }

    const train: Array<Array<any>> = new Array<Array<any>>();
    const test: Array<Array<any>>  = new Array<Array<any>>();

    let j: number;
    for (j = 0; j < n; ++j) {
      train[j] = data ? data[j].slice(0, row + 1) : this._table[j].slice(0, row + 1);
    }

    if (row < m)
    {
      for (j = 0; j < n; ++j) {
        test[j] = data ? data[j].slice(row + 1, m) : this._table[j].slice(row + 1, m);
      }
    }

    return { train:train, test:test };
  }

  // internal method - clear the current table and prepare for new input
  protected __clear(): void
  {
    this._table.length      = 0;
    this._categories.length = 0;
    this._types.length      = 0;
    this._column.length     = 0;

    this._category = "";
  }
}
