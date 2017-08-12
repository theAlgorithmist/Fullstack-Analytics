'use strict';

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
 * Controller for R dataframe demo
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

const UsedCars = require('../models/usedCarsModel');   // user car model
const types    = require('../models/usedCarTypes');    // category types

// typescript math toolkit libraries used for the two-way or cross-table analysis
const {TSMT$TableAnalysis} = require('../lib/TableAnalysis');
const analysis             = new TSMT$TableAnalysis();

const {TSMT$DataFrame} = require('../lib/DataFrame');
const frame            = new TSMT$DataFrame();

// return all data from cross-table analysis
exports.get_all_data = async (req, res) =>
{
  await UsedCars.find( {}, function (err, cardata)
  {
    // cheap-azz workaround for CORS, although you probably won't need it
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if (err !== null) {
      res.send(err);
    }

    const data = JSON.parse(JSON.stringify(cardata));

    // load data frame from the result
    frame.fromArrayObj(data, types);

    // perform a very specific cross-table analysis and send the results to the client
    const output = analysis.crossTable(frame, "Model", "Color",
      ["Black Silver White Gray", "Blue Gold Green Red Yellow"],
      ["Simple-Color", "Bold-Color"]);

    res.json(output);
  });
};
