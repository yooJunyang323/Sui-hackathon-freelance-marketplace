const WALRUS_BASE_URL = "http://localhost:3000";


// export async function storeEncryptedRepo(userAddress: string, encryptedRepo: string) {
//   // POST encrypted repo for the user address
//   const res = await fetch(`${WALRUS_BASE_URL}/store`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ userAddress, encryptedRepo }),
//   });
//   if (!res.ok) throw new Error("Failed to store encrypted repo");
//   return await res.json();
// }

// export async function fetchEncryptedRepo(userAddress: string): Promise<string | null> {
//   // GET encrypted repo for user address
//   const res = await fetch(`${WALRUS_BASE_URL}/repo?userAddress=${userAddress}`);
//   if (!res.ok) throw new Error("Failed to fetch encrypted repo");
//   const data = await res.json();
//   return data.encryptedRepo || null;
// }


export async function storeEncryptedRepo(
  userAddress: string,
  orderId: string,
  encryptedData: string
) {
  const res = await fetch(`${WALRUS_BASE_URL}/store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userAddress, orderId, encryptedRepo: encryptedData, encryptedCommit: encryptedData }),
    // But this sends duplicate encryptedData as both encryptedRepo and encryptedCommit
    // We should send only one field now, so modify server API accordingly.
  });
  if (!res.ok) throw new Error("Failed to store encrypted repo");
  return await res.json();
}

export async function fetchEncryptedRepo(
  userAddress: string,
  orderId: string
): Promise<string | null> {
  const res = await fetch(
    `${WALRUS_BASE_URL}/repo?userAddress=${userAddress}&orderId=${orderId}`
  );
  if (!res.ok) throw new Error("Failed to fetch encrypted repo");
  const data = await res.json();
  return data.encryptedData || null;
}
