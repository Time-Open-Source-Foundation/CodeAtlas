'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface DiagramViewProps {
  diagram: string;
  className?: string;
}

export default function DiagramView({ diagram, className = '' }: DiagramViewProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagramKey, setDiagramKey] = useState(0);

  useEffect(() => {
    if (!diagram || !diagramRef.current) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 30,
        nodeSpacing: 80,
        rankSpacing: 120,
        diagramPadding: 30,
      },
      themeVariables: {
        // Professional color palette
        primaryColor: '#3B82F6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#1E40AF',
        lineColor: '#6B7280',
        secondaryColor: '#10B981',
        tertiaryColor: '#8B5CF6',
        background: '#FFFFFF',
        mainBkg: '#F9FAFB',
        textColor: '#111827',
        fontSize: '15px',
        fontFamily: '\'Inter\', -apple-system, system-ui, sans-serif',
        edgeLabelBackground: '#FFFFFF',
        clusterBkg: '#F3F4F6',
        clusterBorder: '#D1D5DB',
        defaultLinkColor: '#6B7280',
        titleColor: '#111827',
        // Enhanced contrast
        nodeBorder: '#1E40AF',
        nodeTextColor: '#111827',
        // Better shadows and depth
        shadowColor: 'rgba(0,0,0,0.1)',
      },
    });

    const renderDiagram = async () => {
      try {
        if (!diagramRef.current) return;
        
        diagramRef.current.innerHTML = '';
        
        const trimmedDiagram = diagram.trim();
        if (!trimmedDiagram || trimmedDiagram.length < 10) {
          throw new Error('Invalid diagram');
        }

        const validStarts = ['graph', 'flowchart', 'classDiagram', 'sequenceDiagram', 'stateDiagram', 'erDiagram'];
        const isValidStart = validStarts.some(start => trimmedDiagram.toLowerCase().startsWith(start.toLowerCase()));
        
        if (!isValidStart) {
          throw new Error('Invalid diagram format');
        }

        const id = `mermaid-${Date.now()}-${diagramKey}`;
        await mermaid.parse(trimmedDiagram);
        const { svg } = await mermaid.render(id, trimmedDiagram);
        
        if (diagramRef.current) {
          diagramRef.current.innerHTML = svg;
          setIsLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to render diagram');
        setIsLoading(false);
        
        if (diagramRef.current) {
          diagramRef.current.innerHTML = `
            <div class="p-4 text-sm text-gray-600 border border-gray-200 rounded">
              <p class="mb-2">Diagram error: ${err.message || 'Unknown error'}</p>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [diagram, diagramKey]);

  if (!diagram) {
    return (
      <div className={`border border-gray-200 rounded p-8 ${className}`}>
        <p className="text-sm text-gray-500 text-center">No diagram available</p>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded ${className}`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          Architecture Diagram
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDiagramKey(prev => prev + 1)}
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Refresh diagram"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => {
              if (diagramRef.current) {
                const svg = diagramRef.current.querySelector('svg');
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([svgData], { type: 'image/svg+xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'architecture-diagram.svg';
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }
            }}
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export as SVG (compatible with Excalidraw)"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export SVG
          </button>
          <button
            onClick={() => {
              if (diagramRef.current) {
                const svg = diagramRef.current.querySelector('svg');
                if (svg) {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                  const url = URL.createObjectURL(svgBlob);
                  
                  img.onload = () => {
                    canvas.width = img.width * 2; // 2x for high quality
                    canvas.height = img.height * 2;
                    ctx?.scale(2, 2);
                    ctx?.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const pngUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = pngUrl;
                        a.download = 'architecture-diagram.png';
                        a.click();
                        URL.revokeObjectURL(pngUrl);
                      }
                    }, 'image/png');
                    URL.revokeObjectURL(url);
                  };
                  img.src = url;
                }
              }
            }}
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export as high-quality PNG"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Export PNG
          </button>
          <button
            onClick={() => {
              const blob = new Blob([diagram], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'diagram.mmd';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Download Mermaid source"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Source
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="p-12 text-center">
          <div className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs text-gray-500">Rendering...</p>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="p-4 text-sm text-gray-600">
          {error}
        </div>
      )}
      
      <div 
        ref={diagramRef} 
        className={`p-8 overflow-auto bg-white ${isLoading ? 'hidden' : ''} ${error ? 'hidden' : ''}`}
        style={{ 
          maxHeight: '700px', 
          minHeight: '500px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      />
    </div>
  );
}
