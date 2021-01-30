const mongoose = require('mongoose')

const PostagemSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('Postagem', PostagemSchema)