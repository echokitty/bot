export const authorizationRegistry = [
  "function addressesManagedBy(address) view returns (address[])",
];

export const subwallet = [
  "function target() view returns (address)",
  "function executeSwap(((address,bytes,uint256),address))",
];

export const wallet = [
  "function listSubwallets() view returns (address[])",
  "function getPredictedSubwalletAddress(bytes32,address) view returns (address)",
];

export const erc20 = ["function balanceOf(address) view returns (uint256)"];
