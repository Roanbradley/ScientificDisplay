export default function Home() {
  return (
    <div className="min-h-screen p-8 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a2f51 0%, #0d5a8c 50%, #1a7fa0 100%)' }}>
      <div className="poster-container" style={{ maxWidth: '1200px', width: '100%' }}>
        {/* Header */}
        <div className="header-section" style={{ background: 'linear-gradient(135deg, #0d4a7a 0%, #0f6fa0 100%)' }}>
          <h1 className="title" style={{ marginTop: '2rem' }}>
            Your Title Here
          </h1>
          <div className="authors" style={{ marginBottom: '2rem' }}>
            <strong>Authors</strong>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', padding: '2rem' }}>
          {/* Section 1 */}
          <div className="section" style={{ borderLeft: '4px solid #20b2aa', padding: '1.5rem', background: 'rgba(32, 178, 170, 0.05)', borderRadius: '8px' }}>
            <div className="section-title" style={{ fontSize: '1.4rem', color: '#0d4a7a', marginBottom: '1rem' }}>
              Section One
            </div>
            <div style={{ height: '200px', background: 'linear-gradient(135deg, rgba(32, 178, 170, 0.2), rgba(13, 74, 122, 0.2))', borderRadius: '8px' }}></div>
          </div>

          {/* Section 2 */}
          <div className="section" style={{ borderLeft: '4px solid #ff6b6b', padding: '1.5rem', background: 'rgba(255, 107, 107, 0.05)', borderRadius: '8px' }}>
            <div className="section-title" style={{ fontSize: '1.4rem', color: '#0d4a7a', marginBottom: '1rem' }}>
              Section Two
            </div>
            <div style={{ height: '200px', background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(13, 74, 122, 0.2))', borderRadius: '8px' }}></div>
          </div>

          {/* Section 3 */}
          <div className="section" style={{ borderLeft: '4px solid #52d3d3', padding: '1.5rem', background: 'rgba(82, 211, 211, 0.05)', borderRadius: '8px' }}>
            <div className="section-title" style={{ fontSize: '1.4rem', color: '#0d4a7a', marginBottom: '1rem' }}>
              Section Three
            </div>
            <div style={{ height: '200px', background: 'linear-gradient(135deg, rgba(82, 211, 211, 0.2), rgba(13, 74, 122, 0.2))', borderRadius: '8px' }}></div>
          </div>

          {/* Section 4 */}
          <div className="section" style={{ borderLeft: '4px solid #ffd93d', padding: '1.5rem', background: 'rgba(255, 217, 61, 0.05)', borderRadius: '8px' }}>
            <div className="section-title" style={{ fontSize: '1.4rem', color: '#0d4a7a', marginBottom: '1rem' }}>
              Section Four
            </div>
            <div style={{ height: '200px', background: 'linear-gradient(135deg, rgba(255, 217, 61, 0.2), rgba(13, 74, 122, 0.2))', borderRadius: '8px' }}></div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: 'linear-gradient(135deg, rgba(32, 178, 170, 0.1), rgba(52, 211, 211, 0.1))', padding: '2rem', borderTop: '2px solid #20b2aa', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', fontSize: '0.9rem' }}>
          <div style={{ textAlign: 'center', color: '#0d4a7a' }}>
            <strong>Contact</strong>
          </div>
          <div style={{ textAlign: 'center', color: '#0d4a7a' }}>
            <strong>References</strong>
          </div>
          <div style={{ textAlign: 'center', color: '#0d4a7a' }}>
            <strong>Info</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
