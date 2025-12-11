import { useState, useEffect } from "react";
import "./App.css";

import { createAdjlist } from "./Functions";
import type { Blueprint, Node, Form } from "./interfaces";

import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import PrefillModal from "./modal";

type AdjList = {
  adj: Record<string, string[]>;
  nodesById: Record<string, Node>;
};

function App() {
  const [adjList, setAdjList] = useState<AdjList | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const effectiveSelectedFormId = selectedFormId;
  const [showModal, setShowModal] = useState(false);
  const [modalFieldKey, setModalFieldKey] = useState<string | null>(null);

  function callServer(): void {
    fetch("http://localhost:3000/api/v1/123/actions/blueprints/bp_456/graph")
      .then((res) => res.json())
      .then(
        (result: Blueprint) => {
          const built = createAdjlist(result);
          setAdjList(built);
          setForms(result.forms || []);
        },
        (error) => console.log(error)
      );
  }

  useEffect(() => {
    callServer();
  }, []);

  const selectedNode: Node | null =
    effectiveSelectedFormId && adjList
      ? adjList.nodesById[effectiveSelectedFormId]
      : null;

  const selectedForm: Form | null = selectedNode
    ? forms.find((f) => f.id === selectedNode.data.component_id) ?? null
    : null;

  const openModalForField = (fieldKey: string) => {
    setModalFieldKey(fieldKey);
    setShowModal(true);
  };

  const clearMapping = (fieldKey: string) => {
    if (!selectedNode) return;

    setAdjList((prev) => {
      if (!prev) return prev;
      const node = prev.nodesById[selectedNode.id];
      const input_mapping = { ...(node.data.input_mapping || {}) };
      delete input_mapping[fieldKey];

      const updatedNode: Node = {
        ...node,
        data: { ...node.data, input_mapping },
      };

      return {
        ...prev,
        nodesById: {
          ...prev.nodesById,
          [updatedNode.id]: updatedNode,
        },
      };
    });
  };

  const handleSelectFromModal = (
    sourceFormName: string,
    sourceFieldKey: string
  ) => {
    if (!selectedNode || !modalFieldKey) return;

    setAdjList((prev) => {
      if (!prev) return prev;
      const node = prev.nodesById[selectedNode.id];

      const input_mapping = {
        ...(node.data.input_mapping || {}),
        [modalFieldKey]: {
          sourceFormName,
          sourceField: sourceFieldKey,
        },
      };

      const updatedNode: Node = {
        ...node,
        data: { ...node.data, input_mapping },
      };

      return {
        ...prev,
        nodesById: {
          ...prev.nodesById,
          [updatedNode.id]: updatedNode,
        },
      };
    });

    setShowModal(false);
    setModalFieldKey(null);
  };

  useEffect(() => {
    if (adjList && !selectedFormId) {
      const firstNode = Object.values(adjList.nodesById)[0];
      if (firstNode) setSelectedFormId(firstNode.id);
    }
  }, [adjList, selectedFormId]);

  return (
    <>
      <div className="app-container">
        <h1 className="mb-4 text-center">Avantos Graph</h1>

        <ListGroup horizontal className="mb-4 justify-content-center">
          {adjList &&
            Object.values(adjList.nodesById).map((node) => {
              const isSelected = node.id === effectiveSelectedFormId;
              return (
                <ListGroup.Item
                  key={node.id}
                  action
                  onClick={() => setSelectedFormId(node.id)}
                  active={isSelected}
                  className="px-4 py-2 border-0 mx-1 rounded-pill form-tab"
                >
                  {node.data.name}
                </ListGroup.Item>
              );
            })}
        </ListGroup>

        {selectedNode && selectedForm && (
          <div className="prefill-outer">
            <Card className="prefill-card mt-4">
              <Card.Body>
                <div className="d-flex flex-column gap-2">
                  {selectedForm.ui_schema.elements
                    .filter((el) => el.type === "Control")
                    .map((el) => {
                      const key = el.scope.replace("#/properties/", "");
                      const fieldDef =
                        selectedForm.field_schema.properties[key];
                      const label = el.label || fieldDef?.title || key;
                      const mapped =
                        selectedNode.data.input_mapping?.[key] ?? null;

                      return (
                        <div
                          key={key}
                          className="prefill-row d-flex justify-content-between align-items-center"
                          onClick={() => !mapped && openModalForField(key)}
                          style={{
                            cursor: mapped ? "default" : "pointer",
                          }}
                        >
                          {/* Left side */}
                          <div>
                            <div className="prefill-row-label">{label}</div>
                            {!mapped && (
                              <div className="prefill-row-status">
                                Not prefilled
                              </div>
                            )}
                          </div>

                          {mapped && (
                            <div className="d-flex align-items-center gap-3">
                              <span className="prefilled-pill">
                                {mapped.sourceFormName}.{mapped.sourceField}
                              </span>
                              <button
                                className="btn btn-outline-secondary btn-sm rounded-circle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearMapping(key);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {selectedNode && adjList && (
          <PrefillModal
            show={showModal}
            onClose={() => {
              setShowModal(false);
              setModalFieldKey(null);
            }}
            node={selectedNode}
            adjList={adjList}
            forms={forms}
            fieldKey={modalFieldKey}
            onSelect={handleSelectFromModal}
          />
        )}
      </div>
    </>
  );
}

export default App;
