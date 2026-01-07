import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';

// Inline SVG Icons
const Icons = {
  Instagram: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Loader: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  )
};

// Icon for the tab
const AppsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

// Apps Section Tab
export const AppsSectionTab = (props) => (
  <SectionTab name="Apps" {...props}>
    <div className="flex justify-center items-center">
      <AppsIcon />
    </div>

  </SectionTab>
);

// App tile button component
const AppTile = ({ icon, label, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: '#1e1e1e',
      border: '1px solid #333',
      borderRadius: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      opacity: disabled ? 0.5 : 1
    }}
  >
    <div style={{ marginBottom: '8px' }}>
      {icon}
    </div>
    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
      {label}
    </span>
  </button>
);

// Mock Instagram photos for demo
const MOCK_INSTAGRAM_PHOTOS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',
  'https://images.unsplash.com/photo-1529139574466-a302d27f60d0?w=300&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
];

// Instagram Button with Modal
const InstagramIntegration = ({ store }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(true);
    }, 1000);
  };

  const handleSelectImage = (url) => {
    const page = store.activePage;
    if (page) {
      page.addElement({
        type: 'image',
        x: 50,
        y: 100,
        width: 300,
        height: 300,
        src: url,
      });
    }
    setShowModal(false);
  };

  return (
    <>
      <AppTile
        label="Instagram"
        icon={
          isLoading ? (
            <Icons.Loader />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Icons.Instagram />
            </div>
          )
        }
        onClick={handleLogin}
        disabled={isLoading}
      />

      {/* Instagram Media Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '14px' }}>
                <span style={{ color: '#e91e63' }}><Icons.Instagram /></span>
                Select Media
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <Icons.X />
              </button>
            </div>

            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {MOCK_INSTAGRAM_PHOTOS.map((url, i) => (
                <div key={i} onClick={() => handleSelectImage(url)} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            <div style={{ padding: '8px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
              Connected as @arunkumar_dev
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Apps Section Panel
export const AppsSectionPanel = observer(({ store }) => {
  return (
    <div style={{ padding: '16px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      
      <p style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' }}>
        Integrations
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {/* Canva */}
        <AppTile
          label="Canva"
          icon={
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00C4CC, #7D2AE8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(125, 42, 232, 0.3)'
            }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontStyle: 'italic', fontSize: '14px' }}>C</span>
            </div>
          }
          onClick={() => alert('Canva integration requires API key')}
        />

        {/* Instagram */}
        <InstagramIntegration store={store} />

        {/* GIPHY */}
        <AppTile
          label="GIPHY"
          icon={
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#00ff99', textShadow: '1px 1px 0 #fff, -1px -1px 0 #fff' }}>
              GIPHY
            </div>
          }
          onClick={() => alert('GIPHY integration coming soon!')}
        />

        {/* TikTok */}
        <AppTile
          label="TikTok"
          icon={
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>♪</span>
            </div>
          }
          onClick={() => alert('TikTok integration coming soon!')}
        />
      </div>
    </div>
  );
});

// Export the complete section
/* eslint-disable react-refresh/only-export-components */
export const AppsSection = {
  name: 'apps',
  Tab: AppsSectionTab,
  Panel: AppsSectionPanel,
};
