interface ErrorBannerProps {
  message: string;
  /** Shows a Retry button when given. */
  onRetry?: () => void;
}

/** Small inline error message, e.g. "Can't reach the server", with an optional Retry. */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="banner banner--danger" role="alert">
      <span className="banner-message">{message}</span>
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
