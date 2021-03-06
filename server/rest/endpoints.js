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
 * Setup REST endpoints for the R dataframe demo ... well, there is only one ... not the droids you're looking for ...
 * move along ... move along
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

const {catchErrors} = require( '../handlers/errorHandlers');

module.exports = function(app)
{
  const dataFrame = require('../controllers/dfController');

  app.get('/api/getData', catchErrors(dataFrame.get_all_data));
};
