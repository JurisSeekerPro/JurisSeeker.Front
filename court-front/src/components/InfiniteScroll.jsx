import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function InfiniteScroll({ 
  children, 
  onLoadMore, 
  hasMore, 
  loading,
  threshold = 200 
}) {
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, onLoadMore]);

  const containerRef = useRef();

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;

    if (scrollPosition <= threshold) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {children}
      
      {hasMore && (
        <div 
          ref={lastElementRef}
          style={{ 
            height: '20px',
            margin: '20px 0'
          }}
        />
      )}
      
      {loading && hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '20px'
          }}
        >
          <div className="spinner"></div>
          <p style={{ marginTop: '10px', color: '#666' }}>Загрузка...</p>
        </motion.div>
      )}
    </div>
  );
}