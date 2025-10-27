const { waitForApiReady } = require('./utils/waitForApi');

module.exports = async () => {
  await waitForApiReady(30000);
};

