import * as XLSX from 'xlsx-js-style';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Xuất dữ liệu ra file Excel với định dạng (CSS-like styling)
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  // Giữ nguyên logic cũ sử dụng xlsx-js-style cho các trường hợp đơn giản
  const ws = XLSX.utils.json_to_sheet(data);
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "3b82f6" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "e5e7eb" } },
        bottom: { style: "thin", color: { rgb: "e5e7eb" } },
        left: { style: "thin", color: { rgb: "e5e7eb" } },
        right: { style: "thin", color: { rgb: "e5e7eb" } }
      }
    };
  }
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[address]) continue;
      if (!ws[address].s) ws[address].s = {};
      ws[address].s.border = {
        top: { style: "thin", color: { rgb: "e5e7eb" } },
        bottom: { style: "thin", color: { rgb: "e5e7eb" } },
        left: { style: "thin", color: { rgb: "e5e7eb" } },
        right: { style: "thin", color: { rgb: "e5e7eb" } }
      };
      if (R > 0) ws[address].s.alignment = { vertical: "center" };
    }
  }
  const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length + 5, 15) }));
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Xuất dữ liệu Sản phẩm với Dropdown Danh mục sử dụng ExcelJS
 */
export const exportProductsWithDropdown = async (data: any[], categories: string[], fileName: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  // 1. Định nghĩa Columns
  const columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Tên sản phẩm', key: 'name', width: 30 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Danh mục', key: 'category', width: 25 },
    { header: 'Giá', key: 'price', width: 15 },
    { header: 'Giá khuyến mãi', key: 'sale_price', width: 15 },
    { header: 'Số lượng tồn', key: 'stock', width: 15 },
    { header: 'Mô tả', key: 'description', width: 40 },
  ];
  worksheet.columns = columns;

  // 2. Định dạng Header
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' },
  };
  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // 3. Thêm dữ liệu
  data.forEach(item => {
    worksheet.addRow({
      id: item['ID'],
      name: item['Tên sản phẩm'],
      sku: item['SKU'],
      category: item['Danh mục'],
      price: item['Giá'],
      sale_price: item['Giá khuyến mãi'],
      stock: item['Số lượng tồn'],
      description: item['Mô tả'],
    });
  });

  // 4. Thêm Dropdown (Data Validation) cho cột Danh mục (Cột D - index 4)
  // Áp dụng cho 100 dòng tiếp theo (hoặc nhiều hơn nếu muốn)
  const categoryColumn = worksheet.getColumn('category');
  const dropdownList = categories.join(',');

  for (let i = 2; i <= (data.length > 0 ? data.length + 100 : 100); i++) {
    const cell = worksheet.getCell(`D${i}`);
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${dropdownList}"`],
      showErrorMessage: true,
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn danh mục từ danh sách có sẵn.'
    };
  }

  // 5. Thêm Border
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
    });
  });

  // 6. Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
};

/**
 * Đọc dữ liệu từ file Excel
 */
export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
};
