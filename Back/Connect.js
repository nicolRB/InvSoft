const express = require('express');
const mysql = require('mysql2');
const readline = require('readline');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const open = (...args) => import('open').then(mod => mod.default(...args));

// Create a connection to MySQL (without specifying the database for now)
const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: ''
});

// Set up the terminal interface for user input
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

connection.connect((err) => {
if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
}

console.log('Connected as ID ' + connection.threadId);

// Check if the database exists
connection.query('SHOW DATABASES LIKE "Listas"', (err, result) => {
    if (err) {
    console.error('Error checking database: ' + err.stack);
    return;
    }

    if (result.length === 0) {
    console.log('Database does not exist. Creating database...');
    
    // Create the database
    connection.query('CREATE DATABASE Listas', (err) => {
        if (err) {
        console.error('Error creating database: ' + err.stack);
        return;
        }
        console.log('Database "Listas" created.');
        // After creating the database, close the initial connection and reconnect with the new database
        connection.changeUser({ database: 'Listas' }, (err) => {
        if (err) {
            console.error('Error selecting database: ' + err.stack);
            return;
        }
        console.log('Connected to the "Listas" database');
        ensureTablesExist(); // Check and create tables if necessary
        });
    });
    } else {
    // If the database exists, just select it
    connection.changeUser({ database: 'Listas' }, (err) => {
        if (err) {
        console.error('Error selecting database: ' + err.stack);
        return;
        }
        console.log('Connected to the "Listas" database');
        ensureTablesExist(); // Check and create tables if necessary
    });
    }
});
});

function ensureTablesExist() {
const tables = [
    {
    name: 'Conta',
    createQuery: `CREATE TABLE IF NOT EXISTS Conta (
        ID_Conta INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
    )`
    },
    {
    name: 'Lista',
    createQuery: `CREATE TABLE IF NOT EXISTS Lista (
        Id_Lista INT AUTO_INCREMENT PRIMARY KEY,
        Nome_Lista VARCHAR(255) NOT NULL,
        Conta INT,
        FOREIGN KEY (Conta) REFERENCES Conta(ID_Conta)
    )`
    },
    {
    name: 'Linha',
    createQuery: `CREATE TABLE IF NOT EXISTS Linha (
        Id_Linha INT AUTO_INCREMENT PRIMARY KEY,
        Lista INT,
        Num INT NOT NULL,
        FOREIGN KEY (Lista) REFERENCES Lista(Id_Lista)
    )`
    },
    {
    name: 'Coluna',
    createQuery: `CREATE TABLE IF NOT EXISTS Coluna (
        Id_Coluna INT AUTO_INCREMENT PRIMARY KEY,
        Lista INT,
        Nome_Coluna VARCHAR(255) NOT NULL,
        FOREIGN KEY (Lista) REFERENCES Lista(Id_Lista)
    )`
    },
    {
    name: 'Info',
    createQuery: `CREATE TABLE IF NOT EXISTS Info (
        Id_Info INT AUTO_INCREMENT PRIMARY KEY,
        Lin INT,
        Col INT,
        Dados TEXT,
        FOREIGN KEY (Lin) REFERENCES Linha(Id_Linha),
        FOREIGN KEY (Col) REFERENCES Coluna(Id_Coluna)
    )`
    }
];

tables.forEach(table => {
    connection.query(table.createQuery, (err) => {
    if (err) {
        console.error(`Error creating table ${table.name}: ${err.stack}`);
        return;
    }
    console.log(`Table ${table.name} is ready.`);
    });
});
}

open(`http://localhost:${port}`);

