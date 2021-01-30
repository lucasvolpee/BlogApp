const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')


const Categoria = mongoose.model('Categoria')
const Postagem = mongoose.model('Postagem')


router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', (req, res) => {
    res.send('Página de posts')
})

router.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro ao listar as categorias')
        res.redirect('/admin/categorias')
    })
    
})

router.get('/categorias/adicionar', (req, res) => {
    res.render('admin/addcategoria')
})

router.post('/categorias/nova', (req, res) => {

    console.log(req.body)

    erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: 'Nome da categoria inválido'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: 'Slug inválido'})
    }

    if(req.body.slug.length < 2) {
        erros.push({texto: 'Slug muito curto'})
    }


    if(erros.length > 0) {
        res.render('admin/addcategoria', {erros: erros})
    }else {
        Categoria.create({
            nome: req.body.nome,
            slug: req.body.slug
        }).then(() => {
            req.flash('success_msg', 'Sucesso ao cadastrar a categoria')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            console.log('Erro: ' + err)
            req.flash('error_msg', 'Houve um erro ao cadastrar a categoria')
            res.redirect('/admin/categorias')
        })
    }

    
})


router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategoria', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Categoria não encontrada')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findById(req.body.id).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a edição da categoria')
            res.redirect('/admin/categorias')
        })
        
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/delet', (req, res) => {
    Categoria.findByIdAndDelete(req.body.id).then(() => {
        req.flash('success_msg','Categoria deletada!')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao deletar')
        res.redirect('/admin/categorias')
    })
})


router.get('/postagens', (req, res) => {
    Postagem.find().lean().populate('categoria').then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'houve um erro ao listar: ' + err)
        res.redirect('/admin')
    })
})

router.get('/postagens/adicionar', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Correu um erro: ' + err)
    })
    
})

router.post('/postagens/nova', (req, res) => {

    erros = []

    if(req.body.categoria == 0) {
        erros.push({texto: 'Não há categorias, registre uma!'})
    }

    if(erros.length > 0) {
        res.render('admin/addpostagem', {erros: erros})
    }else {
        Postagem.create({
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }).then(() => {
            req.flash('success_msg', 'Sucesso ao cadastrar a categoria')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao criar a postagem: ' + err)
            res.redirect('/admin/postagens')
        })
    }


})

router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findById(req.params.id).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagem', {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar as categorias! Erro: ' + err)
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar a postagem! Erro: ' + err)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/delet', (req, res) => {
    Postagem.findByIdAndDelete(req.body.id).then(() => {
        req.flash('error_msg', 'Postagem deletada')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao deletar a postagem: ' + err)
    })
})

router.post('/postagens/edit', (req, res) => {
    Postagem.findById(req.body.id).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao editar a postagem! Erro: ' + err)
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro: ' + err)
        res.redirect('/admin/postagens')
    })
})

module.exports = router