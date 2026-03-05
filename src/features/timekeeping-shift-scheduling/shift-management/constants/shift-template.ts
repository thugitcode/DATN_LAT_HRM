export const downloadShiftTemplate = async (fileName = 'Mau_bang_phan_ca') => {
  const res = await fetch('/templates/Mau_bang_phan_ca.xlsx');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
