import { ArchitectureAnalysis, Module, Relationship, Diagram } from './types';

export class DiagramGenerator {
    /**
     * Generate all applicable diagrams based on the architecture analysis
     */
    static generateAllDiagrams(analysis: ArchitectureAnalysis): Diagram[] {
        const diagrams: Diagram[] = [];

        // 1. Architecture/Component Diagram (always generate)
        diagrams.push({
            type: 'architecture',
            title: 'System Architecture',
            content: this.generateComponentDiagram(analysis),
            description: 'Overview of system components and their relationships'
        });

        // 2. Layered Diagram (if layers exist)
        if (analysis.layers && analysis.layers.length > 1) {
            diagrams.push({
                type: 'architecture',
                title: 'Layered Architecture',
                content: this.generateLayeredDiagram(analysis),
                description: 'Architectural layers and component organization'
            });
        }

        // 3. Sequence Diagrams (for main flows)
        // Auto-detect entry points if not provided
        if (!analysis.entryPoints || analysis.entryPoints.length === 0) {
            analysis.entryPoints = this.findEntryPoints(analysis.modules);
        }
        
        const sequenceDiagrams = this.generateSequenceDiagrams(analysis);
        diagrams.push(...sequenceDiagrams);

        // 4. Class Diagram (if OOP structure detected)
        if (this.hasOOPStructure(analysis)) {
            diagrams.push({
                type: 'class',
                title: 'Class Relationships',
                content: this.generateClassDiagram(analysis),
                description: 'Object-oriented class structure and inheritance'
            });
        }

        // 5. Data Flow Diagram (if data layer exists)
        if (analysis.layers?.some(l => l.name.toLowerCase().includes('data'))) {
            diagrams.push({
                type: 'flowchart',
                title: 'Data Flow',
                content: this.generateDataFlowDiagram(analysis),
                description: 'How data flows through the system'
            });
        }

        return diagrams;
    }

    /**
     * Auto-detect entry points from modules
     */
    private static findEntryPoints(modules: Module[]): string[] {
        const entryPoints = modules
            .filter(m => {
                const name = m.name.toLowerCase();
                const path = m.path.toLowerCase();
                return name === 'main' || name === 'index' || name === 'app' ||
                       name === 'extension' || name === 'server' ||
                       path.includes('/main.') || path.includes('/index.') || 
                       path.includes('/app.') || path.includes('/server.') ||
                       path.endsWith('main.ts') || path.endsWith('index.ts') ||
                       path.endsWith('main.js') || path.endsWith('index.js') ||
                       path.endsWith('app.ts') || path.endsWith('app.js');
            })
            .map(m => m.path);
        
        // If no obvious entry points, use the first few modules
        if (entryPoints.length === 0 && modules.length > 0) {
            return modules.slice(0, 3).map(m => m.path);
        }
        
        return entryPoints;
    }

    /**
     * Check if the codebase has object-oriented structure
     */
    private static hasOOPStructure(analysis: ArchitectureAnalysis): boolean {
        const { modules, relationships } = analysis;
        
        // Check for class-like modules
        const hasClasses = modules.some(m => 
            m.type === 'model' || m.type === 'service' || m.type === 'controller'
        );
        
        // Check for inheritance/implementation relationships
        const hasOOPRelations = relationships.some(r => 
            r.type === 'extends' || r.type === 'implements'
        );
        
        return hasClasses || hasOOPRelations;
    }

    /**
     * Generate sequence diagrams for main user flows
     */
    private static generateSequenceDiagrams(analysis: ArchitectureAnalysis): Diagram[] {
        const { modules, relationships, entryPoints } = analysis;
        const diagrams: Diagram[] = [];

        if (!entryPoints || entryPoints.length === 0) return diagrams;

        // Generate sequence diagram for each entry point
        entryPoints.slice(0, 3).forEach((entryPoint, idx) => {
            const flow = this.traceExecutionFlow(entryPoint, modules, relationships);
            if (flow.length > 1) {
                diagrams.push({
                    type: 'sequence',
                    title: `Flow: ${this.formatModuleName(entryPoint)}`,
                    content: this.generateSequenceDiagram(flow, modules),
                    description: `Execution flow starting from ${entryPoint}`
                });
            }
        });

        return diagrams;
    }

