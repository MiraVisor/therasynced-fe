// Extend Window interface to include AOS
interface Window {
  AOS?: {
    refresh: () => void;
    init: (options?: any) => void;
  };
}
