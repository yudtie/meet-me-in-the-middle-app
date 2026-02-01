export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-[#d0d0d0] py-3 px-4 z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <p className="text-[#6b7c87]">
          © {new Date().getFullYear()} Meet Me in the Middle
        </p>
        <div className="flex items-center gap-4">
          <a 
            href="/privacy" 
            className="text-[#6b7c87] hover:text-[#8bc34a] transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="mailto:support@markyudt.com?subject=Issue Report" 
            className="text-[#8bc34a] hover:text-[#7cb342] font-medium inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Issue
          </a>
        </div>
      </div>
    </footer>
  );
}