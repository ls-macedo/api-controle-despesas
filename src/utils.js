const pool = require('./conexao');

const verificarEmail = async (email) => {
    const selectEmail = await pool.query('select email from usuarios where email = $1', [email]);

    const existeEmail = selectEmail.rowCount > 0 ? true : false;

    return existeEmail;
}

const verificarCategoria = async (categoriaId) => {
    const selectCategoria = await pool.query('select id from categorias where id = $1', [categoriaId]);

    const existeCategoria = selectCategoria.rowCount > 0 ? true : false;

    return existeCategoria;
}

const validarTipoTransacao = (tipo) => {
    let tipoEhValido;

    if(tipo === 'entrada' || tipo === 'saida') {
        tipoEhValido = true;
    }

    return tipoEhValido;
}

const montarQueryDeTransacoesDeFormaDinamica = (filtro) => {
        let query = 'select tr.id, tr.tipo, tr.descricao, tr.valor, tr.data, tr.usuario_id, tr.categoria_id, ca.descricao as categoria_nome from transacoes tr join categorias ca on tr.categoria_id = ca.id where tr.usuario_id = $1 and ca.descricao = $2';
        const queryPadrao = 'select tr.id, tr.tipo, tr.descricao, tr.valor, tr.data, tr.usuario_id, tr.categoria_id, ca.descricao as categoria_nome from transacoes tr join categorias ca on tr.categoria_id = ca.id where tr.usuario_id = $1 and ca.descricao = $2';

        for (let i = 2; i <= filtro.length; i++) {
            query += ` or ca.descricao = $${i+1}`;
        }

        if(filtro.length < 2) {
            return queryPadrao;
        } else {
            return query;
        }
}

module.exports = {
    verificarEmail,
    verificarCategoria,
    validarTipoTransacao,
    montarQueryDeTransacoesDeFormaDinamica
}