const mongoose = require('mongoose')


const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eDmin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
})

mongoose.model('Usuario', UsuarioSchema)