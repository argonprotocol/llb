import JSZip from 'jszip';
import { IAction } from './Vault';
import VaultSnapshot from './VaultSnapshot';

export default class Download {
  public vaultSnapshot: VaultSnapshot;
  public actionsByDate: Record<string, IAction>;

  constructor(vaultSnapshot: VaultSnapshot | null) {
    if (!vaultSnapshot) throw new Error('VaultSnapshot is required');

    this.vaultSnapshot = vaultSnapshot;
    this.actionsByDate = vaultSnapshot.actions.reduce((acc, action) => {
      acc[action.date] = action;
      return acc;
    }, {} as Record<string, IAction>);
  }

  async run() {
    const records = this.generateData();
    const csvContent = this.generateCSV(records);

    // Convert CSV to Blob
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });

    // Create a zip file with JSZip
    const zip = new JSZip();
    zip.file('data/data.csv', csvBlob);

    // Generate the zip file and download it
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(zipBlob, 'data.zip');
  }

  generateData() {
    let lastVaultAction = this.vaultSnapshot.actions[0];

    const startingPrice = this.vaultSnapshot.prices[0].price;
    const records = [];
    for (const { date, price } of this.vaultSnapshot.prices) {
      const currentVaultAction = this.actionsByDate[date];

      const btcPriceDiffSinceLastVault = price - lastVaultAction.price;
      const btcChangeSinceLastVault = btcPriceDiffSinceLastVault / lastVaultAction.price;
      const {
        type,
        argonsMinted,
        qtyOfArgonsToBurn,
        costOfArgonsToBurn,
        btcTransactionFee,
        argonTransactionFee,
        cashChange,
        totalCashUnlocked,
      } = currentVaultAction || {};

      const totalAccruedValue = currentVaultAction?.totalAccruedValue || lastVaultAction.totalAccruedValue + Math.max(0, btcPriceDiffSinceLastVault);

      records.push({
        date,
        btcPrice: price,
        btcChangeSinceLastVault,
        btcTransactionFee,
        argonTransactionFee,
        actionType: type,
        argonsMinted,
        qtyOfArgonsToBurn,
        costOfArgonsToBurn,
        cashChange: cashChange || 0,
        totalCashUnlocked: totalCashUnlocked || lastVaultAction.totalCashUnlocked,
        totalAccruedValue,
        vaulterReturn: (totalAccruedValue - startingPrice) / startingPrice,
        hodlerReturn: (price - startingPrice) / startingPrice,
      });

      lastVaultAction = currentVaultAction ? currentVaultAction : lastVaultAction;
    }

    return records;
  }

  generateCSV(data: any[]) {
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