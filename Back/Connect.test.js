const request = require('supertest');
const { app, connection } = require('./Connect');

describe('API Tests', () => {
  const testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'testpass'
  };

  let token, userId, listId, columnId, rowId, infoId;

  beforeAll(async () => {
    await request(app).post('/register').send(testUser);
    const res = await request(app)
      .post('/login')
      .send({ account: testUser.email, password: testUser.password });
    token = res.body.token;
    userId = res.body.id;
  });

  afterAll((done) => {
    connection.query('DELETE FROM Conta WHERE email = ?', [testUser.email], () => {
      connection.end();
      if (process.stdin.destroy) process.stdin.destroy();
      done();
    });
  });

  it('should create a list', async () => {
    const res = await request(app)
      .post('/createList')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Test List' });
    expect(res.statusCode).toBe(201);
  });

  it('should get user lists and save list ID', async () => {
    const res = await request(app)
      .get('/getLists')
      .set('Authorization', `Bearer ${token}`)
      .query({ ID_Conta: userId });
    listId = res.body[0].Id_Lista;
    expect(listId).toBeDefined();
  });

  it('should update list name', async () => {
    const res = await request(app)
      .put('/updateListName')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: listId, nome: 'Updated Name' });
    expect(res.body.success).toBe(true);
  });

  it('should add a column', async () => {
    const res = await request(app)
      .post('/newColumn')
      .set('Authorization', `Bearer ${token}`)
      .send({ newData: 'Col1', lista: listId });
    columnId = res.body.newColumn.ID_Coluna;
    expect(columnId).toBeDefined();
  });

  it('should add a row', async () => {
    const res = await request(app)
      .post('/newRow')
      .set('Authorization', `Bearer ${token}`)
      .send({ lista: listId });
    rowId = res.body.insertedId;
    expect(rowId).toBeDefined();
  });

  it('should insert a record in Info and update it', async () => {
    // Insert manually into Info
    const insertRes = await new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Info (Lin, Col, Dados) VALUES (?, ?, ?)';
      connection.query(sql, [rowId, columnId, 'original'], (err, result) => {
        if (err) reject(err);
        else resolve({ insertId: result.insertId });
      });
    });
    infoId = insertRes.insertId;

    const res = await request(app)
      .post('/updateData')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: infoId, newData: 'Example Data' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Dado atualizado com sucesso');
  });

  it('should get full list data', async () => {
    const res = await request(app)
      .get('/getListData')
      .set('Authorization', `Bearer ${token}`)
      .query({ lista: listId });
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get line ID by num', async () => {
    const res = await request(app)
      .get('/getLineId')
      .set('Authorization', `Bearer ${token}`)
      .query({ lista: listId, num: 1 });
    expect(res.body.linhaId).toBeDefined();
  });

  it('should delete column', async () => {
    const res = await request(app)
      .delete('/deleteColumn')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: columnId });
    expect(res.body.success).toBe(true);
  });

  it('should delete row', async () => {
    const res = await request(app)
      .delete('/deleteRow')
      .set('Authorization', `Bearer ${token}`)
      .send({ linha: rowId });
    expect(res.body.success).toBe(true);
  });

  it('should delete the list', async () => {
    const res = await request(app)
      .delete('/deleteList')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: listId });
    expect(res.body.success).toBe(true);
  });
});