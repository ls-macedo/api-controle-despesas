const pool = require('../conexao');
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey');

const verificarUsuarioLogado = async (req, res, next) => {
    const { authorization } = req.headers;

    if(!authorization) {
        return res.status(401).json({ mensagem: "Não autorizado!"});
    }

    const token = authorization.split(' ')[1];

    try {
        const { id } = jwt.verify(token, secretKey);
        
        const { rows, rowCount } = await pool.query('select * from usuarios where id = $1', [id]);

        if(rowCount < 1) {
            return res.status(401).json({ mensagem: "Não autorizado!"});
        }

        req.usuario = {
            id,
            nome: rows[0].nome,
            email: rows[0].email
        }

        next();

    } catch (error) {
        return res.status(401).json({ mensagem: "Não autorizado!"});
    }
}

module.exports = verificarUsuarioLogado;