import JSZip from 'jszip';

export default class Download {

  async run() {
    // CSV content generation
    const csvContent = this.generateCSV([]);

    // Convert CSV to Blob
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });

    // Create a zip file with JSZip
    const zip = new JSZip();
    zip.file('data/data.csv', csvBlob);

    // Generate the zip file and download it
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(zipBlob, 'data.zip');
  }

  generateCSV(data: any[]) {
    // Convert array of objects to CSV format
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [header, ...rows].join('\n');
  }

  downloadBlob(blob: Blob, filename: string) {
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}