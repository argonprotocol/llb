import { useBasicStore } from '../stores/basic';

const API_BASE_URL = 'http://localhost:3000';

export type IStageName = 'bitcoinPrices' | 'vaultingRatchets';

export default class API {
  static async fetchSimulationData(stage: IStageName, data: any) {
    const dataToSend = JSON.stringify(data || {});
    const response = await fetch(`${API_BASE_URL}/fetch/${stage}`, {
      method: 'POST', // Specify the method as POST
      headers: {
        'Content-Type': 'application/json' // Set the content type to JSON
      },
      body: dataToSend // Include the data in the body of the request
    });

    const responseData = await response.json();
    useBasicStore().saveSimulationData(stage, responseData);
    return responseData;
  }
}
