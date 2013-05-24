module.exports = 
  { "development":
    { "driver":   "mysql"
      , "host":     "localhost"
      , "post":     3306
      , "database": "webmaker"
      , "username": "root"
      , "password": ""
    }
  , "test":
    { "driver":   "mysql"
      , "host":     "localhost"
      , "post":     3306
      , "database": "webmaker"
      , "username": "root"
      , "password": ""
    }
  , "production":
    { "driver":   "mysql"
      , "host":     "localhost"
      , "post":     3306
      , "database": "heroku_aa5f82c502bce25"
      , "username": "b8c4154ee4f6da"
      , "password": "daf9b594"


//      CLEARDB_DATABASE_URL: mysql://b8c4154ee4f6da:daf9b594@us-cdbr-east-03.cleardb.com/heroku_aa5f82c502bce25?reconnect=true

    }
  };
