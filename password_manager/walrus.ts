const WALRUS_BASE_URL = "http://localhost:3000";

export async function storeEncryptedRepo(
  userAddress: string,
  orderId: string,
  encryptedData: string
) {
  const res = await fetch(`${WALRUS_BASE_URL}/store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userAddress, orderId, encryptedData }),
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