    /**
     * Trace execution flow from an entry point
     */
    private static traceExecutionFlow(
        startPath: string, 
        modules: Module[], 
        relationships: Relationship[],
        maxDepth: number = 5
    ): string[] {
        const flow: string[] = [startPath];
        const visited = new Set<string>([startPath]);
        let currentPaths = [startPath];

        for (let depth = 0; depth < maxDepth; depth++) {
            const nextPaths: string[] = [];
            
            for (const current of currentPaths) {
                const deps = relationships
                    .filter(r => r.from === current && !visited.has(r.to))
                    .slice(0, 2); // Limit branches
                
                for (const dep of deps) {
                    flow.push(dep.to);
                    visited.add(dep.to);
                    nextPaths.push(dep.to);
                }
            }
            
            if (nextPaths.length === 0) break;
            currentPaths = nextPaths;
        }

        return flow;
    }

    /**
     * Generate a sequence diagram from execution flow
     */
    private static generateSequenceDiagram(flow: string[], modules: Module[]): string {
        const lines: string[] = ['sequenceDiagram'];
        lines.push('    autonumber');
        lines.push('    box User Interaction');
        lines.push('    participant User');
        lines.push('    end');
        
        // Get unique modules in the flow
        const flowModules = flow.slice(0, 8); // Limit to 8 for readability
        const moduleMap = new Map<string, Module>();
        
        flowModules.forEach(path => {
            const module = modules.find(m => m.path === path);
            if (module) {
                moduleMap.set(path, module);
            }
        });

        // Group by layer
        const layers = new Map<string, string[]>();
        moduleMap.forEach((module, path) => {
            const layer = module.layer || 'other';
            if (!layers.has(layer)) {
                layers.set(layer, []);
            }
            layers.get(layer)!.push(path);
        });

        // Add participants by layer
        layers.forEach((paths, layer) => {
            const layerName = layer.charAt(0).toUpperCase() + layer.slice(1);
            lines.push(`    box ${layerName} Layer`);
            paths.forEach(path => {
                const module = moduleMap.get(path)!;
                const name = this.formatModuleName(module.name);
                lines.push(`    participant ${name.replace(/[^a-zA-Z0-9]/g, '')}`);
            });
            lines.push('    end');
        });

        // Add interactions
        lines.push('    User->>+' + this.formatModuleName(flowModules[0]).replace(/[^a-zA-Z0-9]/g, '') + ': initiates');
        
        for (let i = 0; i < flowModules.length - 1; i++) {
            const from = flowModules[i];
            const to = flowModules[i + 1];
            const fromModule = moduleMap.get(from);
            const toModule = moduleMap.get(to);
            
            if (fromModule && toModule) {
                const fromName = this.formatModuleName(fromModule.name).replace(/[^a-zA-Z0-9]/g, '');
                const toName = this.formatModuleName(toModule.name).replace(/[^a-zA-Z0-9]/g, '');
                const action = toModule.type === 'service' ? 'calls' : 'uses';
                lines.push(`    ${fromName}->>+${toName}: ${action}`);
                lines.push(`    ${toName}-->>-${fromName}: result`);
            }
        }

        const lastModule = flowModules[flowModules.length - 1];
        const lastModuleName = moduleMap.get(lastModule);
        if (lastModuleName) {
            lines.push('    ' + this.formatModuleName(lastModuleName.name).replace(/[^a-zA-Z0-9]/g, '') + '-->>-User: response');
        }

        return lines.join('\n');
    }

