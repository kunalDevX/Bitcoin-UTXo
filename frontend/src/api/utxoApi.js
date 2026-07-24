import api from './apiClient';

export const submitAddress = (address) =>
    api.post('/address', { address });

export const fetchUtxos = (address) =>
    api.get(`/utxos/${address}`);

export const fetchAnalysis = (address) =>
    api.get(`/analysis/${address}`);

export const fetchFees = (inputs = 1, outputs = 2) =>
    api.get(`/fee?inputs=${inputs}&outputs=${outputs}`);

export const optimizeUtxos = (address, targetBTC) =>
    api.post('/optimize', { address, targetBTC });
