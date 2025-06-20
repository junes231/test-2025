import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import QuizNode from './QuizNode';
import ElementLibrary from './ElementLibrary';
import QuizPreview from './QuizPreview';
import './FunnelEditor.css';

const nodeTypes: NodeTypes = {
  quiz: QuizNode,
};

const FunnelEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        question: 'What\'s your biggest challenge?',
        answers: ['Option A', 'Option B', 'Option C', 'Option D'],
        buttonColor: '#007bff',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        buttonTextColor: '#ffffff',
        affiliateLinks: ['', '', '', ''],
        onUpdate: (data: any) => updateNodeData(newNode.id, data),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="funnel-editor">
      <div className="editor-header">
        <h1>Marketing Funnel Editor</h1>
        <div className="header-actions">
          <button className="btn-primary">Save Funnel</button>
          <button className="btn-secondary">Export</button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="sidebar">
          <ElementLibrary onAddNode={addNode} />
        </div>

        <div className="canvas-container" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>

        <div className="properties-panel">
          {selectedNode && (
            <QuizPreview 
              quizData={selectedNode.data} 
              nodeId={selectedNode.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FunnelEditor;