    /**
     * Generate a class diagram
     */
    private static generateClassDiagram(analysis: ArchitectureAnalysis): string {
        const { modules, relationships } = analysis;
        const lines: string[] = ['classDiagram'];
        
        // Filter to relevant modules (models, services, controllers)
        const relevantModules = modules.filter(m => 
            m.type === 'model' || m.type === 'service' || 
            m.type === 'controller' || m.type === 'component'
        ).slice(0, 15); // Limit for readability

        // Add classes
        relevantModules.forEach(module => {
            const className = this.formatModuleName(module.name).replace(/[^a-zA-Z0-9]/g, '');
            lines.push(`    class ${className} {`);
            
            // Add exports as methods
            if (module.exports && module.exports.length > 0) {
                module.exports.slice(0, 5).forEach(exp => {
                    lines.push(`        +${exp}()`);
                });
            } else {
                lines.push(`        +${module.type}()`);
            }
            
            lines.push(`    }`);
            
            // Add stereotype based on type
            const stereotype = `<<${module.type}>>`;
            lines.push(`    ${className} : ${stereotype}`);
        });

        // Add relationships
        const modulePaths = new Set(relevantModules.map(m => m.path));
        relationships
            .filter(r => modulePaths.has(r.from) && modulePaths.has(r.to))
            .slice(0, 20)
            .forEach(r => {
                const fromModule = relevantModules.find(m => m.path === r.from);
                const toModule = relevantModules.find(m => m.path === r.to);
                
                if (fromModule && toModule) {
                    const fromName = this.formatModuleName(fromModule.name).replace(/[^a-zA-Z0-9]/g, '');
                    const toName = this.formatModuleName(toModule.name).replace(/[^a-zA-Z0-9]/g, '');
                    
                    let arrow = '-->';
                    if (r.type === 'extends') arrow = '--|>';
                    else if (r.type === 'implements') arrow = '..|>';
                    else if (r.type === 'composes') arrow = '*--';
                    else if (r.type === 'aggregates') arrow = 'o--';
                    
                    lines.push(`    ${fromName} ${arrow} ${toName} : ${r.type}`);
                }
            });

        return lines.join('\n');
    }

    /**
     * Generate a data flow diagram
     */
    private static generateDataFlowDiagram(analysis: ArchitectureAnalysis): string {
        const { modules, relationships } = analysis;
        const lines: string[] = ['flowchart LR'];
        
        // Style definitions
        lines.push('    classDef input fill:#3B82F6,stroke:#1E40AF,stroke-width:2px,color:#fff');
        lines.push('    classDef process fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff');
        lines.push('    classDef storage fill:#F59E0B,stroke:#B45309,stroke-width:2px,color:#fff');
        lines.push('    classDef output fill:#EF4444,stroke:#B91C1C,stroke-width:2px,color:#fff');
        lines.push('');

        // Find data-related modules
        const dataModules = modules.filter(m => 
            m.layer === 'data' || m.type === 'model' || 
            m.path.toLowerCase().includes('data') ||
            m.path.toLowerCase().includes('database') ||
            m.path.toLowerCase().includes('repository')
        );

        // Create nodes
        const nodeMap = new Map<string, string>();
        dataModules.forEach((m, idx) => {
            const nodeId = `D${idx}`;
            const name = this.formatModuleName(m.name);
            
            let shape = '[' + name + ']';
            let styleClass = 'process';
            
            if (m.type === 'model') {
                shape = '[(💾 ' + name + ')]';
                styleClass = 'storage';
            } else if (m.path.includes('input') || m.path.includes('controller')) {
                shape = '[/📥 ' + name + '/]';
                styleClass = 'input';
            } else if (m.path.includes('output') || m.path.includes('view')) {
                shape = '[\\📤 ' + name + '\\]';
                styleClass = 'output';
            }
            
            lines.push(`    ${nodeId}${shape}`);
            lines.push(`    class ${nodeId} ${styleClass}`);
            nodeMap.set(m.path, nodeId);
        });

        lines.push('');

        // Add data flow relationships
        const dataPaths = new Set(dataModules.map(m => m.path));
        relationships
            .filter(r => dataPaths.has(r.from) && dataPaths.has(r.to))
            .forEach(r => {
                const fromId = nodeMap.get(r.from);
                const toId = nodeMap.get(r.to);
                
                if (fromId && toId) {
                    const label = r.type === 'uses' ? 'reads/writes' : r.type;
                    lines.push(`    ${fromId} -->|${label}| ${toId}`);
                }
            });

        return lines.join('\n');
    }

