const pool = require('../conexao');
const { montarQueryDeTransacoesDeFormaDinamica } = require('../utils');

const verificarQueryParamsTransacoes = async (req, res, next) => {
    const { filtro } = req.query;
    const idUsuario = req.usuario.id;

    try {
        if(!filtro){
            return next();
        }

        for (let f of filtro) {
            const uper = f[0].toUpperCase();

            f = f.replace(f[0], uper);

            filtro.splice(0,1, f);
        }

        const query = montarQueryDeTransacoesDeFormaDinamica(filtro);

        filtro.unshift(idUsuario);

        const retorno = await pool.query(query, filtro);

        return res.json(retorno.rows);
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor!" });
    }
}

module.exports = { 
    verificarQueryParamsTransacoes
}