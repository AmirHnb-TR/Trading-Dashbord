import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { FlashPosition } from './flashApi';

export async function exportPositionsToExcel(positions: FlashPosition[], wallet: string, totalPnl: number) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Nano Banana Dashboard';
  workbook.lastModifiedBy = 'Nano Banana Dashboard';
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheet = workbook.addWorksheet('Trading Performance', {
    properties: { tabColor: { argb: 'FF00B0F0' } }
  });

  // Basic styling setup
  sheet.columns = [
    { header: 'Market', key: 'market', width: 15 },
    { header: 'Side', key: 'side', width: 10 },
    { header: 'Entry Price', key: 'entryPrice', width: 15 },
    { header: 'Size (USD)', key: 'sizeUsd', width: 15 },
    { header: 'Collateral (USD)', key: 'collateralUsd', width: 18 },
    { header: 'Leverage', key: 'leverage', width: 10 },
    { header: 'Liq Price', key: 'liqPrice', width: 15 },
    { header: 'PnL (USD)', key: 'pnlUsd', width: 15 },
    { header: 'PnL (%)', key: 'pnlPercent', width: 12 },
  ];

  // Title row
  sheet.insertRow(1, ['Trading Performance Dashboard']);
  sheet.mergeCells('A1:I1');
  const titleCell = sheet.getCell('A1');
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' }
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Wallet info row
  sheet.insertRow(2, [`Wallet: ${wallet}`, '', '', '', '', '', '', `Total PnL: $${totalPnl.toFixed(2)}`]);
  sheet.mergeCells('A2:G2');
  sheet.mergeCells('H2:I2');
  const row2 = sheet.getRow(2);
  row2.font = { size: 12, bold: true };

  // Empty row for spacing
  sheet.insertRow(3, []);

  // Make the header row beautiful
  const headerRow = sheet.getRow(4);
  headerRow.values = [
    'Market', 'Side', 'Entry Price', 'Size (USD)', 'Collateral (USD)', 'Leverage', 'Liq Price', 'PnL (USD)', 'PnL (%)'
  ];
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' }
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add data rows
  positions.forEach((pos, index) => {
    const row = sheet.addRow({
      market: pos.marketSymbol,
      side: pos.sideUi,
      entryPrice: parseFloat(pos.entryPriceUi),
      sizeUsd: parseFloat(pos.sizeUsdUi),
      collateralUsd: parseFloat(pos.collateralUsdUi),
      leverage: parseFloat(pos.leverageUi),
      liqPrice: parseFloat(pos.liquidationPriceUi),
      pnlUsd: parseFloat(pos.pnlWithFeeUsdUi),
      pnlPercent: parseFloat(pos.pnlPercentageWithFee)
    });

    // Formatting numbers
    row.getCell('entryPrice').numFmt = '$#,##0.00';
    row.getCell('sizeUsd').numFmt = '$#,##0.00';
    row.getCell('collateralUsd').numFmt = '$#,##0.00';
    row.getCell('leverage').numFmt = '0.00"x"';
    row.getCell('liqPrice').numFmt = '$#,##0.00';

    // Style PnL colors
    const pnlUsdCell = row.getCell('pnlUsd');
    pnlUsdCell.numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
    const pnlUsdValue = parseFloat(pos.pnlWithFeeUsdUi);
    pnlUsdCell.font = { color: { argb: pnlUsdValue >= 0 ? 'FF00B050' : 'FFFF0000' }, bold: true };

    const pnlPercentCell = row.getCell('pnlPercent');
    pnlPercentCell.numFmt = '0.00"%"';
    pnlPercentCell.font = { color: { argb: pnlUsdValue >= 0 ? 'FF00B050' : 'FFFF0000' }, bold: true };

    // Alternate row colors
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
      });
    }

    // Add borders to all cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `FlashTrade_Performance_${new Date().toISOString().split('T')[0]}.xlsx`);
}
