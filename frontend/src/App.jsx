import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import './App.css'

const emptyAccount = {
  accountNumber: '',
  customerName: '',
  email: '',
  phone: '',
  accountType: 'SAVINGS',
  initialBalance: '',
  status: 'ACTIVE',
}

function formatMoney(value) {
  const number = Number(value || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number)
}

function getAccountValue(account, ...keys) {
  return keys.map((key) => account?.[key]).find((value) => value !== undefined && value !== null) ?? ''
}

function normalizeAccount(account) {
  return {
    ...account,
    id: getAccountValue(account, 'id', 'accountId'),
    accountNumber: getAccountValue(account, 'accountNumber', 'number'),
    customerName: getAccountValue(account, 'customerName', 'name'),
    accountType: getAccountValue(account, 'accountType', 'type'),
    balance: getAccountValue(account, 'balance', 'currentBalance'),
    status: String(
      getAccountValue(account, 'status', 'accountStatus') || 'ACTIVE'
    ).toUpperCase(),
  }
}

function Icon({ children }) {
  return <span className="icon" aria-hidden="true">{children}</span>
}

function Login({ onLogin, error }) {
  const [form, setForm] = useState({ username: '', password: '' })

  const submit = (event) => {
    event.preventDefault()
    onLogin(form)
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-mark">B</div>
          <div>
            <strong>Bankify</strong>
            <span>Bank Account Management</span>
          </div>
        </div>

        <div className="login-heading">
          <p className="eyebrow">Secure access</p>
          <h1>Welcome to Bankify</h1>
          <p>Manage customer accounts, balances and banking transactions from one place.</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            Username
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button login-button" type="submit">
            Sign in
          </button>
        </form>

        <p className="secure-note">
          <Icon>✓</Icon> Secure session-based access
        </p>
      </section>
    </main>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Bankify</p>
            <h2>{title}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AccountForm({ initial = emptyAccount, onSubmit, buttonText, onClose }) {
  const [form, setForm] = useState({ ...emptyAccount, ...initial })

  const change = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }}
    >
      {initial.id === undefined && (
        <label>
          Account number
          <input
            required
            value={form.accountNumber}
            onChange={(e) => change('accountNumber', e.target.value)}
            placeholder="e.g. ACC1003"
          />
        </label>
      )}

      <div className="form-grid">
        <label>
          Customer name
          <input
            required
            value={form.customerName}
            onChange={(e) => change('customerName', e.target.value)}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => change('email', e.target.value)}
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Phone
          <input
            required
            value={form.phone}
            onChange={(e) => change('phone', e.target.value)}
          />
        </label>

        <label>
          Account type
          <select
            value={form.accountType}
            onChange={(e) => change('accountType', e.target.value)}
          >
            <option value="SAVINGS">Savings</option>
            <option value="CURRENT">Current</option>
            <option value="CHECKING">Checking</option>
          </select>
        </label>
      </div>

      {initial.id === undefined && (
        <label>
          Initial balance
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.initialBalance}
            onChange={(e) => change('initialBalance', e.target.value)}
            placeholder="0.00"
          />
        </label>
      )}

      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="primary-button">
          {buttonText}
        </button>
      </div>
    </form>
  )
}

function MoneyForm({ action, account, onSubmit, onClose }) {
  const [amount, setAmount] = useState('')

  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(amount)
      }}
    >
      <div className="money-account-info">
        <span>{account.customerName}</span>
        <strong>{account.accountNumber}</strong>
        <small>Current balance: {formatMoney(account.balance)}</small>
      </div>

      <label>
        Amount
        <input
          autoFocus
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </label>

      <div className="modal-actions">
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Confirm {action}
        </button>
      </div>
    </form>
  )
}

function BalanceModal({ account, credentials, onClose }) {
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .balance(account.id, credentials)
      .then(setBalance)
      .catch((err) => setError(err.message))
  }, [account.id, credentials])

  return (
    <Modal title="Current balance" onClose={onClose}>
      <div className="balance-result">
        <span>{account.accountNumber}</span>
        <strong>
          {error
            ? error
            : balance === null
              ? 'Loading...'
              : formatMoney(balance?.balance ?? balance)}
        </strong>
        <p>{account.customerName}</p>
      </div>
    </Modal>
  )
}

