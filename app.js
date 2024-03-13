const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();

// Configuração para permitir o parse do corpo das requisições
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração dos cabeçalhos CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir acesso de qualquer origem
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeçalhos permitidos
    next();
  });

const connection = mysql.createConnection({
    host: '172.17.0.3',
    user: 'root',
    password: 'root',
    database: 'meu_banco_de_dados'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados');
});
// Rota para obter todos os dados da tabela
app.get('/', (req, res) => {
    connection.query('SELECT * FROM minha_tabela', (err, results) => {
        if (err) {
            console.error('Erro ao obter dados da tabela:', err);
            res.status(500).json({ error: 'Erro ao obter dados da tabela' });
            return;
        }
        res.status(200).json(results);
    });
});
// Rota para ler um único registro pelo ID
app.get('/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM minha_tabela WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao ler o registro:', err);
            res.status(500).json({ error: 'Erro ao ler o registro' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Registro não encontrado' });
            return;
        }
        res.status(200).json(result[0]);
    });
});
// Rota para adicionar uma nova linha à tabela
app.post('/adicionar', (req, res) => {
    const { nome, idade } = req.body;
    const sqlInsert = 'INSERT INTO minha_tabela (nome, idade) VALUES (?, ?)';
   
    connection.query(sqlInsert, [nome, idade], (err, result) => {
        if (err) {
            console.error('Erro ao inserir nova linha:', err);
            res.status(500).json({ error: 'Erro ao inserir nova linha na tabela' });
            return;
        }
  
        const newId = result.insertId;
  
        res.status(201).json({ id: newId, nome, idade });
    });
  });
// Rota para atualizar um registro existente pelo ID
app.put('/atualizar/:id', (req, res) => {
    const { id } = req.params;
    const { nome, idade } = req.body;
    const sqlUpdate = 'UPDATE minha_tabela SET nome = ?, idade = ? WHERE id = ?';
  
    connection.query(sqlUpdate, [nome, idade, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar registro:', err);
            res.status(500).json({ error: 'Erro ao atualizar registro na tabela' });
            return;
        }
        // Retorna apenas o registro atualizado como resposta
        connection.query('SELECT * FROM minha_tabela WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Erro ao buscar registro atualizado:', err);
                res.status(500).json({ error: 'Erro ao buscar registro atualizado na tabela' });
                return;
            }
  
            // Retorna apenas o registro atualizado como resposta
            res.status(200).json(results[0]);
        });
    });
  });
// Rota para deletar um registro existente pelo ID e retornar o registro deletado
app.delete('/deletar/:id', (req, res) => {
    const { id } = req.params;
    const sqlSelect = 'SELECT * FROM minha_tabela WHERE id = ?';
    const sqlDelete = 'DELETE FROM minha_tabela WHERE id = ?';
  
    connection.query(sqlSelect, [id], (err, result) => {
        if (err) {
            console.error('Erro ao buscar registro:', err);
            res.status(500).json({ error: 'Erro ao buscar registro na tabela' });
            return;
        }
        
        const registroDeletado = result[0];
        
        connection.query(sqlDelete, [id], (err, result) => {
            if (err) {
                console.error('Erro ao deletar registro:', err);
                res.status(500).json({ error: 'Erro ao deletar registro da tabela' });
                return;
            }
            
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Registro não encontrado para deletar' });
                return;
            }
      
            // Retorna o registro deletado como resposta
            res.status(200).json(registroDeletado);
        });
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
