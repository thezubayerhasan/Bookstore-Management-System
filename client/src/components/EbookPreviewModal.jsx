import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen, Lock } from 'lucide-react';

export const EbookPreviewModal = ({ onNavigate }) => {
  const { showEbookPreview, previewBook, closeEbookPreview, user, membership, openAuthModal } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [showMembershipRequired, setShowMembershipRequired] = useState(false);
  const totalPages = 10; // Preview limited to 10 pages

  useEffect(() => {
    if (showEbookPreview && !user) {
      closeEbookPreview();
      openAuthModal('login');
      return;
    }
    
    if (showEbookPreview && user && !membership) {
      setShowMembershipRequired(true);
    } else {
      setShowMembershipRequired(false);
    }
  }, [showEbookPreview, user, membership]);

  if (!showEbookPreview || !previewBook) return null;

  const handleViewMembershipPlans = () => {
    closeEbookPreview();
    if (onNavigate) {
      onNavigate('membership');
    }
  };

  // Show membership required message
  if (showMembershipRequired) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}
        onClick={closeEbookPreview}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Lock style={{ width: '64px', height: '64px', color: '#d4145a', margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '12px' }}>
            Membership Required
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
            To preview eBooks, you need an active membership. Subscribe to any of our membership plans to unlock book previews and other exclusive features.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={closeEbookPreview}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              Close
            </button>
            <button
              onClick={handleViewMembershipPlans}
              style={{
                padding: '12px 24px',
                backgroundColor: '#d4145a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b01149'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#d4145a'}
            >
              View Membership Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleZoomIn = () => {
    if (zoom < 150) setZoom(zoom + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 70) setZoom(zoom - 10);
  };

  // Sample preview content
  const getPreviewContent = () => {
    const contents = {
      1: {
        title: 'Title Page',
        content: (
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>{previewBook.title}</h1>
            <p style={{ fontSize: '24px', color: '#6b7280', marginBottom: '8px' }}>by {previewBook.author}</p>
            <div style={{ marginTop: '40px' }}>
              <BookOpen style={{ width: '64px', height: '64px', color: '#d4145a', margin: '0 auto' }} />
            </div>
          </div>
        )
      },
      2: {
        title: 'Copyright',
        content: (
          <div style={{ padding: '40px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              © {new Date().getFullYear()} {previewBook.publisher}<br /><br />
              All rights reserved. No part of this publication may be reproduced, stored in a retrieval system, or transmitted in any form or by any means, electronic, mechanical, photocopying, recording, or otherwise, without the prior written permission of the publisher.<br /><br />
              ISBN: {previewBook.isbn}<br />
              Publisher: {previewBook.publisher}<br />
              Pages: {previewBook.pages}
            </p>
          </div>
        )
      },
      3: {
        title: 'Chapter 1',
        content: (
          <div style={{ padding: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Chapter 1</h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        )
      }
    };

    // For pages 4-10, show generic content
    if (currentPage > 3) {
      return {
        title: `Chapter ${currentPage - 2}`,
        content: (
          <div style={{ padding: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Chapter {currentPage - 2}</h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              This is a preview page. Purchase the full book to read all {previewBook.pages} pages and discover the complete story. The preview is limited to the first 10 pages to give you a taste of the content.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Donec in efficitur leo, in consequat nunc. Aenean sed quam arcu.
            </p>
          </div>
        )
      };
    }

    return contents[currentPage] || contents[1];
  };

  const pageContent = getPreviewContent();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}
      onClick={closeEbookPreview}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>
              {previewBook.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Preview Mode - First {totalPages} pages
            </p>
          </div>
          <button
            onClick={closeEbookPreview}
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === 1 ? '#e5e7eb' : '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                color: currentPage === 1 ? '#9ca3af' : '#374151'
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
              Prev
            </button>
            <span style={{ fontSize: '14px', color: '#6b7280', padding: '0 12px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                color: currentPage === totalPages ? '#9ca3af' : '#374151'
              }}
            >
              Next
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 70}
              style={{
                padding: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: zoom <= 70 ? 'not-allowed' : 'pointer',
                color: zoom <= 70 ? '#9ca3af' : '#374151'
              }}
            >
              <ZoomOut style={{ width: '16px', height: '16px' }} />
            </button>
            <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '50px', textAlign: 'center' }}>
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              style={{
                padding: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: zoom >= 150 ? 'not-allowed' : 'pointer',
                color: zoom >= 150 ? '#9ca3af' : '#374151'
              }}
            >
              <ZoomIn style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f3f4f6',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '700px',
            minHeight: '500px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s'
          }}>
            {pageContent.content}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            📖 Preview limited to {totalPages} pages. Purchase to read all {previewBook.pages} pages.
          </p>
          <button
            onClick={closeEbookPreview}
            style={{
              padding: '8px 16px',
              backgroundColor: '#d4145a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b01149'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#d4145a'}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
