import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import ExcelJS from 'exceljs'
import fs from 'fs'

// Tipos do banco
type Material = { id: number; material: string; valor: number }
type EstoqueItem = { material: string; peso: number }
type Compra = { fornecedor: string; material: string; peso: number; valorTotal?: number; id?: number; data?: string }
type DB = { precos: Material[]; estoque: EstoqueItem[]; historico: Compra[] }

// Caminho do nosso "Banco de Dados" JSON
const DB_PATH = join(app.getPath('userData'), 'sucatao_db.json');

// Dados iniciais padrão caso o arquivo não exista
const DADOS_PADRAO = {
  precos: [
    { id: 1, material: 'Latinha', valor: 6.50 },
    { id: 2, material: 'Cobre', valor: 35.00 },
    { id: 3, material: 'Ferro', valor: 0.80 },
    { id: 4, material: 'Papelão', valor: 0.20 },
  ],
  estoque: [], // { material: 'Latinha', peso: 150.5 }
  historico: []
};

// Função auxiliar para ler/salvar dados
function lerDados(): DB {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DADOS_PADRAO));
    return DADOS_PADRAO as DB;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DB;
}

function salvarDados(dados: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2));
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200, height: 800, show: false,
    title: 'SUCATÃO FORTE',
    backgroundColor: '#eef2f4',
    autoHideMenuBar: true, // Remove menu padrão feio do Windows
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    try { mainWindow.maximize() } catch (e) { /* ignore */ }
    mainWindow.show()
  })
  
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.sucatao')
  
  // --- ROTAS DA API (IPC) ---

  // 1. Ler TUDO (Preços e Estoque) ao abrir
  ipcMain.handle('get-dados', () => lerDados());

  // 2. Atualizar Preços
  ipcMain.handle('update-precos', (_e: Electron.IpcMainInvokeEvent, novosPrecos: Material[]) => {
    const db = lerDados();
    db.precos = novosPrecos;
    salvarDados(db);
    return true;
  });

  // 3. Atualizar Estoque Manualmente
  ipcMain.handle('update-estoque', (_e: Electron.IpcMainInvokeEvent, novoEstoque: EstoqueItem[]) => {
    const db = lerDados();
    db.estoque = novoEstoque;
    salvarDados(db);
    return true;
  });

  // 4. SALVAR COMPRA (A Mágica acontece aqui)
  ipcMain.handle('salvar-compra', (_e: Electron.IpcMainInvokeEvent, compra: Compra) => {
    const db = lerDados();

    // A. Salva no Histórico
    const novaCompra: Compra = { ...compra, id: Date.now(), data: new Date().toISOString() };
    db.historico.push(novaCompra);

    // B. Atualiza Estoque Automaticamente
    const itemEstoque = db.estoque.find((i) => i.material === compra.material);
    if (itemEstoque) {
      itemEstoque.peso += Number(compra.peso);
    } else {
      db.estoque.push({ material: compra.material, peso: Number(compra.peso) });
    }

    salvarDados(db);
    return true;
  });

  // 5. GERAR EXCEL (Formatado e Bonito)
  ipcMain.handle('gerar-excel', async (_e, tipo) => { // tipo = 'dia' ou 'estoque'
    const db = lerDados();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tipo === 'estoque' ? 'Estoque Geral' : 'Compras do Dia');

    // Estilos Padrão (tipados com ExcelJS)
    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    const headerFill: Partial<ExcelJS.Fill> = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    const headerAlignment: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };

    const borderStyle: Partial<ExcelJS.Borders> = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    if (tipo === 'estoque') {
      // --- PLANILHA DE ESTOQUE ---
      worksheet.columns = [
        { header: 'MATERIAL', key: 'material', width: 30 },
        { header: 'PESO TOTAL (KG)', key: 'peso', width: 20 },
      ];
      
      // Formatação de número/align
      worksheet.getColumn(2).numFmt = '0.00';
      worksheet.getColumn(2).alignment = { horizontal: 'center' };
      db.estoque.forEach((item: EstoqueItem) => worksheet.addRow({ material: item.material, peso: Number(item.peso) }));

    } else {
      // --- PLANILHA DE COMPRAS ---
      worksheet.columns = [
        { header: 'DATA/HORA', key: 'data', width: 20 },
        { header: 'FORNECEDOR', key: 'fornecedor', width: 30 },
        { header: 'MATERIAL', key: 'material', width: 25 },
        { header: 'PESO (KG)', key: 'peso', width: 15 },
        { header: 'VALOR TOTAL (R$)', key: 'valor', width: 20 },
      ];

      db.historico.forEach((item: Compra) => {
        worksheet.addRow({
          data: new Date(item.data ?? new Date().toISOString()).toLocaleString('pt-BR'),
          fornecedor: item.fornecedor,
          material: item.material,
          peso: Number(item.peso),
          valor: Number(item.valorTotal ?? 0)
        });
      });

      // Formatação de colunas numéricas
      worksheet.getColumn(4).numFmt = '0.00'; // peso
      worksheet.getColumn(4).alignment = { horizontal: 'center' };
      worksheet.getColumn(5).numFmt = 'R$ #,##0.00'; // valor
      worksheet.getColumn(5).alignment = { horizontal: 'center' };
    }

    // APLICAR FORMATAÇÃO EM TUDO
    worksheet.getRow(1).eachCell((cell) => {
      (cell as ExcelJS.Cell).fill = headerFill as unknown as ExcelJS.Fill;
      (cell as ExcelJS.Cell).font = headerFont as ExcelJS.Font;
      (cell as ExcelJS.Cell).alignment = headerAlignment as ExcelJS.Alignment;
    });

    // Fixar a primeira linha
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        (cell as ExcelJS.Cell).border = borderStyle;
        if (rowNumber > 1) (cell as ExcelJS.Cell).alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    // Salvar
    const fileName = `Relatorio_${tipo}_${Date.now()}.xlsx`;
    const path = join(app.getPath('documents'), fileName);
    await workbook.xlsx.writeFile(path);
    shell.openPath(path); // Abre o arquivo automaticamente pra ela ver
    return path;
  });

  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })