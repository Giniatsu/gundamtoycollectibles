var express = require('express');
var app = express();
const dayjs = require('dayjs')
const bodyParser = require('body-parser')
app.use(express.static('assets'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

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
    res.render('pages/index', {title: "HLJapan | Home" , data});
});

app.get('/item/:itemid', async function(req,res){
    try {
        console.log(req.params.itemid);
    } catch (error) {
        
    }
    const item_id = req.params.itemid;
    const item_ref = ingColl.doc(item_id);
    const doc = await item_ref.get();
    if(!doc.exists){
        console.log('No such document!');
    }else{
        console.log('Document data:', doc.data());
    }

    const sales_ref = ingColl.doc(item_id).collection('sales').orderBy('dateCreated')
    hist_array = []
    await sales_ref.get().then(subCol => {
        subCol.docs.forEach(element => {
            hist_array.push({
                ...element.data(),
                dateCreated: dayjs(element.data().dateCreated.toDate()).format('MMM-DD-YYYY hh:mm A')
            })
        })
    })

    let data = {
        url: req.url,
        itemData: doc.data(),
        hist_array
    }

    res.render('pages/item', {data, dayjs});
});

app.post('/item/:itemid', async function(req,res){
    try {
        console.log(req.params.itemid);
    } catch (error) {

    }

    try {
        const item_id = req.params.itemid;
        const item_ref = ingColl.doc(item_id);
        const doc = await item_ref.get();
        if(!doc.exists) {
            console.log('No such document!');
        } else {
            // console.log('Document data:', doc.data());
        }

        const sales_ref = ingColl.doc(item_id).collection('sales')

        const timestamp = fs.firestore.FieldValue.serverTimestamp()
        sales_ref.add({
            dateCreated: timestamp,
            quantity: req.body.quantityInput
        })

        res.json({
            success: 'true',
            data: {
                dateCreated: dayjs(new Date()).format('MMM-DD-YYYY hh:mm A'),
                quantity: req.body.quantityInput
            }
        })
    } catch (err) {
        res.json({
            success: 'false',
            error: err.message
        })
    }

});