import ChartController from "../controllers/ChartController";

export default async function fetchBitcoinPrices(req: Request) {
  const chartController = new ChartController();

  return await chartController.fetchBitcoinPrices();
}
