import pkg from 'pg';
const { Pool } = pkg;

async function checkConnection() {
  const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  })

  try {
    console.log("Tentando conectar ao banco de dados...")
    console.log("Configurações:", {
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DATABASE,
      port: process.env.POSTGRES_PORT,
      // Não exibimos a senha por segurança
    })

    const client = await pool.connect()
    console.log("Conexão bem-sucedida!")

    const result = await client.query("SELECT NOW()")
    console.log("Consulta de teste:", result.rows[0])

    client.release()
    process.exit(0)
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error)
    process.exit(1)
  }
}

checkConnection()
