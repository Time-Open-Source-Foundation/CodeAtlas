'use client';

import { ArchitectureAnalysis, Diagram } from '@codeatlas/core';
import DiagramView from './DiagramView';
import { useState } from 'react';

interface ResultsPanelProps {
  analysis: ArchitectureAnalysis & { 
    diagram?: string; 
    repoInfo?: any; 
    rawResponse?: string;
    parsingWarnings?: string[];
  };
}

export default function ResultsPanel({ analysis }: ResultsPanelProps) {
  const { modules = [], relationships = [], summary = '', pattern, layers = [], repoInfo, diagrams } = analysis;
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'diagrams'>('diagrams');
  const [activeDiagramIdx, setActiveDiagramIdx] = useState(0);

  // Combine legacy diagram with new diagrams array
  const allDiagrams: Diagram[] = [];
  if (diagrams && diagrams.length > 0) {
    allDiagrams.push(...diagrams);
  } else if (analysis.diagram) {
    allDiagrams.push({
      type: 'architecture',
      title: 'System Architecture',
      content: analysis.diagram,
      description: 'Overview of system components and their relationships'
    });
  }

  return (
    <div className="space-y-6">
      {/* Repository Info */}
      {repoInfo && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {repoInfo.owner}/{repoInfo.repo}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {repoInfo.branch} • {repoInfo.fileCount} files
              </p>
            </div>
            <a
              href={`https://github.com/${repoInfo.owner}/${repoInfo.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {analysis.parsingWarnings && analysis.parsingWarnings.length > 0 && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Parsing Warning</h3>
          <p className="text-xs text-yellow-800 mb-2">
            {analysis.parsingWarnings[0]}
          </p>
          {analysis.rawResponse && (
            <details className="mt-2">
              <summary className="text-xs text-yellow-700 cursor-pointer hover:text-yellow-900">View Raw Response</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border border-yellow-200 overflow-auto max-h-40">
                {analysis.rawResponse}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('diagrams')}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'diagrams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            📊 Diagrams {allDiagrams.length > 0 && `(${allDiagrams.length})`}
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            📋 Overview
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'modules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            🔧 Modules ({modules.length})
          </button>
        </nav>
      </div>

      {/* Diagrams Tab */}
      {activeTab === 'diagrams' && allDiagrams.length > 0 && (
        <div className="space-y-4">
          {/* Diagram Type Selector */}
          {allDiagrams.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {allDiagrams.map((diagram, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDiagramIdx(idx)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all
                    ${activeDiagramIdx === idx
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {diagram.type === 'architecture' && '🏗️'}
                  {diagram.type === 'sequence' && '🔄'}
                  {diagram.type === 'class' && '📦'}
                  {diagram.type === 'flowchart' && '📈'}
                  {diagram.type === 'state' && '🔀'}
                  {diagram.type === 'er' && '🗄️'}
                  {' '}
                  {diagram.title}
                </button>
              ))}
            </div>
          )}

          {/* Active Diagram */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {allDiagrams[activeDiagramIdx].title}
              </h3>
              {allDiagrams[activeDiagramIdx].description && (
                <p className="text-sm text-gray-600 mt-1">
                  {allDiagrams[activeDiagramIdx].description}
                </p>
              )}
            </div>
            <DiagramView diagram={allDiagrams[activeDiagramIdx].content} />
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary */}
          {summary && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Pattern */}
          {pattern && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Architecture Pattern</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">{pattern.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-xs">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, pattern.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{Math.round(pattern.confidence * 100)}%</span>
              </div>
              {pattern.description && (
                <p className="text-xs text-gray-600 mt-2">{pattern.description}</p>
              )}
            </div>
          )}

          {/* Layers */}
          {layers && layers.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Architectural Layers</h3>
              <div className="space-y-3">
                {layers.map((layer, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">{layer.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {layer.modules && layer.modules.map((modulePath: string, mIdx: number) => {
                        const module = modules.find(m => m.path === modulePath);
                        return (
                          <span
                            key={mIdx}
                            className="px-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {module?.name || modulePath.split('/').pop()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relationships */}
          {relationships && relationships.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Component Relationships ({relationships.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {relationships.map((rel, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-100 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-900 font-mono">{rel.from?.split('/').pop() || rel.from}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-xs text-gray-900 font-mono">{rel.to?.split('/').pop() || rel.to}</span>
                      <span className="ml-auto text-xs text-gray-500 px-2 py-0.5 bg-gray-50 rounded border border-gray-200">
                        {rel.type || 'depends'}
                      </span>
                    </div>
                    {rel.description && (
                      <p className="text-xs text-gray-500">{rel.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && modules && modules.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Code Modules ({modules.length})
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {modules.map((module, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">{module.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded border border-gray-200">
                    {module.type || 'other'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-2 break-all">{module.path}</p>
                {module.description && (
                  <p className="text-xs text-gray-600 mb-2">{module.description}</p>
                )}
                {module.exports && module.exports.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Exports:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {module.exports.map((exp, eIdx) => (
                        <span
                          key={eIdx}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
