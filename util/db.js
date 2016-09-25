var mysql = require('mysql');

var DBoptions = {
  host:'fgdbinstance.cmclvpcsh0vw.ap-northeast-1.rds.amazonaws.com',
  port:'3306',
  user:'ikbee',
  password:'dkffkqb77',
  database : 'Unibee',
  multipleStatements:true
};

var DBconnection = mysql.createConnection(DBoptions);

DBconnection.connect();

module.exports = DBconnection;
exports.DBoptions = DBoptions;
