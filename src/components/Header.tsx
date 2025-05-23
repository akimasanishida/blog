import Link from 'next/link';

const Header = () => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eaeaea' }}>
      <div>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1.5rem' }}>
          西田明正のブログ
        </Link>
      </div>
      <nav>
        <ul style={{ listStyle: 'none', display: 'flex', margin: 0, padding: 0 }}>
          <li style={{ marginRight: '1rem' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Home
            </Link>
          </li>
          <li style={{ marginRight: '1rem' }}>
            <Link href="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
              About
            </Link>
          </li>
          <li>
            <a href="https://akimasanishida.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              HP
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
