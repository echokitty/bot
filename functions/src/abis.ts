export const authorizationRegistry = [
  "function addressesManagedBy(address) view returns (address[])",
];

export const subwallet = ["function getTarget() view returns (address)"];

export const wallet = [
  "function listSubwallets() view returns (address[])",
  "function getPredictedSubwalletAddress(bytes32,address) view returns (address)",
];
