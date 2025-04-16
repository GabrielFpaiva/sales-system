import { createTables, seedInitialData } from "../lib/db.ts";

async function initializeDatabase() {
  try {
    console.log("Iniciando criação das tabelas...")
    await createTables()

    console.log("Inserindo dados iniciais...")
    await seedInitialData()

    console.log("Banco de dados inicializado com sucesso!")
    process.exit(0)
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    process.exit(1)
  }
}

initializeDatabase()
