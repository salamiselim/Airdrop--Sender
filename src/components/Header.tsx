import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaGithub } from 'react-icons/fa';
import Image from 'next/image';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200">
      {/* Left side - Title and GitHub icon */}
      <div className="flex items-center space-x-4">
        {/* If you have a logo image */}
        {/* <Image src="/logo.png" alt="TSender" width={40} height={40} /> */}
        
        <h1 className="text-xl font-bold">TSender</h1>
        
        {/* GitHub link moved to left side */}
        <a 
          href="https://github.com/salamiselim/Tsender" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="GitHub Repository"
        >
          <FaGithub size={24} />
        </a>
      </div>

      {/* Right side - ConnectButton only */}
      <div>
        <ConnectButton />
      </div>
    </header>
  );
}