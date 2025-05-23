import SearchBox from './SearchBox'; // Assuming SearchBox.tsx is in the same directory

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ borderTop: '1px solid #eaeaea', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
        {/* Column 1: Archives */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Archives</h3>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            Yearly and monthly archives will be displayed here.
          </p>
        </div>

        {/* Column 2: Categories */}
        <div style={{ flex: 1, marginLeft: '1rem', marginRight: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Categories</h3>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            Categories will be listed here.
          </p>
        </div>

        {/* Column 3: Search */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Search</h3>
          <SearchBox />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#777' }}>
        © {currentYear} 西田明正のブログ
      </div>
    </footer>
  );
};

export default Footer;
