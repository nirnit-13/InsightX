import { Component } from 'react'
import { RiErrorWarningLine, RiRefreshLine } from 'react-icons/ri'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[InsightX ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center p-6 dark:bg-surface-dark-bg bg-surface-light-bg">
        <div className="glass rounded-2xl p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <RiErrorWarningLine className="text-3xl text-red-500" />
          </div>
          <h2 className="font-display font-bold text-lg dark:text-slate-100 text-slate-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm dark:text-slate-400 text-slate-500 mb-2">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p className="text-xs font-mono dark:text-slate-600 text-slate-400 mb-6">
            The error has been logged. Try refreshing the page.
          </p>
          <button onClick={() => window.location.reload()}
            className="btn-primary flex items-center gap-2 mx-auto text-sm px-6 py-2.5">
            <RiRefreshLine /> Reload Page
          </button>
        </div>
      </div>
    )
  }
}