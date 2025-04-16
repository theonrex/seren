import { client } from "./suiClient";

export const getSuiBalance = async (address: string): Promise<string> => {
  try {
    const res = await client.getBalance({ owner: address });
    const sui = (Number(res.totalBalance) / 1e9).toFixed(4); // Convert mist to SUI
    return sui;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};
