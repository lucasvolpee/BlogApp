const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const Usuario = mongoose.model('Usuario')



router.get('/registrar', (req, res) => {
    res.render('usuarios/registrar')
})

router.post('/registrar', (req, res) => {

    const erros = []

    if(!req.body.nome || req.body.nome == null || req.body.nome == undefined) {
        erros.push({texto: 'Nome invalido'})
    }

    if(!req.body.email || req.body.email == null || req.body.email == undefined) {
        erros.push({texto: 'Email invalido'})
    }

    if(!req.body.senha || req.body.senha == null || req.body.senha == undefined) {
        erros.push({texto: 'Senha invalida'})
    }
    
    if(req.body.senha.length < 6) {
        erros.push({texto: 'Senha muito curta. Deve ter no minino 6 caracteres'})
    }

    if(req.body.senha2 != req.body.senha) {
        erros.push({texto: 'As senhas não coincidem'})
    }

    if(erros.length > 0) {
        res.render('usuarios/registrar', {erros: erros})
    }else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario) {
                req.flash('error_msg', 'Esse email já está cadastrado!')
                res.redirect('/usuarios/registrar')
            }else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.senha, salt, (err, hash) => {
                        if(err) {
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuario')
                            res.redirect('/usuarios/registrar')
                        }
                        
                        Usuario.create({
                            nome: req.body.nome,
                            email: req.body.email,
                            senha: hash
                        }).then(() => {
                            req.flash('success_msg', 'Usuario cadastrado com sucesso!')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao cadastrar o usuario: ' + err)
                            res.redirect('/usuarios/registrar')
                        })
                    })
                })
                

            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno: ' + err)
            res.redirect('/')
        })



    }

})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})



module.exports = router