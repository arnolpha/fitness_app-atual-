import { Component, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h1 className="text-white font-black text-2xl mb-2">Algo deu errado</h1>
          <p className="text-white/40 text-sm mb-8 max-w-xs">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          {this.state.error && (
            <p className="text-white/20 text-xs font-mono mb-6 max-w-xs break-all">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-xl transition-all"
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}