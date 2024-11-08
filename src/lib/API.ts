export type IStageName = 'bitcoinPrices' | 'bitcoinFeesPerTransaction';

export default class API {
  static async fetchSimulationData(stage: IStageName) {
    const response = await fetch(`/data/${stage}.json`, {
      method: 'GET', // Specify the method as POST
      headers: {
        'Content-Type': 'application/json' // Set the content type to JSON
      },
      // body: dataToSend // Include the data in the body of the request
    });

    return await response.json();
  }
}