app.use(express.json());                      // for JSON bodies
app.use(express.urlencoded({ extended: true })); // for HTML form submissions

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Username, email and password required' });

    try {
        const saltRounds = 15;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        connection.query(
            'INSERT INTO Conta (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: 'Username or email already exists' });
                    }
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

// Login endpoint
const jwtSecret = process.env.JWT_SECRET || 'InventSoftware1';  // Environment variable for added security

// Login endpoint
app.post('/login', async (req, res) => {
    const { account, password } = req.body;
    if (!account || !password) {
        return res.status(400).json({ message: 'Email/Username and password required' });
    }

    connection.query(
        'SELECT * FROM Conta WHERE email = ? OR username = ?',
        [account, account],
        async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];
            console.log(user);  // Show the user data for debugging

            const passwordMatch = await bcrypt.compare(password, user.Password_Hash);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.ID_Conta, username: user.Username },
                jwtSecret,
                { expiresIn: '1h' }
            );

            res.json({ message: 'Logged in successfully', token, id: user.ID_Conta });
        }
    );
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);  // No token = unauthorized

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);  // Token expired or invalid

        req.user = user;  // Attach user to the request object
        next();
    });
}

app.get('/getLists', authenticateToken, (req, res) => {
    const ID_Conta = req.query.ID_Conta;

    if (!ID_Conta) {
        return res.status(400).json({ message: 'User ID required' });
    }

    connection.query('SELECT * FROM Lista WHERE Conta = ?', [ID_Conta], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.json(results);  // Send results as JSON
        }
    });
});

app.get('/getListName', authenticateToken, (req, res) => {
    const listaId = req.query.lista;  // Retrieve the list ID from the query string

    if (!listaId) {
        return res.status(400).send('Missing lista ID');
    }

    // Query to get the list name
    connection.query('SELECT Nome_Lista FROM Lista WHERE Id_Lista = ?', [listaId], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error retrieving list name');
        } else {
            if (results.length > 0) {
                res.json({ Nome_Lista: results[0].Nome_Lista });  // Send the list name as JSON
            } else {
                res.status(404).send('List not found');
            }
        }
    });
});


app.get('/getListData', authenticateToken, (req, res) => {
    const listaId = req.query.lista;

    if (!listaId) {
        return res.status(400).send('Missing lista ID');
    }

    connection.query(`
        SELECT 
            Info.Id_Info,
            Lista.Id_Lista,
            Lista.Nome_Lista,
            Linha.Num AS Linha,
            Coluna.Nome_Coluna,
            Coluna.ID_Coluna,
            Info.Dados
        FROM Lista
        INNER JOIN Linha ON Lista.Id_Lista = Linha.Lista
        INNER JOIN Info ON Linha.Id_Linha = Info.Lin
        INNER JOIN Coluna ON Info.Col = Coluna.Id_Coluna
        WHERE Lista.Id_Lista = ?
        ORDER BY Linha.Num, Coluna.Nome_Coluna
    `, [listaId], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.json(results);
        }
    });
});


app.use(express.static('Front'));

app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});

function CriarLista() {
    rl.question('Nome da lista: ', (nome_lista) => {
        const query = 'INSERT INTO Lista (nome_lista) VALUES (?)';
        connection.query(query, [nome_lista], (err, results) => {
            if (err) {
                console.log('Erro na inserção: ', err);
            } else {
                console.log('Lista criada.');
            }
            showMenu();
        });
    });
}

app.post('/createList', authenticateToken, (req, res) => {
    const { nome } = req.body;
    const ID_Conta = req.user.id;  // Use 'id' instead of 'user_ID' from the token

    if (!nome) {
        return res.status(400).json({ message: 'List name is required' });
    }

    // Insert list into the database, linking it to the current user's account
    connection.query(
        'INSERT INTO Lista (Nome_Lista, Conta) VALUES (?, ?)', 
        [nome, ID_Conta],  // Use ID_Conta from the token directly
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.status(201).json({ message: 'List created successfully' });
        }
    );
});

function ApagarLista() {
    rl.question('ID da lista: ', (id_lista) => {
        const query = 'DELETE FROM Lista WHERE Id_Lista = ?';
        connection.query(query, [id_lista], (err, results) => {
            if (err) {
                console.log('Erro na deleção: ', err);
            } else {
                console.log('Lista apagada.');
            }
            showMenu();
        });
    });
}

