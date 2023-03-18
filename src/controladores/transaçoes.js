const pool = require('../conexao');
const { verificarCategoria, validarTipoTransacao } = require('../utils');

const listarTransacoes = async (req, res) => {
    const { id } = req.usuario;

    try {
        const transacoes = await pool.query('select tr.id, tr.tipo, tr.descricao, tr.valor, tr.data, tr.usuario_id, tr.categoria_id, ca.descricao as categoria_nome from transacoes tr join categorias ca on tr.categoria_id = ca.id where tr.usuario_id = $1;', [id]);

        return res.status(200).json(transacoes.rows);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor!"}); 
    }
}

const listarTransacaoPorId = async (req, res) => {
    const { id } = req.usuario;
    const transacaoId = req.params.id;

    try {
        const transacoes = await pool.query('select tr.id, tr.tipo, tr.descricao, tr.valor, tr.data, tr.usuario_id, tr.categoria_id, ca.descricao as categoria_nome from transacoes tr join categorias ca on tr.categoria_id = ca.id where tr.id = $1 and tr.usuario_id = $2;', [transacaoId, id]);

        return res.status(200).json(transacoes.rows[0]);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor!"}); 
    }
}

const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const usuarioId = req.usuario.id;

    try {
        const existeCategoria = await verificarCategoria(categoria_id);

        if(!existeCategoria) {
            return res.status(404).json({ mensagem: "Categoria inválida!"});
        }

        if(!validarTipoTransacao(tipo)) {
            return res.status(400).json({ mensagem: "Tipo de transação inválido!"});
        }

        const novaTransacao = await pool.query('insert into transacoes(descricao, valor, data, categoria_id, usuario_id, tipo) values($1, $2, $3, $4, $5, $6) returning *', [descricao, valor, data, categoria_id, usuarioId, tipo]);

        const categoriaNome = await pool.query('select * from categorias where id = $1', [categoria_id]);

        const retorno = {
            id: novaTransacao.rows[0].id,
            tipo: novaTransacao.rows[0].tipo,
            descricao: novaTransacao.rows[0].descricao,
            valor: novaTransacao.rows[0].valor,
            data: novaTransacao.rows[0].data,
            usuario_id: novaTransacao.rows[0].usuario_id,
            categoria_id: novaTransacao.rows[0].categoria_id,
            categoria_nome: categoriaNome.rows[0].descricao
        }

        return res.status(201).json(retorno);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor!"}); 
    }
}

const atualizarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const usuarioId = req.usuario.id;
    const transacaoId = req.params.id;

    try {
        const transacao = await pool.query('select * from transacoes where id = $1', [transacaoId]);

        if(transacao.rowCount < 1) {
            return res.status(400).json({ mensagem: "Transação não encontrada!" });
        }

        if(transacao.rows[0].usuario_id !== usuarioId) {
            return res.status(400).json({ mensagem: "Transação não encontrada!" });
        }

        const existeCategoria = await verificarCategoria(categoria_id);

        if(!existeCategoria) {
            return res.status(400).json({ mensagem: "Categoria não encontrada!" });
        }

        if(!validarTipoTransacao(tipo)) {
            return res.status(400).json({ mensagem: "Tipo de transação inválido!" });
        }

        const transacaoAtualizada = await pool.query('update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, usuario_id = $5, tipo = $6 where id = $7', [descricao, valor, data, categoria_id, usuarioId, tipo, transacaoId]);

        return res.status(200).json();
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensagem: "Erro interno do servidor!"}); 
    }
}

const excluirTransacao = async (req, res) => {
    const usuarioId = req.usuario.id;
    const transacaoId = req.params.id;

    try {
        const transacao = await pool.query('select * from transacoes where id = $1', [transacaoId]);

        if(transacao.rowCount < 1) {
            return res.status(400).json({ mensagem: "Transação não encontrada!" });
        }

        if(transacao.rows[0].usuario_id !== usuarioId) {
            return res.status(400).json({ mensagem: "Transação não encontrada!" });
        }

        const transacaoExcluida = await pool.query('delete from transacoes where id = $1', [transacaoId]);

        return res.status(200).json();
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor!"}); 
    }
}

const obterExtratoTransacoes = async (req, res) => {
    const { id } = req.usuario;

    try {
        const totalEntrada = await pool.query('select sum(valor) as entrada from transacoes where usuario_id = $1 and tipo = $2', [id, 'entrada']);

        const totalSaida = await pool.query('select sum(valor) as saida from transacoes where usuario_id = $1 and tipo = $2', [id, 'saida']);

        if(totalEntrada.rows[0].entrada === null) {
            totalEntrada.rows[0] = { entrada: 0};        
        }

        if(totalSaida.rows[0].saida === null) {
            totalSaida.rows[0] = { saida: 0};        
        }

        const retorno = {
            entrada: Number(totalEntrada.rows[0].entrada),
            saida: Number(totalSaida.rows[0].saida)
        }

        return res.status(200).json(retorno);
    } catch (error) {
        console.log(error)
        res.status(500).json({ mensagem: "Erro interno do servidor!"}); 
    }
}

module.exports = {
    listarTransacoes,
    listarTransacaoPorId,
    cadastrarTransacao,
    atualizarTransacao,
    excluirTransacao,
    obterExtratoTransacoes
}