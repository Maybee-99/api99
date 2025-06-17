const express=require('express')
const router=express.Router()
const {getAllProducts,getProductByCategory,search,createProduct,updateProduct,deleteProduct,getCountProducts}=require('../controllers/products')

router.get('/products',getAllProducts)
router.get('/products/:name',getProductByCategory)
router.get('/search/:name',search)
router.post('/products',createProduct)
router.put('/products/:id',updateProduct)
router.delete('/products/:id',deleteProduct)
router.get('/ProductItem',getCountProducts)

module.exports=router