function showMenu() {
    console.log('\nO que gostaria de fazer?');
    console.log('1 - Criar Lista');
    console.log('2 - Apagar Lista');
    console.log('3 - Acessar Lista');
    console.log('exit - Sair');

    rl.question('Escolha: ', (choice) => {
        switch (choice) {
            case '1':
                CriarLista();
                break;
            case '2':
                ApagarLista();
                break;
            case '3':
                VerListas();
                break;
            case 'exit':
                console.log('Saindo...');
                connection.end();
                rl.close();
                break;
            default:
                console.log('Escolha inválida!');
                showMenu();
                break;
        }
    });
}

function VerListas() {
    const query = 'SELECT Id_Lista, Nome_Lista FROM Lista';
    connection.query(query, (err, results) => {
        if (err) {
            console.log('Erro ao acessar listas: ', err);
        } else {
            console.log('\nListas: ');
            results.forEach((row, index) => {
                console.log(`[ID: ${row.Id_Lista}] [Nome: ${row.Nome_Lista}]`);
            });
            console.log('exit - Sair')
            AcessarLista()
        }
    });
}

function AcessarLista() {
    rl.question('Escolha ID ou sair: ', (x) => {
        if(x == 'exit') showMenu();
        else{
            const query = `
            SELECT 
                Lista.Id_Lista,
                Lista.Nome_Lista,
                Linha.Num AS Linha,
                Coluna.Nome_Coluna,
                Info.Dados
            FROM Lista
            INNER JOIN Linha ON Lista.Id_Lista = Linha.Lista
            INNER JOIN Info ON Linha.Id_Linha = Info.Lin
            INNER JOIN Coluna ON Info.Col = Coluna.Id_Coluna
            WHERE Lista.Id_Lista = ?
            ORDER BY Linha.Num, Coluna.Nome_Coluna
            `;
            
            connection.query(query, [x], (err, results) => {
                if (err) {
                    console.log('Erro ao acessar dados da lista: ', err);
                    showMenu();
                    return;
                }

                if (results.length === 0) {
                    console.log('Nenhum dado encontrado para essa lista.');
                    showMenu();
                    return;
                }

                console.log(`\nLista: ${results[0].Nome_Lista} (ID: ${results[0].Id_Lista})`);
                
                let currentLine = null;
                results.forEach(row => {
                    if (row.Linha !== currentLine) {
                        currentLine = row.Linha;
                        console.log(`\nLinha ${currentLine}:`);
                    }
                    console.log(`  ${row.Nome_Coluna}: ${row.Dados}`);
                });
                console.log('\nO que gostaria de acessar?');
                console.log('1 - Dados');
                console.log('2 - Linhas');
                console.log('3 - Colunas');
                console.log('exit - Sair');

                rl.question('Escolha: ', (choice) => {
                    switch (choice) {
                        case '1':
                            AcessarDados(x);
                            break;
                        case '2':
                            console.log('Oque Gostaria de mudar nas linhas?');
                            console.log('1 - Adicionar');
                            console.log('2 - Deletar');
                            console.log('exit - Sair');
                            rl.question('Escolha: ', (choice) => {
                                switch (choice) {
                                    case '1':
                                        break
                                    case '2':
                                        break
                                    case '3':
                                        break
                                    case 'exit':
                                        break
                                }
                            })
                            break;
                        case '3':
                            console.log
                            break;
                        case 'exit':
                            console.log('Saindo...');
                            connection.end();
                            rl.close();
                            break;
                        default:
                            console.log('Escolha inválida!');
                            showMenu();
                            break;
                    }
                });
            });
        }
    });
}

async function AcessarDados(lis) {
    console.log('exit - sair');

    rl.question('Qual linha gostaria de modificar: ', async (l) => {
        if (l === 'exit') return showMenu();

        try {
            const idl = await EncontrarIDLinha(lis, l);

            rl.question('Qual coluna gostaria de modificar: ', async (c) => {
                if (c === 'exit') return showMenu();

                try {
                    const idc = await EncontrarIDColuna(lis, c);

                    rl.question('O que gostaria de inserir: ', (d) => {
                        if (d === 'exit') return showMenu();

                        const query = 'UPDATE Info SET dados = ? WHERE lin = ? AND col = ?;';
                        connection.query(query, [d, idl, idc], (err, results) => {
                            if (err) {
                                console.error('Erro ao atualizar:', err);
                            } else {
                                console.log('Atualizado com sucesso.');
                            }
                            showMenu();
                        });
                    });

                } catch (err) {
                    console.error('Erro ao encontrar coluna:', err.message);
                    showMenu();
                }

            });

        } catch (err) {
            console.error('Erro ao encontrar linha:', err.message);
            showMenu();
        }
    });
}


