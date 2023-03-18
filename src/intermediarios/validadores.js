const validarNome = (req, res, next) => {
    const { nome } = req.body;

    try {
        if(!nome) {
            return res.status(400).json({ mensagem: "Nome não informado!"});
        }

        next();
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor!"});
    }
}

const validarEmailESenha = (req, res, next) => {
    const { email, senha } = req.body;

    try {
        if(!email || !senha) {
            return res.status(400).json({ mensagem: "Email e/ou senha não informados!"});
        }

        next();
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor!"});
    }
}

const validarCamposObrigatoriosTransacao = (req, res, next) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if(!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
        }
    } catch (error) {
        res.status(500).json({ mensagem: "Erro interno do servidor!"});
    }

    next();
}

module.exports = {
    validarNome,
    validarEmailESenha,
    validarCamposObrigatoriosTransacao
}