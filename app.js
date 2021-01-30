const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')

const app = express()

//Session
app.use(session({
    secret: 'Cursonode',
    resave: true,
    saveUninitialized: true
}))

app.use(flash())

//middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})


//body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())



//handlebars
app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')

//mongoose e models
mongoose.connect('mongodb://localhost/blogapp', {
    useNewUrlParser: true
}).then(() => {
    console.log('Conectado ao banco de dados')
}).catch((err) => {
    console.log('Erro ao se conectar: ' + err)
})

require('./models/Categoria')
require('./models/Postagem')
require('./models/Usuario')
const Postagem = mongoose.model('Postagem')
const Categoria = mongoose.model('Categoria')

//Pasta public
app.use(express.static(__dirname + '/public'))


//Rotas
app.use('/admin', require('./routes/admin'))
app.use('/usuarios', require('./routes/usuario'))

app.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('index', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar as postagenss: ' + err)
        res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {

        if(postagem) {
            res.render('postagem/index', {postagem: postagem})
            console.log(postagem)
        }else {
            req.flash('error_msg', 'Essa postagem não existe!')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno: ' + err)
        res.redirect('/')
    })
})

app.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('categoria/index', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias: ' + err)
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
        if(categoria) {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render('categoria/postagens', {categoria: categoria, postagens: postagens})
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar as postagens!')
                res.redirect('/categorias')
            })
        }else {
            req.flash('error_msg', 'Essa categoria não existe!')
            res.redirect('/categorias')
        }
        
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/categorias')
    })
})

app.get('/404', (req, res) => {
    res.send('Erro 404!')
})

const PORT = 3000
app.listen(PORT, () => {
    console.log('Servidor rodando')
})