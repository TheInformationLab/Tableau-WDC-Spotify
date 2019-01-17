const mongoose = require('mongoose');
const { json, send } = require('micro');

mongoose.connect(`mongodb://${process.env.DBUSER}:${process.env.DBPASS}@${process.env.DBURI}`, { useNewUrlParser: true });

const statSchema = mongoose.Schema({
  wdc: String,
  action: String,
}, { timestamps: { createdAt: 'createdAt' } });

const Stat = mongoose.model('Statistic', statSchema);

// End Database config & schema

// API Routes

module.exports = async (req, res) => {
  const newStat = new Stat();
  const js = await json(req);
  newStat.wdc = js.wdc;
  newStat.action = js.action;
  console.log(js.wdc, js.action);
  newStat.save((err) => {
    if (err) {
      console.log(err);
      send(res, 401, {
        result: 'error',
        error: err,
      });
    } else {
      console.log('Success');
      send(res, 200, {
        result: 'recorded',
      });
    }
  });
};
