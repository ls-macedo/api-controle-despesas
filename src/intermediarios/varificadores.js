const pool = require('../conexao');

const verificarEmailNoBancoDeDados = async (req, res, next) => {
    const { email } = req.body;

    try {
        const selectEmail = await pool.query('select email from usuarios where email = $1', [email]);

        if(selectEmail.rowCount > 0) {
            return res.status(400).json("Email já cadastrado em nosso banco de dados!");
        }

        next();
    } catch (error) {
        res.status(500).json({ menssagem: "Erro interno do servidor!"});        
    }
}

module.exports = {
    verificarEmailNoBancoDeDados
}