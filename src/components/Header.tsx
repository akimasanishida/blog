import Link from 'next/link';
import { ModeToggle } from './ModeToggle';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 border-b border-border">
      <div>
        <Link href="/" className="text-2xl text-foreground link-no-underline font-bold">
          西田明正のブログ
        </Link>
      </div>
      <nav>
        <ul className="list-none flex m-0 p-0 items-center">
          <li className="mr-4">
            <ModeToggle />
          </li>
          <li className="mr-4">
            <Link href="/" className="text-foreground link-no-underline">
              Home
            </Link>
          </li>
          <li className="mr-4">
            <Link href="/about" className="text-foreground link-no-underline">
              About
            </Link>
          </li>
          <li>
            <a href="https://akimasanishida.com" target="_blank" rel="noopener noreferrer" className="text-foreground link-no-underline">
              HP
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
