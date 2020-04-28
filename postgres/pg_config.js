const pg = require('pg')

pg.types.setTypeParser(pg.types.builtins.INT8, value => parseInt(value));

pg.types.setTypeParser(pg.types.builtins.FLOAT8, value => parseFloat(value));

pg.types.setTypeParser(pg.types.builtins.NUMERIC, value => parseFloat(value));