    /**
     * Format module name for display
     */
    private static formatModuleName(name: string): string {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Generate a component diagram showing modules and relationships
     * Enhanced version with better organization, visual hierarchy, and informative labels
     */
    static generateComponentDiagram(analysis: ArchitectureAnalysis): string {
        const { modules, relationships, layers, entryPoints, coreComponents } = analysis;
        
        if (!modules || modules.length === 0) {
            return 'graph TD\n    NoData[No modules to display]';
        }

        // If layers exist and have modules, use layered diagram
        if (layers && layers.length > 0 && layers.some(l => l.modules && l.modules.length > 0)) {
            return this.generateLayeredDiagram(analysis);
        }

        const lines: string[] = ['flowchart TB'];
        
        // Enhanced style classes with better visual distinction
        lines.push('    classDef component fill:#3B82F6,stroke:#1E40AF,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef service fill:#10B981,stroke:#047857,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef model fill:#F59E0B,stroke:#B45309,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef controller fill:#8B5CF6,stroke:#6D28D9,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef utility fill:#06B6D4,stroke:#0E7490,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef view fill:#EF4444,stroke:#B91C1C,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef config fill:#6B7280,stroke:#374151,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef other fill:#9CA3AF,stroke:#4B5563,stroke-width:2px,color:#fff,font-weight:500,font-size:12px');
        lines.push('    classDef entry fill:#F59E0B,stroke:#B45309,stroke-width:4px,color:#fff,font-weight:700,font-size:14px');
        lines.push('    classDef core fill:#8B5CF6,stroke:#6D28D9,stroke-width:4px,color:#fff,font-weight:700,font-size:14px');
        lines.push('');

        // Identify entry points and core components
        const entryPointPaths = new Set(entryPoints || []);
        const coreComponentPaths = new Set(coreComponents || []);

        // Group modules by type for better organization
        const modulesByType = new Map<string, Module[]>();
        modules.forEach(m => {
            const type = m.type || 'other';
            if (!modulesByType.has(type)) {
                modulesByType.set(type, []);
            }
            modulesByType.get(type)!.push(m);
        });

        // Create nodes organized by type with enhanced labels
        const nodeMap = new Map<string, string>();
        let nodeIdx = 0;
        
        // Create subgraphs for each type
        modulesByType.forEach((typeModules, type) => {
            if (typeModules.length > 1) {
                const subgraphId = type.charAt(0).toUpperCase() + type.slice(1);
                lines.push(`    subgraph ${subgraphId}["${subgraphId} Layer"]`);
                
                typeModules.forEach(m => {
                    const nodeId = `M${nodeIdx}`;
                    const cleanLabel = this.formatModuleName(m.name || m.path.split('/').pop() || `Module${nodeIdx}`).replace(/[\n"]/g, ' ');
                    const shape = this.getNodeShape(m.type);
                    
                    // Add entry/core indicators
                    const prefix = entryPointPaths.has(m.path) ? '🚀 ' : 
                                  coreComponentPaths.has(m.path) ? '⭐ ' : '';
                    
                    lines.push(`        ${nodeId}${shape.start}${prefix}${cleanLabel}${shape.end}`);
                    nodeMap.set(m.path, nodeId);
                    
                    // Apply enhanced styling
                    let styleClass: string = m.type || 'other';
                    if (entryPointPaths.has(m.path)) {
                        styleClass = 'entry';
                    } else if (coreComponentPaths.has(m.path)) {
                        styleClass = 'core';
                    }
                    lines.push(`        class ${nodeId} ${styleClass}`);
                    
                    nodeIdx++;
                });
                
                lines.push('    end');
                lines.push('');
            } else {
                // Single module - add directly
                const m = typeModules[0];
                const nodeId = `M${nodeIdx}`;
                const cleanLabel = this.formatModuleName(m.name || m.path.split('/').pop() || `Module${nodeIdx}`).replace(/[\n"]/g, ' ');
                const shape = this.getNodeShape(m.type);
                
                // Add entry/core indicators
                const prefix = entryPointPaths.has(m.path) ? '🚀 ' : 
                              coreComponentPaths.has(m.path) ? '⭐ ' : '';
                
                lines.push(`    ${nodeId}${shape.start}${prefix}${cleanLabel}${shape.end}`);
                nodeMap.set(m.path, nodeId);
                
                let styleClass: string = m.type || 'other';
                if (entryPointPaths.has(m.path)) {
                    styleClass = 'entry';
                } else if (coreComponentPaths.has(m.path)) {
                    styleClass = 'core';
                }
                lines.push(`    class ${nodeId} ${styleClass}`);
                lines.push('');
                
                nodeIdx++;
            }
        });
        
        // Add relationships with enhanced styling and strength indicators
        if (relationships && relationships.length > 0) {
            relationships.forEach(r => {
                const fromId = nodeMap.get(r.from);
                const toId = nodeMap.get(r.to);
                
                if (fromId && toId) {
                    const arrow = this.getArrowStyle(r.type, r.strength);
                    const label = this.formatRelationshipLabel(r);
                    
                    // Use different arrow styles for strength
                    let finalArrow = arrow;
                    if (r.strength === 'strong') {
                        finalArrow = arrow.replace('-->', '==>').replace('--|>', '==|>').replace('-.->', '==>');
                    } else if (r.strength === 'weak') {
                        finalArrow = arrow.replace('-->', '-.->').replace('--|>', '-.|>');
                    }
                    
                    if (label) {
                        lines.push(`    ${fromId} ${finalArrow}|"${label}"| ${toId}`);
                    } else {
                        lines.push(`    ${fromId} ${finalArrow} ${toId}`);
                    }
                }
            });
        }
        
        return lines.join('\n');
    }
    
    private static createEnhancedNodeLabel(module: Module, isEntryPoint: boolean, isCore: boolean): string {
        let label = module.name || module.path.split('/').pop() || 'Unknown';
        
        // Add type indicator
        if (module.type && module.type !== 'other') {
            label += `\n<small>${module.type}</small>`;
        }
        
        // Add entry point indicator
        if (isEntryPoint) {
            label = `🚀 ${label}`;
        } else if (isCore) {
            label = `⭐ ${label}`;
        }
        
        return label;
    }
    
    private static formatRelationshipLabel(r: Relationship): string {
        // Prioritize description if available and concise
        if (r.description && r.description.length < 25) {
            return r.description;
        }
        // Use type if meaningful
        if (r.type && r.type !== 'depends' && r.type !== 'uses') {
            return r.type;
        }
        // Show strength if available
        if (r.strength && r.strength !== 'medium') {
            return r.strength;
        }
        return '';
    }

    /**
     * Generate a layered architecture diagram with enhanced visual hierarchy and information
     */
    static generateLayeredDiagram(analysis: ArchitectureAnalysis): string {
        const { layers, modules, relationships, entryPoints, coreComponents } = analysis;
        
        if (!layers || layers.length === 0) {
            return this.generateComponentDiagram(analysis);
        }

        const lines: string[] = ['flowchart TB'];
        
        // Enhanced style definitions with better visual distinction
        lines.push('    classDef presentation fill:#EF4444,stroke:#B91C1C,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef business fill:#3B82F6,stroke:#1E40AF,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef data fill:#10B981,stroke:#047857,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef infrastructure fill:#F59E0B,stroke:#B45309,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef other fill:#6B7280,stroke:#4B5563,stroke-width:2px,color:#fff,font-weight:500,font-size:12px');
        lines.push('    classDef cache fill:#06B6D4,stroke:#0E7490,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef monitoring fill:#8B5CF6,stroke:#6D28D9,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef communication fill:#EC4899,stroke:#BE185D,stroke-width:3px,color:#fff,font-weight:600,font-size:13px');
        lines.push('    classDef entry fill:#F59E0B,stroke:#B45309,stroke-width:4px,color:#fff,font-weight:700,font-size:14px');
        lines.push('    classDef core fill:#8B5CF6,stroke:#6D28D9,stroke-width:4px,color:#fff,font-weight:700,font-size:14px');
        lines.push('');

        // Identify entry points and core components
        const entryPointPaths = new Set(entryPoints || []);
        const coreComponentPaths = new Set(coreComponents || []);

        // Create subgraphs for each layer with enhanced organization
        const layerModuleMap = new Map<string, string>();
        
        layers.forEach((layer, layerIdx) => {
            const layerName = layer.name || `Layer ${layerIdx}`;
            const moduleCount = layer.modules?.length || 0;
            const layerTitle = `${layerName} (${moduleCount})`;
            
            lines.push(`    subgraph L${layerIdx}["${layerTitle}"]`);
            
            if (layer.modules && layer.modules.length > 0) {
                layer.modules.forEach((modulePath, modIdx) => {
                    const module = modules.find(m => m.path === modulePath);
                    const nodeId = `L${layerIdx}_M${modIdx}`;
                    const moduleName = module?.name || modulePath.split('/').pop() || `Module${modIdx}`;
                    const cleanLabel = this.formatModuleName(moduleName).replace(/[\n"]/g, ' ');
                    const shape = module ? this.getNodeShape(module.type) : { start: '[', end: ']' };
                    
                    // Add entry/core indicators
                    const prefix = entryPointPaths.has(modulePath) ? '🚀 ' : 
                                  coreComponentPaths.has(modulePath) ? '⭐ ' : '';
                    
                    lines.push(`        ${nodeId}${shape.start}${prefix}${cleanLabel}${shape.end}`);
                    layerModuleMap.set(modulePath, nodeId);
                    
                    // Apply enhanced layer-based styling
                    let styleClass: string = 'other';
                    if (entryPointPaths.has(modulePath)) {
                        styleClass = 'entry';
                    } else if (coreComponentPaths.has(modulePath)) {
                        styleClass = 'core';
                    } else {
                        const layerStyle = this.getLayerStyleClass(layerName);
                        if (layerStyle) {
                            styleClass = layerStyle;
                        } else if (module?.type && module.type !== 'other') {
                            styleClass = module.type;
                        }
                    }
                    lines.push(`        class ${nodeId} ${styleClass}`);
                });
            } else {
                // Empty layer - add informative placeholder
                lines.push(`        Empty${layerIdx}["No modules in this layer"]:::other`);
            }
            
            lines.push('    end');
            lines.push('');
        });
        
        // Add cross-layer dependencies with enhanced styling and strength indicators
        if (relationships && relationships.length > 0) {
            relationships.forEach(r => {
                const fromId = layerModuleMap.get(r.from);
                const toId = layerModuleMap.get(r.to);
                
                if (fromId && toId) {
                    const arrow = this.getArrowStyle(r.type, r.strength);
                    const label = this.formatRelationshipLabel(r);
                    
                    // Use different arrow styles for strength
                    let finalArrow = arrow;
                    if (r.strength === 'strong') {
                        finalArrow = arrow.replace('-->', '==>').replace('--|>', '==|>').replace('-.->', '==>');
                    } else if (r.strength === 'weak') {
                        finalArrow = arrow.replace('-->', '-.->').replace('--|>', '-.|>');
                    }
                    
                    if (label) {
                        lines.push(`    ${fromId} ${finalArrow}|"${label}"| ${toId}`);
                    } else {
                        lines.push(`    ${fromId} ${finalArrow} ${toId}`);
                    }
                }
            });
        }
        
        return lines.join('\n');
    }
    
    private static getLayerStyleClass(layerName: string): string | null {
        const name = layerName.toLowerCase();
        if (name.includes('presentation') || name.includes('view') || name.includes('ui')) {
            return 'presentation';
        }
        if (name.includes('business') || name.includes('service') || name.includes('logic')) {
            return 'business';
        }
        if (name.includes('data') || name.includes('database') || name.includes('model')) {
            return 'data';
        }
        if (name.includes('infrastructure') || name.includes('infra')) {
            return 'infrastructure';
        }
        if (name.includes('cache')) {
            return 'cache';
        }
        if (name.includes('monitor') || name.includes('logging')) {
            return 'monitoring';
        }
        if (name.includes('communication') || name.includes('message') || name.includes('api')) {
            return 'communication';
        }
        return null;
    }

    /**
     * Generate a C4-style component diagram
     */
    static generateC4Diagram(analysis: ArchitectureAnalysis): string {
        const { modules, relationships, summary } = analysis;
        
        const lines: string[] = ['graph TB'];
        
        // Style definitions for C4 model
        lines.push('    classDef system fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff');
        lines.push('    classDef container fill:#438dd5,stroke:#2e6295,stroke-width:2px,color:#fff');
        lines.push('    classDef component fill:#85bbf0,stroke:#5d9cdb,stroke-width:2px,color:#fff');
        lines.push('');
        
        // Group modules by layer/type
        const coreModules = modules.filter(m => 
            analysis.coreComponents?.includes(m.path) || 
            analysis.entryPoints?.includes(m.path)
        );
        const supportModules = modules.filter(m => 
            !coreModules.includes(m)
        );
        
        // Core system
        if (coreModules.length > 0) {
            lines.push('    subgraph System["Core System"]');
            coreModules.forEach((m, idx) => {
                const nodeId = `Core${idx}`;
                lines.push(`        ${nodeId}["${m.name}"]:::system`);
            });
            lines.push('    end');
            lines.push('');
        }
        
        // Supporting components
        if (supportModules.length > 0) {
            lines.push('    subgraph Support["Supporting Components"]');
            supportModules.forEach((m, idx) => {
                const nodeId = `Sup${idx}`;
                const styleClass = m.type === 'service' ? 'container' : 'component';
                lines.push(`        ${nodeId}["${m.name}"]:::${styleClass}`);
            });
            lines.push('    end');
            lines.push('');
        }
        
        return lines.join('\n');
    }

    /**
     * Generate a flowchart showing the execution flow
     */
    static generateFlowDiagram(analysis: ArchitectureAnalysis): string {
        const { modules, relationships, entryPoints } = analysis;
        
        if (!entryPoints || entryPoints.length === 0) {
            return this.generateComponentDiagram(analysis);
        }

        const lines: string[] = ['graph TD'];
        lines.push('    Start([Start])');
        lines.push('');
        
        // Find entry point modules
        const entryModules = modules.filter(m => entryPoints.includes(m.path));
        
        entryModules.forEach((entry, idx) => {
            const nodeId = `Entry${idx}`;
            lines.push(`    Start --> ${nodeId}["${entry.name}"]`);
        });
        
        return lines.join('\n');
    }

    private static getNodeShape(type: Module['type']): { start: string; end: string } {
        switch (type) {
            case 'service':
                return { start: '[[', end: ']]' }; // Subprocess
            case 'model':
                return { start: '[(', end: ')]' }; // Database
            case 'controller':
                return { start: '[/', end: '/]' }; // Parallel
            case 'view':
                return { start: '([', end: '])' }; // Stadium
            case 'config':
                return { start: '{', end: '}' }; // Diamond
            default:
                return { start: '[', end: ']' }; // Rectangle
        }
    }

    private static getArrowStyle(type: Relationship['type'], strength?: string): string {
        // Base arrow style
        let arrow: string;
        switch (type) {
            case 'extends':
            case 'implements':
                arrow = '--|>';
                break;
            case 'imports':
            case 'uses':
                arrow = '-->';
                break;
            case 'calls':
                arrow = '-.->';
                break;
            case 'aggregates':
                arrow = '--o';
                break;
            case 'composes':
                arrow = '==>';
                break;
            case 'depends':
                arrow = '-.->';
                break;
            default:
                arrow = '-->';
        }
        
        return arrow;
    }
}
