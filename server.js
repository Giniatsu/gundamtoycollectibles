var express = require('express');
var app = express();
app.use(express.static('assets'))

const port = process.env.PORT || 3000;
app.listen(port,);
app.set('view engine', 'ejs');

app.get('/', async function (req, res){
    let data = {
        url: req.url,
    }
    res.render('pages/index', data);
});