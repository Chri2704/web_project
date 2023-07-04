const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers'); //importa oggetto data base dal **



/* GET ALL products*/
//in /api/products
router.get('/', function(req, res) {


let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page : 1; //recupero valore della richiesta e controllo che non sa vuota
const limit = (req.query.limit != undefined && req.query.limit != 0) ? req.query.limit : 10; //setta limite di items per pagina

let startValue;
let endValue


if(page>0){
  startValue = (page*limit) -limit; //0,10,20,30
  endValue = page *limit;
}else {
  startValue = 0;
  endValue = 10;
}

//query al db : prendo prodotti e joino con categorie che hanno stesso id
database.table('products as p')
  .join([{
    table: 'categories as c',
    on: 'c.id = p.cat_id'
  }])
  .withFields(['c.title as category', //seleziono queli campi prendere dalla join
  'p.title as name',
  'p.price',
  'p.quantity',
  'p.image',
  'p.id'

  ])
  .slice(startValue, endValue) //divido il risultato con intervalli start e end
  .sort({id:.1}) //decrescente
  .getAll()
  .then(prods =>{ //dopo una get viene usata sempre la then -> se entro nell'if definisco un json con ilcount dei prodotti e i prodotti
      if(prods.length > 0){
          res.status(200).json({
            count: prods.length,
            products: prods
          });

      }else{ //altrimenti stampo errore
        res.json({message: 'no products founds'})
      }
  }).catch(err => console.log(err));

});

// GET prodotti singoli

router.get('/:prodId', (req, res) => {
  let productId = req.params.prodId;
  database.table('products as p')
      .join([
          {
              table: "categories as c",
              on: `c.id = p.cat_id`
          }
      ])
      .withFields(['c.title as category',
          'p.title as name',
          'p.price',
          'p.quantity',
          'p.description',
          'p.image',
          'p.id',
          'p.images'
      ])
      .filter({'p.id': productId})
      .get()
      .then(prod => {
          console.log(prod);
          if (prod) {
              res.status(200).json(prod);
          } else {
              res.json({message: `No product found with id ${productId}`});
          }
      }).catch(err => res.json(err));
});

//GET dei prodotti della stessa categoria

router.get('/category/:catName', (req, res) => { // Sending Page Query Parameter is mandatory http://localhost:3636/api/products/category/categoryName?page=1
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;   // check if page query param is defined or not
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   // set limit of items per page
  let startValue;
  let endValue;
  if (page > 0) {
      startValue = (page * limit) - limit;      // 0, 10, 20, 30
      endValue = page * limit;                  // 10, 20, 30, 40
  } else {
      startValue = 0;
      endValue = 10;
  }

  // Get category title value from param
  const cat_title = req.params.catName;

  database.table('products as p')
      .join([
          {
              table: "categories as c",
              on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
          }
      ])
      .withFields(['c.title as category',
          'p.title as name',
          'p.price',
          'p.quantity',
          'p.description',
          'p.image',
          'p.id'
      ])
      .slice(startValue, endValue)
      .sort({id: 1})
      .getAll()
      .then(prods => {
          if (prods.length > 0) {
              res.status(200).json({
                  count: prods.length,
                  products: prods
              });
          } else {
              res.json({message: `No products found matching the category ${cat_title}`});
          }
      }).catch(err => res.json(err));

});

module.exports = router;