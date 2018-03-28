// note_routes.js

var ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
  app.get('/ariadata/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    db.collection('ariadata').findOne(details, (err, item) => {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        res.send(item);
      }
    });
  });
  
  app.delete('/ariadata/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    db.collection('ariadata').remove(details, (err, item) => {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        res.send('ariadata ' + id + ' deleted!');
      } 
    });
  });
  
  app.post('/ariadata', (req, res) => {
    const data = { baby_name: req.body.baby_name, data_type: req.body.data_type, data_value: req.body.data_value, data_date: req.body.data_date, data_time: req.body.data_time };
    db.collection('ariadata').insert(data, (err, result) => {
      if (err) { 
        res.send({ 'error': 'An error has occurred' }); 
      } else {
        console.log("Received data: " + JSON.stringify(data));
        res.send(result.ops[0]);
      }
    });
  });
  
  app.put('/ariadata/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    const data = { baby_name: req.body.baby_name, data_type: req.body.data_type, data_value: req.body.data_value, data_date: req.body.data_date, data_time: req.body.data_time };
    db.collection('ariadata').update(details, data, (err, result) => {
      if (err) {
          res.send({'error':'An error has occurred'});
      } else {
          res.send(data);
      } 
    });
  });
  
};