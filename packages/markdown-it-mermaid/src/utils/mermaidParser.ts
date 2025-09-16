/**
 * Mermaid Flowchart Parser
 * Parses Mermaid flowchart syntax to extract node and edge information
 */

export interface ParsedNode {
    id: string;
    text: string;
    shape: string;
    style?: string;
    class?: string;
}

export interface ParsedEdge {
    from: string;
    to: string;
    type: string;
    label?: string;
    style?: string;
}

export interface ParsedFlowchart {
    nodes: ParsedNode[];
    edges: ParsedEdge[];
    direction: string;
}

/**
 * Parse Mermaid flowchart syntax
 */
export function parseMermaidFlowchart(code: string): ParsedFlowchart {
    const lines = code.split('\n').map(line => line.trim()).filter(line => line);
    
    let direction = 'TD'; // Default direction
    const nodes: ParsedNode[] = [];
    const edges: ParsedEdge[] = [];
    const nodeMap = new Map<string, ParsedNode>();
    
    // Extract direction
    const directionMatch = code.match(/(flowchart|graph)\s+(TD|TB|BT|RL|LR)/im);
    if (directionMatch) {
        direction = directionMatch[2];
    }
    
    // Helper function to parse node shape and text
    function parseNodeDefinition(nodeStr: string): { id: string; text: string; shape: string } {
        // Handle special cases for double parentheses: ID((text))
        const doubleParenMatch = nodeStr.match(/^(\w+)\(\(([^)]*)\)\)$/);
        if (doubleParenMatch) {
            const [, id, content] = doubleParenMatch;
            return { id, text: content || id, shape: 'stadium' };
        }
        
        // Handle double braces: ID{{text}}
        const doubleBraceMatch = nodeStr.match(/^(\w+)\{\{([^}]*)\}\}$/);
        if (doubleBraceMatch) {
            const [, id, content] = doubleBraceMatch;
            return { id, text: content || id, shape: 'hexagon' };
        }
        
        // Match different node formats: ID[text], ID(text), ID{text}, etc.
        const nodeDefMatch = nodeStr.match(/^(\w+)\s*([\[\(\{])([^\]\)\}]*)([\]\)\}])$/);
        if (nodeDefMatch) {
            const [, id, open, content, close] = nodeDefMatch;
            let shape = 'rect';
            let text = content || id;
            
            // Determine shape based on brackets
            if (open === '(' && close === ')') {
                shape = 'circle';
            } else if (open === '[' && close === ']') {
                if (content.startsWith('/') && content.endsWith('/')) {
                    shape = 'trapezoid';
                    text = content.slice(1, -1);
                } else if (content.startsWith('\\') && content.endsWith('/')) {
                    shape = 'parallelogram';
                    text = content.slice(1, -1);
                } else {
                    shape = 'rect';
                }
            } else if (open === '{' && close === '}') {
                shape = 'diamond';
            }
            
            return { id, text, shape };
        }
        
        // Simple node ID without brackets
        const simpleMatch = nodeStr.match(/^(\w+)$/);
        if (simpleMatch) {
            return { id: simpleMatch[1], text: simpleMatch[1], shape: 'rect' };
        }
        
        // Fallback
        return { id: nodeStr, text: nodeStr, shape: 'rect' };
    }
    
    // Helper function to add node to map
    function addNode(id: string, text?: string, shape?: string) {
        if (!nodeMap.has(id)) {
            nodeMap.set(id, {
                id,
                text: text || id,
                shape: shape || 'rect'
            });
        }
    }
    
    for (const line of lines) {
        // Skip comments and empty lines
        if (line.startsWith('%%') || !line) continue;
        
        // Skip direction line
        if (line.match(/^(flowchart|graph)\s+(TD|TB|BT|RL|LR)/i)) continue;
        
        // Skip class definitions
        if (line.startsWith('classDef')) continue;
        if (line.startsWith('class ')) continue;
        if (line.startsWith('linkStyle')) continue;
        if (line.startsWith('style ')) continue;
        
        // Parse chained connections: A --> B --> C --> D
        // First, check if this line contains multiple arrows (chain pattern)
        const arrowCount = (line.match(/(-->|->|==|--)/g) || []).length;
        if (arrowCount > 1) {
            // Parse chain by finding all arrow patterns
            const chainPattern = /([^-=>\s]+(?:\[[^\]]*\]|\([^)]*\)|\{[^}]*\})?)\s*(-->|->|==|--)\s*/g;
            const parts: Array<{node: string, connector?: string}> = [];
            let match;
            let lastIndex = 0;
            
            // Extract all node-connector pairs
            while ((match = chainPattern.exec(line)) !== null) {
                parts.push({
                    node: match[1].trim(),
                    connector: match[2]
                });
                lastIndex = match.index + match[0].length;
            }
            
            // Add the final node (after the last arrow)
            const finalNodeMatch = line.substring(lastIndex).trim();
            if (finalNodeMatch) {
                parts.push({ node: finalNodeMatch });
            }
            
            // Process the chain
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const node = parseNodeDefinition(part.node);
                addNode(node.id, node.text, node.shape);
                
                // Create edge to next node if there's a connector
                if (part.connector && i + 1 < parts.length) {
                    const nextPart = parts[i + 1];
                    const nextNode = parseNodeDefinition(nextPart.node);
                    addNode(nextNode.id, nextNode.text, nextNode.shape);
                    
                    let edgeType = 'arrow';
                    if (part.connector.includes('==')) edgeType = 'thick';
                    else if (part.connector.includes('--')) edgeType = 'line';
                    
                    edges.push({
                        from: node.id,
                        to: nextNode.id,
                        type: edgeType
                    });
                }
            }
            continue;
        }
        
        // Parse complex edge patterns with labels (single connection)
        // Pattern: NodeA[Text] -->|Label| NodeB{Text}
        const complexEdgeMatch = line.match(/^(.+?)\s*([-=~.>]+)\s*(?:\|([^|]+)\|)?\s*(.+)$/);
        if (complexEdgeMatch) {
            const [, fromStr, connector, label, toStr] = complexEdgeMatch;
            
            // Parse from node
            const fromNode = parseNodeDefinition(fromStr.trim());
            addNode(fromNode.id, fromNode.text, fromNode.shape);
            
            // Parse to node
            const toNode = parseNodeDefinition(toStr.trim());
            addNode(toNode.id, toNode.text, toNode.shape);
            
            // Determine edge type
            let edgeType = 'arrow';
            if (connector.includes('==')) edgeType = 'thick';
            else if (connector.includes('--')) edgeType = 'line';
            else if (connector.includes('~') || connector.includes('.')) edgeType = 'dotted';
            
            edges.push({
                from: fromNode.id,
                to: toNode.id,
                type: edgeType,
                label: label?.trim()
            });
            continue;
        }
        
        // Parse simple edge patterns without labels
        // Pattern: NodeA --> NodeB
        const simpleEdgeMatch = line.match(/^(\w+)\s*([-=~.>]+)\s*(\w+)$/);
        if (simpleEdgeMatch) {
            const [, from, connector, to] = simpleEdgeMatch;
            
            // Add nodes if they don't exist
            addNode(from);
            addNode(to);
            
            // Determine edge type
            let edgeType = 'arrow';
            if (connector.includes('==')) edgeType = 'thick';
            else if (connector.includes('--')) edgeType = 'line';
            else if (connector.includes('~') || connector.includes('.')) edgeType = 'dotted';
            
            edges.push({
                from,
                to,
                type: edgeType
            });
            continue;
        }
        
        // Parse standalone node definitions
        // Pattern: NodeA[Text]
        const standaloneNodeMatch = line.match(/^(\w+)\s*([\[\(\{])([^\]\)\}]*)([\]\)\}])$/);
        if (standaloneNodeMatch) {
            const nodeInfo = parseNodeDefinition(line);
            addNode(nodeInfo.id, nodeInfo.text, nodeInfo.shape);
            continue;
        }
        
        // Parse simple node ID
        const simpleNodeMatch = line.match(/^(\w+)$/);
        if (simpleNodeMatch) {
            addNode(simpleNodeMatch[1]);
        }
    }
    
    // Convert map to array
    nodes.push(...Array.from(nodeMap.values()));
    
    return {
        nodes,
        edges,
        direction
    };
}

