// const mongoose = require("mongoose");

class AppController {
  // Test the connection
   static async test(req, res) {
    return res.json({ message: 'Test ok' });
  }
}

module.exports = AppController;