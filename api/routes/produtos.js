import express from "express"
import { connectToDatabase } from '../utils/mongodb.js'
import { check, ExpressValidator, validationResult } from "express-validator"

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'informatica'

const validaProduto = [
     check('produto')
            .not()
            .isEmpty()
            .trim()
            .withMessage("É obrigatório informar o produto")
            .isAlphanumeric('pt-BR', {ignore: '/. '}),
    check('marca')
            .not()
            .isEmpty()
            .trim()
            .withMessage("É obrigatório informar qual a marca"),
    check('preco')
            .not()
            .isEmpty()
            .trim()
            .withMessage("É obrigatório informar o preco")
            .isNumeric()
            .withMessage('O preço só deve conter números'),
    check('estoque')
            .not()
            .isEmpty()
            .trim()
            .withMessage("É obrigatório informar a quantidade no estoque")
            .isNumeric()
            .withMessage('A quantidade informada só deve conter números'),
    check('cor')
            .not()
            .isEmpty()
            .trim()
            .withMessage("É obrigatório informar qual a cor do produto"),
    check('data_lancamento')
            .not()
            .isEmpty()
            .trim()
            .withMessage('É obrigatório informar a Data de nascimento'),
    check('classificacao')
            .not()
            .isEmpty()
            .trim()
            .withMessage("É obrigatório informar qual a classificação do produto"),
    check('peso')
            .not()
            .isEmpty()
            .trim()
            .withMessage("É obrigatório informar o peso do produtp")
            .isNumeric()
            .withMessage('O peso só deve conter números'),
]

/*
* GET /api/produtos
* Lista todos os produtos da loja
*/
router.get('/', async(req, res) => {
    try{
        db.collection(nomeCollection).find().sort({produto: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    }catch(err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a lista dos produtos',
                param: '/'
            }]
        })
    } 
})

/*
* GET /api/produtos/id/:id
* Lista todos os produtos da loja
*/
router.get('/id/:id', async(req, res) => {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.params.id)}}).toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            }else{
                res.status(200).json(docs) // retorna o documento
            }
        })
    }catch(err){
        res.status(500).json({"error": err.message})
    }
})

/**
 * GET /api/produtos/produto/:produto
 * Lista os produtos de serviço pelo nome 
 */
router.get('/produto/:produto', async(req, res)=> {
    try{
        db.collection(nomeCollection)
        .find({'produto': {$regex: req.params.nome, $options: "i"}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) // retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * GET /api/produtos/marca/:marca
 * Lista os produtos pela marca 
 */
router.get('/marca/:marca', async(req, res)=> {
    try{
        db.collection(nomeCollection)
        .find({'cpf': {$eq: req.params.cpf}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) 
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

router.get("/preco/:preco", async (req, res) => {
	try {
		db.collection(nomeCollection)
			.find({
				preco: { $lte: req.params.preco },
			})
			.toArray((err, docs) => {
				if (err) res.status(400).json(err); // bad request
				else res.status(200).json(docs);
			});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/*
* POST /api/produtos
* Insere um novo produto na loja
*/
router.post('/', validaProduto, async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    }else{
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/*
* PUT /api/produtos
* Altera um produto da loja
*/
router.put('/', validaProduto, async(req, res) =>{
    let idDocumento = req.body._id
    delete req.body._id

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    }else{
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq: ObjectId(idDocumento)}},{$set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/*
* DELET /api/produtos/:id
* Apaga o produto da loja pela id
*/
router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": {$eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})

export default router
