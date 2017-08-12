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
"use strict";
(function (ColumnTypeEnum) {
    ColumnTypeEnum[ColumnTypeEnum["NUMERIC"] = 0] = "NUMERIC";
    ColumnTypeEnum[ColumnTypeEnum["CHARACTER"] = 1] = "CHARACTER";
    ColumnTypeEnum[ColumnTypeEnum["BOOLEAN"] = 2] = "BOOLEAN";
})(exports.ColumnTypeEnum || (exports.ColumnTypeEnum = {}));
var ColumnTypeEnum = exports.ColumnTypeEnum;
var TSMT$DataFrame = (function () {
    function TSMT$DataFrame() {
        this._table = new Array();
        this._categories = new Array();
        this._types = new Array();
        this._column = new Array();
        this._category = "";
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
    TSMT$DataFrame.prototype.fromArrayObj = function (data, dataTypes) {
        if (data == undefined || data == null || data.length < 1) {
            return;
        }
        if (!dataTypes || dataTypes.length == 0) {
            return;
        }
        this.__clear();
        var keys = Object.keys(data[0]);
        // remove '_id' and 'id'
        var index = keys.indexOf('_id');
        if (index != -1) {
            keys.splice(index, 1);
        }
        index = keys.indexOf('id');
        if (index != -1) {
            keys.splice(index, 1);
        }
        var numKeys = keys.length;
        var items = data.length;
        this._categories = keys.slice();
        // process each object into the data table
        var i;
        var j;
        var dataItem;
        // build the table column-major
        for (j = 0; j < numKeys; ++j) {
            this._table.push(new Array());
        }
        for (i = 0; i < items; ++i) {
            dataItem = data[i];
            for (j = 0; j < numKeys; ++j) {
                this._table[j].push(dataItem[keys[j]]);
            }
        }
    };
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
    TSMT$DataFrame.prototype.fromArray = function (data, dataTypes) {
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
        var n = this._categories.length;
        this._types = dataTypes.slice();
        // initialize each column
        var i;
        for (i = 0; i < n; ++i) {
            this._table[i] = new Array();
        }
        // copy the data in, column-major
        var len = data.length;
        var j;
        var row;
        for (i = 1; i < len; ++i) {
            row = data[i];
            for (j = 0; j < n; ++j) {
                this._table[j].push(row[j]);
            }
        }
    };
    Object.defineProperty(TSMT$DataFrame.prototype, "categories", {
        /**
         * Access the categories or character names assigned to each column of data
         *
         * @return Array - Array of column names (categories) in order originally input
         */
        get: function () {
            return this._categories.slice();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TSMT$DataFrame.prototype, "dataTypes", {
        /**
         * Access the data type of each category
         *
         * @return Array - Array of data types for each category name in the order originally input - refer to ColumnTypeEnum.
         */
        get: function () {
            return this._types.slice();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TSMT$DataFrame.prototype, "table", {
        /**
         * Access a copy of the current table data
         */
        get: function () {
            var len = this.size;
            if (len == 0) {
                return [];
            }
            var output = new Array();
            var j;
            var n = this._categories.length;
            for (j = 0; j < n; ++j) {
                output[j] = this._table[j].slice();
            }
            return output;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TSMT$DataFrame.prototype, "size", {
        /**
         * Access the number of data items (not category labels) in a the table
         *
         * @return number - Number of data items in any column of the Table
         */
        get: function () {
            if (this._table.length == 0) {
                return 0;
            }
            return this._table[0].length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Access a single column of data as a standalone array
     *
     * @param category : String - category (column) name
     *
     * @return Array - Copy of the current data in the specified column or an empty array if the category name is incorrect
     */
    TSMT$DataFrame.prototype.getColumn = function (category) {
        if (category == this._category) {
            return this._column.slice();
        }
        var index = this._categories.indexOf(category);
        if (index == -1) {
            return new Array();
        }
        this._category = category;
        this._column = this._table[index].slice();
        return this._column.slice();
    };
    /**
     * Remove a column from the current table
     *
     * @param category : String - category (column) name (often a dependent variable that will be forecast based on
     * remaining table data)
     *
     * @return Nothing - If the named column exists in the table, it is removed and all other columns are shifted left
     */
    TSMT$DataFrame.prototype.removeColumn = function (category) {
        var index = this._categories.indexOf(category);
        if (index == -1) {
            return;
        }
        if (category == this._category) {
            this._category = "";
            this._column.length = 0;
        }
        this._table.splice(index, 1);
    };
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
    TSMT$DataFrame.prototype.split = function (row, data) {
        var n;
        var m;
        if (!data) {
            n = this._table.length;
            m = n == 0 ? 0 : this._table[0].length;
        }
        else {
            n = data.length;
            m = n == 0 ? 0 : data[0].length;
        }
        if (row < 0 || row >= m) {
            return { train: [], test: [] };
        }
        var train = new Array();
        var test = new Array();
        var j;
        for (j = 0; j < n; ++j) {
            train[j] = data ? data[j].slice(0, row + 1) : this._table[j].slice(0, row + 1);
        }
        if (row < m) {
            for (j = 0; j < n; ++j) {
                test[j] = data ? data[j].slice(row + 1, m) : this._table[j].slice(row + 1, m);
            }
        }
        return { train: train, test: test };
    };
    // internal method - clear the current table and prepare for new input
    TSMT$DataFrame.prototype.__clear = function () {
        this._table.length = 0;
        this._categories.length = 0;
        this._types.length = 0;
        this._column.length = 0;
        this._category = "";
    };
    return TSMT$DataFrame;
}());
exports.TSMT$DataFrame = TSMT$DataFrame;
