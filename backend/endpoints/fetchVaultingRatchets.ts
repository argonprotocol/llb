import ChartController from "../controllers/ChartController";

export default async function fetchVaultingRatchets(req: Request) {
  const chartController = new ChartController();

  const body = await req.json();

  return await chartController.fetchVaultingRatchets(body.rules);
}
