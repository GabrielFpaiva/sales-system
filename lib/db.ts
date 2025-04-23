import { Pool } from "pg"

// conexao postgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
})

// queries SQL
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// Função para criar as tabelas no banco de dados
export async function createTables() {
  // Tabela de Clientes
  await query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE,
      telefone VARCHAR(20),
      torce_flamengo BOOLEAN DEFAULT FALSE,
      assiste_one_piece BOOLEAN DEFAULT FALSE,
      de_sousa BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de Vendedores
  await query(`
    CREATE TABLE IF NOT EXISTS vendedores (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE,
      telefone VARCHAR(20),
      status VARCHAR(20) DEFAULT 'ativo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de Produtos
  await query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      descricao TEXT,
      preco DECIMAL(10, 2) NOT NULL,
      categoria VARCHAR(50),
      estoque INTEGER DEFAULT 0,
      fabricado_em VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de Formas de Pagamento
  await query(`
    CREATE TABLE IF NOT EXISTS formas_pagamento (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de Vendas
  await query(`
    CREATE TABLE IF NOT EXISTS vendas (
      id SERIAL PRIMARY KEY,
      cliente_id INTEGER REFERENCES clientes(id),
      vendedor_id INTEGER REFERENCES vendedores(id) NOT NULL,
      forma_pagamento_id INTEGER REFERENCES formas_pagamento(id) NOT NULL,
      valor_total DECIMAL(10, 2) NOT NULL,
      desconto DECIMAL(10, 2) DEFAULT 0,
      data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS itens_venda (
      id SERIAL PRIMARY KEY,
      venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
      produto_id INTEGER REFERENCES produtos(id),
      quantidade INTEGER NOT NULL,
      preco_unitario DECIMAL(10, 2) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL
    )
  `)

  try {
    await query(`
      ALTER TABLE vendedores 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo'
    `)
  } catch (error) {
    console.error("Erro ao adicionar coluna de status:", error)
  }

  // índices 
  try {
    
    await query(`CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria)`)

    await query(`CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda)`)

    await query(`CREATE INDEX IF NOT EXISTS idx_vendas_vendedor ON vendas(vendedor_id)`)

    await query(`CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON vendas(cliente_id)`)
  } catch (error) {
    console.error("Erro ao criar índices:", error)
  }

  // view para relatório de vendas por vendedor
  try {
    await query(`
      CREATE OR REPLACE VIEW vw_vendas_por_vendedor AS
      SELECT 
        v.vendedor_id,
        vd.nome as vendedor_nome,
        COUNT(v.id) as total_vendas,
        SUM(v.valor_total) as valor_total,
        AVG(v.valor_total) as ticket_medio,
        EXTRACT(YEAR FROM v.data_venda) as ano,
        EXTRACT(MONTH FROM v.data_venda) as mes
      FROM 
        vendas v
      JOIN 
        vendedores vd ON v.vendedor_id = vd.id
      GROUP BY 
        v.vendedor_id, vd.nome, ano, mes
      ORDER BY 
        vendedor_nome, ano, mes
    `)
    console.log("View vw_vendas_por_vendedor criada com sucesso!")
  } catch (error) {
    console.error("Erro ao criar view:", error)
  }

  //  stored procedure atualizar estoque
  try {
    await query(`
      CREATE OR REPLACE FUNCTION atualizar_estoque_produto()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE produtos
        SET estoque = estoque - NEW.quantidade
        WHERE id = NEW.produto_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // stored procedure
    await query(`
      DROP TRIGGER IF EXISTS trg_atualizar_estoque ON itens_venda;
      CREATE TRIGGER trg_atualizar_estoque
      AFTER INSERT ON itens_venda
      FOR EACH ROW
      EXECUTE FUNCTION atualizar_estoque_produto();
    `)
    console.log("Stored procedure e trigger para atualização de estoque criados com sucesso!")
  } catch (error) {
    console.error("Erro ao criar stored procedure:", error)
  }

  console.log("Tabelas criadas com sucesso!")
}

// Inserir dados iniciais
export async function seedInitialData() {
  // Inserir formas de pagamento
  await query(`
    INSERT INTO formas_pagamento (nome) 
    VALUES ('Dinheiro'), ('Cartão de Crédito'), ('Cartão de Débito'), ('PIX')
    ON CONFLICT DO NOTHING
  `)

  // Inserir vendedores
  await query(`
    INSERT INTO vendedores (nome, email, telefone, status) 
    VALUES 
      ('Maria Oliveira', 'maria@techstore.com', '(83) 99999-1111', 'ativo'),
      ('Carlos Pereira', 'carlos@techstore.com', '(83) 99999-2222', 'ativo'),
      ('Ana Souza', 'ana@techstore.com', '(83) 99999-3333', 'ativo')
    ON CONFLICT (email) DO NOTHING
  `)

  // Inserir produtos
  await query(`
    INSERT INTO produtos (nome, descricao, preco, categoria, estoque, fabricado_em) 
    VALUES 
      ('iPhone 15 Pro', 'Smartphone Apple com câmera profissional', 8999.00, 'smartphones', 15, 'outros'),
      ('Samsung Galaxy S23', 'Smartphone Samsung com tela AMOLED', 5499.00, 'smartphones', 23, 'mari'),
      ('AirPods Pro', 'Fones de ouvido sem fio com cancelamento de ruído', 1899.00, 'acessorios', 30, 'outros'),
      ('MacBook Pro M2', 'Notebook Apple com chip M2', 14999.00, 'notebooks', 8, 'outros'),
      ('Xiaomi Redmi Note 12', 'Smartphone Xiaomi com ótimo custo-benefício', 1799.00, 'smartphones', 0, 'mari')
    ON CONFLICT DO NOTHING
  `)

  console.log("Dados iniciais inseridos com sucesso!")
}
