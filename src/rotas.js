const express = require('express');
const pool = require('./conexao');
const { cadastrarUsuario, logarUsuario, detalharUsuario, atualizarUsuario } = require('./controladores/usuarios');
const { listarCategorias } = require('./controladores/categorias');
const { cadastrarTransacao, listarTransacoes, listarTransacaoPorId, atualizarTransacao, excluirTransacao, obterExtratoTransacoes } = require('./controladores/transaçoes');
const verificarUsuarioLogado = require('./intermediarios/autenticador');
const { validarNome, validarEmailESenha, validarCamposObrigatoriosTransacao } = require('./intermediarios/validadores');
const { verificarEmailNoBancoDeDados } = require('./intermediarios/varificadores');
const { verificarQueryParamsTransacoes } = require('./intermediarios/query');

const rotas = express();

rotas.post('/usuario', validarNome, validarEmailESenha, verificarEmailNoBancoDeDados, cadastrarUsuario);

rotas.post('/login', validarEmailESenha, logarUsuario);

rotas.use(verificarUsuarioLogado);

rotas.get('/usuario', detalharUsuario);

rotas.put('/usuario', validarNome, validarEmailESenha, atualizarUsuario);

rotas.get('/categoria', listarCategorias);

rotas.get('/transacao', verificarQueryParamsTransacoes, listarTransacoes);

rotas.get('/transacao/extrato', obterExtratoTransacoes);

rotas.get('/transacao/:id', listarTransacaoPorId);

rotas.post('/transacao', validarCamposObrigatoriosTransacao, cadastrarTransacao);

rotas.put('/transacao/:id', validarCamposObrigatoriosTransacao, atualizarTransacao);

rotas.delete('/transacao/:id', excluirTransacao);

module.exports = rotas;