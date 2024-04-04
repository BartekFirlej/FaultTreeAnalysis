import React, { useState, useRef }  from 'react';
import Menu from './Menu'; 
import ExternalEvent from './ExternalEvent';
import TopEvent from './TopEvent';
import BasicEvent from './BasicEvent';
import OrGate  from './OrGate';
import AndGate from './AndGate';
import Condition from './Condition';
import Line, { LineProps, LineRef } from './Line';
import { start } from 'repl';

const App: React.FC = () => {
  const lineRef = useRef<LineRef>(null);

  const [linePositions, setLinePositions] = useState<{ [key: string]: { start: { x: number; y: number }; end: { x: number; y: number } } }>({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);


  const [topEvents, setTopEvents] = useState<Array<{ id: string; label: string; position: { x: number; y: number; } }>>([]);
  const [basicEvents, setBasicEvents] = useState<Array<{ id: string; label: string; position: { x: number; y: number } }>>([]);
  const [externalEvents, setExternalEvents] = useState<Array<{ id: string; label: string; position: { x: number; y: number } }>>([]);
  const [orGates, setOrGates] = useState<Array<{ id: string; position: { x: number; y: number } }>>([]);
  const [andGates, setAndGates] = useState<Array<{ id: string; position: { x: number; y: number } }>>([]);
  const [conditions, setConditions] = useState<Array<{ id: string; label: string; position: { x: number; y: number } }>>([]);
  const [connections, setConnections] = useState<Array<{
    id: string;
    parent: string;
    child: string;
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
  }>>([
    {
      id: '1',
      parent: 'event1',
      child: 'orGate1',
      startPosition: { x: 350, y: 50 },
      endPosition: { x: 200, y: 300 }
    }
  ]);
  
  
  const handleAddTopEvent = () => {
    const newTopEvent = { id: "event" + (topEvents.length + 1), label: "System Failure", position: { x: 350, y: 50 + (topEvents.length * 60) } };
    setTopEvents([...topEvents, newTopEvent]);
  };

  const handleAddGate = (gateType: 'AND' | 'OR' | 'NOT') => {
    if (gateType === 'OR'){
      const newGate = { id: `orGate${orGates.length + 1}`, position: { x: 200 + (orGates.length * 100), y: 300 } };
      setOrGates([...orGates, newGate]);
    }
    else if(gateType === 'AND'){
      const newGate = { id: `andGate${andGates.length + 1}`, position: { x: 100 + (andGates.length * 100), y: 200 } };
      setAndGates([...andGates, newGate]);
    }
  };

  const handleAddBasicEvent = () => {
    const newEvent = { id: `basicEvent${basicEvents.length + 1}`, label: "Basic Event", position: { x: 150 + (basicEvents.length * 100), y: 200 } };
    setBasicEvents([...basicEvents, newEvent]);
  };

  const handleAddExternalEvent = () => {
    const newEvent = { id: `externalEvent${externalEvents.length + 1}`, label: "External Event", position: { x: 100 + (externalEvents.length * 100), y: 300 } };
    setExternalEvents([...externalEvents, newEvent]);
  };

  const handleAddCondition = () => {
    const newCondition = { id: `condition${conditions.length + 1}`, label: "New Condition", position: { x: 50 + (conditions.length * 150), y: 200 } };
    setConditions([...conditions, newCondition]);
  };

  var handleDragEnd = (id: string, newPosition: { x: number; y: number }) => {
    const updatedConnections = connections.map(connection => {
      if (connection.parent === id) {
        // If the current connection's parent matches the dragged node, update startPosition
        return { ...connection, startPosition: newPosition };
      } else if (connection.child === id) {
        // If the current connection's child matches the dragged node, update endPosition
        return { ...connection, endPosition: newPosition };
      } else {
        // If the current connection does not involve the dragged node, leave it unchanged
        return connection;
      }
    });
  
    // Update the connections state once with all changes
    setConnections(updatedConnections);
  };
  
  const getNodePositionById = (id: string) => {
    var allElements = [
      ...topEvents,
      ...basicEvents,
      ...externalEvents,
      ...orGates,
      ...andGates,
      ...conditions,
    ];
    var element = allElements.find(element => element.id === id);
    return element ? element.position : null;
  };

  const handleAddConnection = () => {
    /* startSelection();
    if (!isSelecting) 
      return; 
    if (!selectedParent) {
      setSelectedParent(nodeId);
    } else if (selectedParent && !selectedChild && nodeId !== selectedParent) {
      setSelectedChild(nodeId);
      createConnection(selectedParent, nodeId);
      setIsSelecting(false); 
    }; */
  }

  const handleClick = (id: string) => {
    console.log(id);
  };

  const getNodeById = (id: string) => {
    const allElements = [
      ...topEvents,
      ...basicEvents,
      ...externalEvents,
      ...orGates,
      ...andGates,
      ...conditions,
    ];
    const element = allElements.find(element => element.id === id);
    return element ? element : null;
  };

  const findConnectionsByNodeParentId = (id: string) => {
    const relevantConnections = connections.filter(connection => 
      connection.parent === id 
    );
    return relevantConnections;
  };

  const findConnectionsByNodeChildId = (id: string) => {
    const relevantConnections = connections.filter(connection => 
      connection.parent === id 
    );
    return relevantConnections;
  };

  let selectedElementId: string | null = null;

  document.querySelectorAll('.element').forEach(item => {
    item.addEventListener('click', event => {
      const clickedElementId = (event.target as HTMLElement).getAttribute('data-id');
      if (clickedElementId) {
        handleElementClick(clickedElementId);
      }
    });
  });
  
  function handleElementClick(clickedElementId: string): void {
    if (!selectedElementId) {
      selectedElementId = clickedElementId;
      console.log(`Selected element: ${selectedElementId}`);
    } else {
      createConnection(selectedElementId, clickedElementId);
      selectedElementId = null; 
    }
  }
  
  function canCreateConnection(fromId: string, toId: string): boolean {
    if (fromId === toId) {
      alert('Cannot create a connection to the same element.');
      return false;
    }
  
    const exists = connections.some(conn => conn.parent === fromId && conn.child === toId || conn.parent === toId && conn.child === fromId);
    if (exists) {
      alert('Connection already exists.');
      return false;
    }
    return true;
  }
  
  function createConnection(fromId: string, toId: string): void {
    if (canCreateConnection(fromId, toId)) {
      const parentPosition = getNodePositionById(fromId);
      const childPosition = getNodePositionById(toId);
      if (parentPosition && childPosition) {
      const newConnection: LineProps = {
        id: `connection${connections.length + 1}`,
        parent: fromId,
        child: toId,
        startPosition: parentPosition,
        endPosition: childPosition
      };
      connections.push(newConnection);
      console.log('Connection created:', newConnection);
    } else {
      console.log('Cannot create connection.');
    }
   }
 }

 const [selectedElement1, setSelectedElement1] = useState('');
 const [selectedElement2, setSelectedElement2] = useState('');

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // Prevent form submission from reloading the page
  if (selectedElement1 && selectedElement2) {
    createConnection(selectedElement1, selectedElement2);
    setSelectedElement1(''); // Reset selection
    setSelectedElement2(''); // Reset selection
  } else {
    alert('Please select two elements to connect.');
  }
};

  return (
    <div className="app-container">
      <Menu
        onAddTopEvent={handleAddTopEvent}
        onAddGate={handleAddGate}
        onAddBasicEvent={handleAddBasicEvent}
        onAddExternalEvent={handleAddExternalEvent}
        onAddCondition={handleAddCondition}
        onAddConnection={handleAddConnection}
      />
      <form onSubmit={handleSubmit}>
        <select value={selectedElement1} onChange={(e) => setSelectedElement1(e.target.value)}>
          <option value="">Select Element 1</option>
          {[
            ...topEvents,
            ...basicEvents,
            ...externalEvents,
            ...orGates,
            ...andGates,
            ...conditions,
          ].map((element) => (
            <option key={element.id} value={element.id}>{element.id}</option>
          ))}
        </select>

        <select value={selectedElement2} onChange={(e) => setSelectedElement2(e.target.value)}>
          <option value="">Select Element 2</option>
          {[...topEvents,
            ...basicEvents,
            ...externalEvents,
            ...orGates,
            ...andGates,
            ...conditions].map((element) => (
            <option key={element.id} value={element.id}>{element.id}</option>
          ))}
        </select>

        <button type="submit">Create Connection</button>
      </form>
      <h2>Fault Tree Analysis Diagram</h2>
      <div className="diagram-container"> {}
        <svg width="1600" height="800" style={{ border: '2px solid black' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
              refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>
          {topEvents.map(event => (
            <TopEvent key={event.id} id={event.id} label={event.label} position={event.position} onDragEnd={handleDragEnd} />
          ))}
          {basicEvents.map(event => (
            <BasicEvent key={event.id} id={event.id} label={event.label} position={event.position} onDragEnd={handleDragEnd} />
          ))}
          {externalEvents.map(event => (
            <ExternalEvent key={event.id} id={event.id} label={event.label} position={event.position} onDragEnd={handleDragEnd} />
          ))}
          {orGates.map(gate => (
            <OrGate key={gate.id} id={gate.id} position={gate.position} onDragEnd={handleDragEnd} />
          ))}
          {andGates.map(gate => (
            <AndGate key={gate.id} id={gate.id} position={gate.position} onDragEnd={handleDragEnd} />
          ))}
          {conditions.map(condition => (
            <Condition key={condition.id} {...condition} onDragEnd={handleDragEnd} />
          ))}
          {connections.map((connection) => {
            var parentPosition = getNodePositionById(connection.parent);
            var childPosition = getNodePositionById(connection.child);
            if (parentPosition && childPosition) {
               console.log(`Rysuje ${parentPosition.x}, ${parentPosition.y}, ${childPosition.x}, ${childPosition.y}`);  
              return (
                  <svg>
                    <Line
                      id = {connection.id}
                      ref={lineRef}
                      startPosition={connection.startPosition}
                      endPosition={connection.endPosition}
                      parent = {connection.parent}
                      child = {connection.child}
                  />
                  </svg>
                );
             } else {
              console.warn(`Missing position for connection ${connection.id}`);
              return null;
            } 
          })}
        </svg>
      </div>
    </div>
  );
};
export default App;