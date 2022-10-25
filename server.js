var express = require('express');
var app = express();
app.use(express.static('assets'))

const port = process.env.PORT || 3000;
app.listen(port,);
app.set('view engine', 'ejs');

var fs = require("firebase-admin");
let serviceAccount;
if(process.env.GOOGLE_CREDENTIALS != null){
    serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS)
}else{
    serviceAccount = require("./jpgundamtoycollectibles-firebase-adminsdk-jj4f7-40ee22633d.json")
}
fs.initializeApp({
    credential: fs.credential.cert(serviceAccount)
});

const db = fs.firestore();
const ingColl = db.collection('items');

app.get('/', async function (req, res){
    const items = await ingColl.get();
    // console.log(items.docs.length);
    // items.forEach(doc => {
    //     console.log(doc.data());
    // })
    let data = {
        url: req.url,
        itemData: items.docs,
    }
    res.render('pages/index', data);
});