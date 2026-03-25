import { FileText, Mail, Send } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12 border-t border-gray-800/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/gox.svg" alt="GOX" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                GOX
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">Let Gold flow freely</p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://x.com/GoxDex"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800/50 hover:bg-yellow-500/10 border border-gray-700/50 hover:border-yellow-500/50 flex items-center justify-center transition-all group"
                aria-label="X"
              >
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <title>X (Twitter)</title>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://t.me/goxtop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800/50 hover:bg-yellow-500/10 border border-gray-700/50 hover:border-yellow-500/50 flex items-center justify-center transition-all group"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
              </a>
              <a
                href="https://medium.com/@gox_top"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800/50 hover:bg-yellow-500/10 border border-gray-700/50 hover:border-yellow-500/50 flex items-center justify-center transition-all group"
                aria-label="Medium"
              >
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
              </a>
              <a
                href="mailto:x@gox.top"
                className="w-9 h-9 rounded-lg bg-gray-800/50 hover:bg-yellow-500/10 border border-gray-700/50 hover:border-yellow-500/50 flex items-center justify-center transition-all group"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-4 text-white">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/swap"
                  className="text-gray-400 hover:text-yellow-400 transition-colors inline-block"
                >
                  Trade
                </a>
              </li>
              <li>
                <a
                  href="/explore"
                  className="text-gray-400 hover:text-yellow-400 transition-colors inline-block"
                >
                  Explore
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-4 text-white">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-yellow-400 transition-colors inline-block"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-yellow-400 transition-colors inline-block"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-4 text-white">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/help"
                  className="text-gray-400 hover:text-yellow-400 transition-colors inline-block"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-yellow-400 transition-colors inline-block"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 mt-12 pt-6 text-center">
          <p className="text-sm text-gray-500">&copy; 2025 GOX.AI All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
