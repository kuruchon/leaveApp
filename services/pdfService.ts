
export const generatePdf = async (elementId: string, fileName: string): Promise<void> => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    alert('ไม่สามารถสร้าง PDF ได้: ไม่พบองค์ประกอบที่ต้องการ');
    return;
  }
  
  // @ts-ignore
  const { jsPDF } = window.jspdf;
  
  try {
    // @ts-ignore
    const canvas = await html2canvas(input, {
        scale: 2, // Increase resolution for better quality
        useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth - 20; // with margin
    let imgHeight = imgWidth / ratio;

    if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * ratio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = 10; // top margin

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
  }
};