function AccountsView({
  accounts,
  allAccounts,
  search,
  setSearch,
  onSearch,
  loading,
  onOpen,
  onEdit,
  onMoney,
  onCloseAccount,
  onBalance,
  onTransactions,
}) {
  return (
    <section className="view-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Customer portfolio</p>
          <h2>Accounts</h2>
          <p>Open, update, manage and review customer bank accounts.</p>
        </div>
        <button className="primary-button" onClick={onOpen}>
          + Open account
        </button>
      </div>

      <div className="search-panel">
        <div className="search-input">
          <span>⌕</span>
          <input
            value={search.value}
            onChange={(e) =>
              setSearch({ ...search, value: e.target.value })
            }
            placeholder="Search accounts"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch()
            }}
          />
        </div>

        <select
          value={search.kind}
          onChange={(e) => setSearch({ ...search, kind: e.target.value })}
        >
          <option value="all">All fields</option>
          <option value="customerName">Customer</option>
          <option value="accountType">Account type</option>
          <option value="status">Status</option>
          <option value="above-balance">Balance above</option>
          <option value="below-balance">Balance below</option>
        </select>

        <button className="search-button" onClick={onSearch}>
          Search
        </button>

        <span className="result-count">
          {accounts.length} of {allAccounts.length} accounts
        </span>
      </div>

      <div className="table-card">
        {loading ? (
          <p className="empty-state">Loading accounts...</p>
        ) : accounts.length ? (
          <div className="account-table">
            <div className="table-header">
              <span>Customer</span>
              <span>Account number</span>
              <span>Type</span>
              <span>Balance</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {accounts.map((account) => (
              <div className="table-row" key={account.id || account.accountNumber}>
                <div className="customer-cell">
                  <div className="customer-avatar">
                    {account.customerName?.slice(0, 1).toUpperCase() || '?'}
                  </div>
                  <div>
                    <strong>{account.customerName || 'Unnamed customer'}</strong>
                    <span>{account.email || ''}</span>
                  </div>
                </div>

                <span className="account-number">{account.accountNumber}</span>
                <span>{account.accountType}</span>
                <strong>{formatMoney(account.balance)}</strong>

                <span className={`status ${account.status.toLowerCase()}`}>
                  {account.status}
                </span>

                <div className="row-actions">
                  <button onClick={() => onBalance(account)} title="Check balance">
                    $
                  </button>
                  <button onClick={() => onTransactions(account)} title="Transactions">
                    ≡
                  </button>
                  <button onClick={() => onEdit(account)} title="Edit account">
                    ✎
                  </button>
                  <button
                    disabled={account.status === 'CLOSED'}
                    onClick={() => onMoney('deposit', account)}
                    title="Deposit"
                  >
                    +
                  </button>
                  <button
                    disabled={account.status === 'CLOSED'}
                    onClick={() => onMoney('withdraw', account)}
                    title="Withdraw"
                  >
                    −
                  </button>
                  <button
                    disabled={account.status === 'CLOSED'}
                    onClick={() => onCloseAccount(account)}
                    title="Close account"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No accounts match your search.</p>
        )}
      </div>
    </section>
  )
}

function TransferView({ accounts, onTransfer }) {
  const [form, setForm] = useState({
    fromId: '',
    toId: '',
    amount: '',
  })

  const available = accounts.filter((account) => account.status !== 'CLOSED')

  return (
    <section className="transfer-section">
      <div className="transfer-intro">
        <p className="eyebrow">Banking operation</p>
        <h2>Transfer between accounts</h2>
        <p>
          Transfer funds securely from one active account to another managed
          account.
        </p>
      </div>

      <form
        className="transfer-card"
        onSubmit={(e) => {
          e.preventDefault()
          onTransfer(form)
        }}
      >
        <div className="transfer-field">
          <label>
            From account
            <select
              required
              value={form.fromId}
              onChange={(e) =>
                setForm({ ...form, fromId: e.target.value })
              }
            >
              <option value="">Select source account</option>
              {available.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} · {a.customerName} ({formatMoney(a.balance)})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="transfer-direction">↓</div>

        <div className="transfer-field">
          <label>
            To account
            <select
              required
              value={form.toId}
              onChange={(e) =>
                setForm({ ...form, toId: e.target.value })
              }
            >
              <option value="">Select destination account</option>
              {available.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} · {a.customerName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="transfer-field">
          <label>
            Amount
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              placeholder="0.00"
            />
          </label>
        </div>

        <button className="primary-button transfer-button" type="submit">
          Review transfer →
        </button>
      </form>
    </section>
  )
}

function App() {
  const [credentials, setCredentials] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('bankifyCredentials'))
    } catch {
      return null
    }
  })

  const [loginError, setLoginError] = useState('')
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [activeView, setActiveView] = useState('Overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState({ kind: 'all', value: '' })

  const loadAccounts = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await api.getAccounts(credentials)
      setAccounts((result || []).map(normalizeAccount))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (credentials) loadAccounts()
  }, [credentials])

  const totals = useMemo(
    () => ({
      total: accounts.length,
      active: accounts.filter((a) => a.status === 'ACTIVE').length,
      closed: accounts.filter((a) => a.status === 'CLOSED').length,
      balance: accounts.reduce(
        (sum, a) => sum + Number(a.balance || 0),
        0
      ),
    }),
    [accounts]
  )

  const performSearch = async () => {
    if (search.kind === 'all' || !search.value) {
      await loadAccounts()
      return
    }

    setLoading(true)
    setError('')

    const kindMap = {
      customerName: 'customer',
      accountType: 'type',
      status: 'status',
      'above-balance': 'above-balance',
      'below-balance': 'below-balance',
    }

    try {
      const result = await api.search(
        kindMap[search.kind] || search.kind,
        search.value,
        credentials
      )
      setAccounts((result || []).map(normalizeAccount))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const login = async (nextCredentials) => {
    setLoginError('')

    try {
      const result = await api.getAccounts(nextCredentials)
      setCredentials(nextCredentials)
      sessionStorage.setItem(
        'bankifyCredentials',
        JSON.stringify(nextCredentials)
      )
      setAccounts((result || []).map(normalizeAccount))
    } catch (err) {
      setLoginError(err.message)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('bankifyCredentials')
    setCredentials(null)
    setAccounts([])
  }

  const closeModal = () => setModal(null)

  const runAction = async (action, successMessage) => {
    try {
      await action()
      closeModal()
      setNotice(successMessage)
      await loadAccounts()
      setTimeout(() => setNotice(''), 3500)
    } catch (err) {
      setError(err.message)
    }
  }

  const openAccount = (form) =>
    runAction(
      () => api.createAccount(form, credentials),
      'Account opened successfully.'
    )

  const updateAccount = (form) =>
    runAction(
      () =>
        api.updateAccount(
          form.id,
          {
            customerName: form.customerName,
            email: form.email,
            phone: form.phone,
            accountType: form.accountType,
          },
          credentials
        ),
      'Account details updated.'
    )

  const moneyAction = (type, account) =>
    setModal({ type: 'money', action: type, account })

  const viewTransactions = async (account) => {
    try {
      const result = await api.transactions(
        account.accountNumber,
        credentials
      )

      setTransactions(
        (result || []).map((item) => ({
          ...item,
          type: item.type || item.transactionType,
          date: item.date || item.transactionDate,
          balanceAfter: item.balanceAfter ?? item.balance,
        }))
      )

      setModal({ type: 'transactions', account })
    } catch (err) {
      setError(err.message)
    }
  }

  if (!credentials) {
    return <Login onLogin={login} error={loginError} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">B</div>
          <div>
            <strong>Bankify</strong>
            <span>Personal banking</span>
          </div>
        </div>

        <p className="sidebar-section-title">MAIN MENU</p>

        <nav>
          <button
            className={activeView === 'Overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveView('Overview')}
          >
            <Icon>⌂</Icon>
            Dashboard
          </button>

          <button
            className={activeView === 'Accounts' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveView('Accounts')}
          >
            <Icon>▣</Icon>
            Accounts
          </button>

          <button
            className={activeView === 'Transfer' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveView('Transfer')}
          >
            <Icon>↗</Icon>
            Transfer
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-info">
            <span>Bankify</span>
            <strong>Simple account management for everyday banking.</strong>
          </div>

          <button className="nav-item logout-item" onClick={logout}>
            <Icon>↪</Icon>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Bankify <span>/</span> {activeView}
            </p>
            <h1>
              {activeView === 'Overview' ? 'Dashboard' : activeView}
            </h1>
          </div>

          <div className="user-area">
            <div className="user-avatar">
              {credentials.username?.slice(0, 1).toUpperCase()}
            </div>

            <div className="user-details">
              <strong>{credentials.username}</strong>
              <span>Account manager</span>
            </div>

            <button className="user-menu-button" onClick={logout} title="Log out">
              •••
            </button>
          </div>
        </header>

        {error && (
          <div className="alert error-alert">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {notice && (
          <div className="alert success-alert">
            <span>{notice}</span>
            <button onClick={() => setNotice('')}>×</button>
          </div>
        )}

        {activeView === 'Overview' && (
          <section className="dashboard">
            <div className="welcome-row">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>Welcome to Bankify</h2>
                <p>Manage your accounts and banking operations from one place.</p>
              </div>

              <button
                className="primary-button"
                onClick={() => setModal({ type: 'open' })}
              >
                + Open account
              </button>
            </div>

            <div className="balance-card">
              <div className="balance-main">
                <span className="balance-label">Total balance</span>
                <strong>{formatMoney(totals.balance)}</strong>
                <span className="balance-description">
                  Combined balance across all managed accounts
                </span>
              </div>

              <div className="balance-side">
                <span className="balance-status">
                  <i /> All accounts
                </span>
                <button onClick={() => setActiveView('Accounts')}>
                  View accounts →
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <Stat label="Total accounts" value={totals.total} icon="▣" />
              <Stat
                label="Active accounts"
                value={totals.active}
                icon="✓"
                accent="green"
              />
              <Stat
                label="Closed accounts"
                value={totals.closed}
                icon="—"
                accent="red"
              />
              <Stat
                label="Average balance"
                value={formatMoney(
                  totals.total ? totals.balance / totals.total : 0
                )}
                icon="₹"
              />
            </div>

            <div className="services-section">
              <div className="section-title-row">
                <p className="eyebrow">Banking services</p>
                <h2>What would you like to do?</h2>
              </div>

              <div className="service-grid">
                <button
                  className="service-card"
                  onClick={() => setModal({ type: 'open' })}
                >
                  <span className="service-icon">+</span>
                  <div>
                    <strong>Open an account</strong>
                    <span>Create a new customer bank account</span>
                  </div>
                  <span className="service-arrow">→</span>
                </button>

                <button
                  className="service-card"
                  onClick={() => setActiveView('Accounts')}
                >
                  <span className="service-icon">▣</span>
                  <div>
                    <strong>Manage accounts</strong>
                    <span>View, update and manage accounts</span>
                  </div>
                  <span className="service-arrow">→</span>
                </button>

                <button
                  className="service-card"
                  onClick={() => setActiveView('Transfer')}
                >
                  <span className="service-icon">↗</span>
                  <div>
                    <strong>Transfer money</strong>
                    <span>Move funds between active accounts</span>
                  </div>
                  <span className="service-arrow">→</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {activeView === 'Accounts' && (
          <AccountsView
            accounts={accounts}
            allAccounts={accounts}
            search={search}
            setSearch={setSearch}
            onSearch={performSearch}
            loading={loading}
            onOpen={() => setModal({ type: 'open' })}
            onEdit={(account) => setModal({ type: 'edit', account })}
            onMoney={moneyAction}
            onCloseAccount={(account) =>
              setModal({ type: 'close', account })
            }
            onBalance={(account) =>
              setModal({ type: 'balance', account })
            }
            onTransactions={viewTransactions}
          />
        )}

        {activeView === 'Transfer' && (
          <TransferView
            accounts={accounts}
            onTransfer={(form) =>
              runAction(
                () =>
                  api.transfer(
                    form.fromId,
                    form.toId,
                    form.amount,
                    credentials
                  ),
                'Transfer completed successfully.'
              )
            }
          />
        )}
      </main>

      {modal?.type === 'open' && (
        <Modal title="Open account" onClose={closeModal}>
          <AccountForm
            onSubmit={openAccount}
            buttonText="Open account"
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Update account" onClose={closeModal}>
          <AccountForm
            initial={modal.account}
            onSubmit={updateAccount}
            buttonText="Save changes"
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal?.type === 'money' && (
        <Modal
          title={
            modal.action === 'deposit'
              ? 'Deposit to account'
              : 'Withdraw from account'
          }
          onClose={closeModal}
        >
          <MoneyForm
            action={modal.action}
            account={modal.account}
            onSubmit={(amount) =>
              runAction(
                () =>
                  modal.action === 'deposit'
                    ? api.deposit(modal.account.id, amount, credentials)
                    : api.withdraw(
                        modal.account.id,
                        amount,
                        credentials
                      ),
                modal.action === 'deposit'
                  ? 'Deposit completed successfully.'
                  : 'Withdrawal completed successfully.'
              )
            }
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal?.type === 'close' && (
        <Modal title="Close account" onClose={closeModal}>
          <div className="confirm-content">
            <p>
              Are you sure you want to close account{' '}
              <strong>{modal.account.accountNumber}</strong>?
            </p>

            <div className="modal-actions">
              <button className="secondary-button" onClick={closeModal}>
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={() =>
                  runAction(
                    () =>
                      api.closeAccount(
                        modal.account.id,
                        credentials
                      ),
                    'Account closed successfully.'
                  )
                }
              >
                Close account
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'balance' && (
        <BalanceModal
          account={modal.account}
          credentials={credentials}
          onClose={closeModal}
        />
      )}

      {modal?.type === 'transactions' && (
        <Modal title="Transaction history" onClose={closeModal}>
          <p className="modal-subtitle">
            Account {modal.account.accountNumber}
          </p>

          <div className="transaction-list">
            {transactions.length ? (
              transactions.map((transaction, index) => (
                <div
                  className="transaction-row"
                  key={transaction.id || index}
                >
                  <div>
                    <strong>{transaction.type || 'Transaction'}</strong>
                    <span>{transaction.date || 'Date unavailable'}</span>
                  </div>

                  <strong>{formatMoney(transaction.amount)}</strong>

                  <span>
                    Balance: {formatMoney(transaction.balanceAfter)}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-state">
                No transactions found for this account.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

function Stat({ label, value, icon, accent = '' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent}`}>{icon}</div>

      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <span className="stat-arrow">↗</span>
    </div>
  )
}

export default App
