const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

module.exports = server => {
  server.use(morgan('short')); // 3rd party logging yarn add morgan
  server.use(helmet()); // 3rd party security yarn add helmet
  server.use(express.json()); // built in
  server.use(cors()); // 3rd party yarn add cors
};