function EncontrarIDColuna(lis, c) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT ID_Coluna FROM Coluna WHERE lista = ? AND nome_coluna = ?';
        connection.query(query, [lis, c], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return reject(new Error('Coluna não encontrada.'));
            }
            resolve(results[0].ID_Coluna);
        });
    });
}

function EncontrarIDLinha(lis, l) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT ID_Linha FROM Linha WHERE lista = ? AND num = ?';
        connection.query(query, [lis, l], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return reject(new Error('Linha não encontrada.'));
            }
            resolve(results[0].ID_Linha);
        });
    });
}

app.post('/updateData', authenticateToken, (req, res) => {
    const { id, newData } = req.body;

    if (!id || newData === undefined) {
        return res.status(400).json({ success: false, message: 'ID and new data are required' });
    }

    const query = 'UPDATE Info SET Dados = ? WHERE Id_Info = ?';

    connection.query(query, [newData, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar dado:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar dado', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Nenhuma linha foi atualizada (ID pode estar incorreto)' });
        }

        res.json({ success: true, message: 'Dado atualizado com sucesso' });
    });
});

app.put('/updateListName', authenticateToken, (req, res) => {
    const { id, nome } = req.body;

    if (!id || !nome) {
        return res.status(400).json({ success: false, message: 'ID e novo nome são obrigatórios' });
    }

    connection.query(
        'UPDATE Lista SET Nome_Lista = ? WHERE Id_Lista = ? AND Conta = ?',
        [nome, id, req.user.id],
        (err, results) => {
            if (err) {
                console.error('Erro no UPDATE:', err);
                return res.status(500).json({ success: false, message: 'Erro ao atualizar lista' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Lista não encontrada ou sem permissão' });
            }
            res.json({ success: true, message: 'Lista atualizada com sucesso' });
        }
    );
});

app.delete('/deleteList', authenticateToken, (req, res) => {
    const { id } = req.body;

    connection.query(
        'DELETE FROM Lista WHERE Id_Lista = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('Erro no DELETE:', err);
                return res.status(500).json({ success: false, message: 'Erro ao apagar a lista' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Lista não encontrada ou sem permissão' });
            }
            res.json({ success: true, message: 'Lista apagada com sucesso' });
        }
    );
});

app.post('/newColumn', authenticateToken, (req, res) => {
    const { newData, lista } = req.body;

    if (!newData) {
        return res.status(400).json({ success: false, message: 'Precisa de nome' });
    }

    const query = 'INSERT INTO Coluna (Nome_Coluna, Lista) VALUES (?, ?)';
    connection.query(query, [newData, lista], (err, result) => {
        if (err) {
            console.error('Error updating column name:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Return the new column data using the insertId
        res.json({
            success: true,
            newColumn: {
                ID_Coluna: result.insertId,
                Nome_Coluna: newData
            }
        });
    });
});

app.post('/newRow', authenticateToken, (req, res) => {
    const listaId = req.body.lista;

    if (!listaId) {
        return res.status(400).json({ success: false, message: 'Missing lista ID' });
    }

    // Find the highest Num for the given Lista
    connection.query(
        'SELECT MAX(Num) AS maxNum FROM Linha WHERE Lista = ?',
        [listaId],
        (err, results) => {
            if (err) {
                console.error('Error fetching max Num:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const nextNum = (results[0].maxNum || 0) + 1;

            // Insert the new row with the computed Num
            connection.query(
                'INSERT INTO Linha (Lista, Num) VALUES (?, ?)',
                [listaId, nextNum],
                (err, result) => {
                    if (err) {
                        console.error('Error inserting new row:', err);
                        return res.status(500).json({ success: false, message: 'Insert failed' });
                    }

                    res.json({ success: true, insertedId: result.insertId, num: nextNum });
                }
            );
        }
    );
});

app.post('/newColumnName', authenticateToken, (req, res) => {
    const { id, newData } = req.body;

    if (!id || !newData) {
        return res.status(400).json({ success: false, message: 'Missing column ID or new name' });
    }

    const query = 'UPDATE Coluna SET Nome_Coluna = ? WHERE Id_Coluna = ?';
    connection.query(query, [newData, id], (err, result) => {
        if (err) {
            console.error('Error updating column name:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true });
    });
});

app.delete('/deleteColumn', authenticateToken, (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: 'ID da coluna é obrigatório' });
    }

    // Deletar os dados associados à coluna na tabela Info
    connection.query('DELETE FROM Info WHERE Col = ?', [id], (err) => {
        if (err) {
            console.error('Erro ao deletar dados associados à coluna:', err);
            return res.status(500).json({ success: false, message: 'Erro ao deletar dados associados à coluna' });
        }

        // Deletar a coluna da tabela Coluna
        connection.query('DELETE FROM Coluna WHERE Id_Coluna = ?', [id], (err) => {
            if (err) {
                console.error('Erro ao deletar a coluna:', err);
                return res.status(500).json({ success: false, message: 'Erro ao deletar a coluna' });
            }

            res.json({ success: true, message: 'Coluna deletada com sucesso' });
        });
    });
});

app.delete('/deleteRow', authenticateToken, (req, res) => {
    const { linha } = req.body;

    if (!linha) {
        return res.status(400).json({ success: false, message: 'ID da linha é obrigatório' });
    }

    // Buscar a linha para obter o Lista e o Num
    const queryGetLinha = 'SELECT Lista, Num FROM Linha WHERE Id_Linha = ?';
    connection.query(queryGetLinha, [linha], (err, result) => {
        if (err) {
            console.error('Erro ao buscar linha:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar a linha' });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Linha não encontrada' });
        }

        const listaId = result[0].Lista;
        const deletedNum = result[0].Num;

        // Deletar os dados associados à linha na tabela Info
        connection.query('DELETE FROM Info WHERE Lin = ?', [linha], (err) => {
            if (err) {
                console.error('Erro ao deletar dados associados à linha:', err);
                return res.status(500).json({ success: false, message: 'Erro ao deletar dados associados à linha' });
            }

            // Deletar a linha da tabela Linha
            connection.query('DELETE FROM Linha WHERE Id_Linha = ?', [linha], (err) => {
                if (err) {
                    console.error('Erro ao deletar a linha:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao deletar a linha' });
                }

                // Reordenar as linhas restantes para manter a sequência
                const queryUpdateNums = `
                    UPDATE Linha 
                    SET Num = Num - 1 
                    WHERE Lista = ? AND Num > ?;
                `;
                connection.query(queryUpdateNums, [listaId, deletedNum], (err) => {
                    if (err) {
                        console.error('Erro ao reordenar as linhas:', err);
                        return res.status(500).json({ success: false, message: 'Erro ao reordenar as linhas' });
                    }

                    res.json({ success: true, message: 'Linha deletada e linhas reordenadas com sucesso' });
                });
            });
        });
    });
});

app.get('/getLineId', authenticateToken, (req, res) => {
    const { lista, num } = req.query;

    if (!lista || !num) {
        return res.status(400).json({ success: false, message: 'ID da lista e número da linha são obrigatórios' });
    }

    const query = 'SELECT Id_Linha FROM Linha WHERE Lista = ? AND Num = ?';
    connection.query(query, [lista, num], (err, results) => {
        if (err) {
            console.error('Erro ao buscar o ID da linha:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar a linha' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Linha não encontrada' });
        }

        res.json({ success: true, linhaId: results[0].Id_Linha });
    });
});

process.on('SIGINT', () => {
    console.log('\nEncerrando...');
    connection.end();
    rl.close();
    process.exit();
});