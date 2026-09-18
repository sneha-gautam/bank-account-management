const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request(path, options = {}, credentials) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
      ...(options.headers || {}),
    },
  })

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message = response.status === 401
      ? 'Your username or password is incorrect.'
      : response.status === 404
        ? 'The requested account was not found.'
        : data?.message || data?.error || `Request failed (${response.status}).`
    throw new Error(message)
  }

  return data
}

const json = (method, body) => ({ method, body: JSON.stringify(body) })

export const api = {
  getAccounts: (credentials) => request('/api/accounts', {}, credentials),
  createAccount: (account, credentials) => request('/api/accounts', json('POST', account), credentials),
  updateAccount: (id, account, credentials) => request(`/api/accounts/${id}`, json('PUT', account), credentials),
  closeAccount: (id, credentials) => request(`/api/accounts/${id}/close`, { method: 'PUT' }, credentials),
  deposit: (id, amount, credentials) => request(`/api/accounts/${id}/deposit?amount=${encodeURIComponent(amount)}`, { method: 'POST' }, credentials),
  withdraw: (id, amount, credentials) => request(`/api/accounts/${id}/withdraw?amount=${encodeURIComponent(amount)}`, { method: 'POST' }, credentials),
  balance: (id, credentials) => request(`/api/accounts/${id}/balance`, {}, credentials),
  transfer: (fromId, toId, amount, credentials) => request(`/api/accounts/transfer?fromId=${encodeURIComponent(fromId)}&toId=${encodeURIComponent(toId)}&amount=${encodeURIComponent(amount)}`, { method: 'POST' }, credentials),
  transactions: (accountNumber, credentials) => request(`/api/transactions/account/${encodeURIComponent(accountNumber)}`, {}, credentials),
  search: (kind, value, credentials) => request(`/api/accounts/search/${kind}?${kind === 'customer' ? 'name' : kind === 'above-balance' || kind === 'below-balance' ? 'amount' : kind}=${encodeURIComponent(value)}`, {}, credentials),
}