/**
 * Generate HTML for flowchart with image-based nodes
 */
export function generateFlowchartHtml(parsed: ParsedFlowchart, useSvg: boolean = true): string {
    const { nodes, edges, direction } = parsed;
    
    // Create a more sophisticated layout
    const isHorizontal = direction === 'LR' || direction === 'RL';
    const isReverse = direction === 'BT' || direction === 'RL';

    // Adjust gap and padding based on direction for better fit
    const gap = isHorizontal ? '15px' : '10px'; // Smaller gap for vertical layout to prevent overflow
    const padding = isHorizontal ? '30px' : '20px'; // Less padding for vertical to save space

    // Generate CSS for layout
    const css = `
        .mermaid-flowchart {
            display: flex;
            flex-direction: ${isHorizontal ? 'row' : 'column'};
            align-items: center;
            justify-content: flex-start;
            gap: ${gap};
            padding: ${padding};
            font-family: Arial, sans-serif;
            background-color: transparent;
            border-radius: 8px;
            min-height: ${isHorizontal ? '200px' : 'auto'};
            max-width: ${isHorizontal ? '100%' : '400px'}; /* Limit width for vertical layout */
            margin: 0 auto; /* Center the container */
        }
        
        .mermaid-node {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 5px;
            transition: transform 0.2s ease;
        }
        
        .mermaid-node:hover {
            transform: scale(1.05);
        }
        
        .mermaid-node img {
            max-width: none;
            height: auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 4px;
        }
        
        .mermaid-edge {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            margin: 5px 0;
        }
        
        .mermaid-arrow {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .mermaid-arrow-line {
            ${isHorizontal ? 'width: 30px; height: 2px;' : 'width: 2px; height: 25px;'}
            background-color: #666;
            position: relative;
        }
        
        .mermaid-arrow-head {
            position: absolute;
            ${isHorizontal ? 'right: -8px;' : 'bottom: -8px;'}
            width: 0;
            height: 0;
            ${isHorizontal 
                ? 'border-left: 8px solid #666; border-top: 6px solid transparent; border-bottom: 6px solid transparent;'
                : 'border-top: 8px solid #666; border-left: 6px solid transparent; border-right: 6px solid transparent;'
            }
        }
        
        .mermaid-edge-label {
            position: absolute;
            ${isHorizontal ? 'top: -20px;' : 'left: 15px;'}
            font-size: 12px;
            color: #666;
            background-color: rgba(255,255,255,0.8);
            padding: 2px 6px;
            border-radius: 3px;
            white-space: nowrap;
        }
        
        .mermaid-dotted .mermaid-arrow-line {
            background: repeating-linear-gradient(
                ${isHorizontal ? 'to right' : 'to bottom'},
                #666 0px,
                #666 4px,
                transparent 4px,
                transparent 8px
            );
        }
        
        .mermaid-thick .mermaid-arrow-line {
            ${isHorizontal ? 'height: 4px;' : 'width: 4px;'}
        }
    `;
    
    // Build a simple layout - arrange nodes and edges
    let html = `<div class="mermaid-flowchart">`;
    
    // Group nodes by their position in the flow
    const nodePositions = new Map<string, number>();
    const processedNodes = new Set<string>();
    let position = 0;
    
    // Simple topological sort for layout
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    function visit(nodeId: string): void {
        if (visited.has(nodeId)) return;
        if (visiting.has(nodeId)) return; // Cycle detection
        
        visiting.add(nodeId);
        
        // Visit all dependencies (incoming edges)
        const incomingEdges = edges.filter(e => e.to === nodeId);
        for (const edge of incomingEdges) {
            visit(edge.from);
        }
        
        visiting.delete(nodeId);
        visited.add(nodeId);
        
        if (!nodePositions.has(nodeId)) {
            nodePositions.set(nodeId, position++);
        }
    }
    
    // Visit all nodes
    for (const node of nodes) {
        visit(node.id);
    }
    
    // Sort nodes by position
    const sortedNodes = [...nodes].sort((a, b) => {
        const posA = nodePositions.get(a.id) ?? 999;
        const posB = nodePositions.get(b.id) ?? 999;
        return posA - posB;
    });
    
    // Generate HTML - create a linear flow of nodes and edges
    for (let i = 0; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];
        const imageUrl = useSvg 
            ? generateNodeSvg(node)
            : generateNodeImageUrl(node);
        
        // Add node
        html += `
            <div class="mermaid-node" data-node-id="${node.id}">
                <img src="${imageUrl}" alt="${node.text}" title="${node.text}" />
            </div>
        `;
        
        // Add edges from this node (only the first outgoing edge for linear flow)
        const outgoingEdges = edges.filter(e => e.from === node.id);
        if (outgoingEdges.length > 0) {
            const edge = outgoingEdges[0]; // Take first edge for linear flow
            const edgeClass = `mermaid-${edge.type}`;
            html += `
                <div class="mermaid-edge ${edgeClass}">
                    <div class="mermaid-arrow">
                        <div class="mermaid-arrow-line"></div>
                        <div class="mermaid-arrow-head"></div>
                        ${edge.label ? `<div class="mermaid-edge-label">${edge.label}</div>` : ''}
                    </div>
                </div>
            `;
        }
    }
    
    html += `</div>`;
    
    return `<style>${css}</style>${html}`;
}

// Import the dummy image functions
import { generateNodeImageUrl, generateNodeSvg } from './dummyImage';
