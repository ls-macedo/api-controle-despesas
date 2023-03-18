const pool = require('../conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey');
const { verificarEmail } = require('../utils');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoUsuario = await pool.query('insert into usuarios(nome, email, senha) values($1, $2,$3) returning id, nome, email;', [nome, email, senhaCriptografada]);

        return res.status(201).json(novoUsuario.rows[0]);
    } catch (error) {
        res.status(500).json({ menssagem: "Erro interno do servidor!"});
    }
}

const logarUsuario = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await pool.query('select * from usuarios where email = $1', [email]);

        if(usuario.rowCount < 1) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválido(s)." });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);

        if(!senhaValida) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválido(s)." });
        }

        const token = jwt.sign({ id: usuario.rows[0].id}, secretKey);

        const { senha: _, ...usuarioLogado } = usuario.rows[0];

        return res.status(200).json({ usuario: usuarioLogado, token});
    } catch (error) {
        res.status(500).json({ menssagem: "Erro interno do servidor!"});   
    }
}

const detalharUsuario = async (req, res) => {
    return res.status(200).json(req.usuario);
}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.usuario;

    try {
        const existeEmail = await verificarEmail(email);

        let emailPertenceAoUsuarioLogado = true;

        if(existeEmail) {
            const usuarioDonoDoEmail = await pool.query('select * from usuarios where email = $1', [email]);

            emailPertenceAoUsuarioLogado = usuarioDonoDoEmail.rows[0].id === id ? true : false;
        }

        if(!emailPertenceAoUsuarioLogado) {
            return res.status(400).json({ menssagem: "O e-mail informado já está sendo utilizado por outro usuário." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuarioAtualizado = await pool.query('update usuarios set nome = $1, email = $2, senha = $3 where id = $4', [nome, email, senhaCriptografada, id]);

        return res.status(200);
    } catch (error) {
        console.log(error)
        res.status(500).json({ menssagem: "Erro interno do servidor!"});
    }
}

module.exports = {
    cadastrarUsuario,
    logarUsuario,
    detalharUsuario,
    atualizarUsuario
}