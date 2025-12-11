import { useEffect, useMemo, useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";
import type { ModalProps, Node, Form } from "./interfaces";
import { getRoots } from "./Functions";

function PrefillModal({
  show,
  onClose,
  node,
  adjList,
  forms,
  fieldKey,
  onSelect,
}: ModalProps) {
  if (!show || !node || !fieldKey) return null;

  // Find ancestor nodes whose underlying form has this fieldKey
  const ancestorPairs = useMemo(() => {
    const ids = getRoots(node.id, adjList.adj);
    const pairs: { node: Node; form: Form }[] = [];

    ids.forEach((id) => {
      const ancestorNode = adjList.nodesById[id];
      if (!ancestorNode) return;

      const form = forms.find((f) => f.id === ancestorNode.data.component_id);
      if (!form) return;

      const props = form.field_schema.properties || {};
      if (!Object.prototype.hasOwnProperty.call(props, fieldKey)) return;

      pairs.push({ node: ancestorNode, form });
    });

    return pairs;
  }, [node, adjList, forms, fieldKey]);

  const [selectedAncestorId, setSelectedAncestorId] = useState<string | null>(
    null
  );

  // Reset selection when node/field changes
  useEffect(() => {
    setSelectedAncestorId(null);
  }, [node.id, fieldKey]);

  // Auto-select first ancestor if none chosen yet
  useEffect(() => {
    if (!selectedAncestorId && ancestorPairs.length > 0) {
      setSelectedAncestorId(ancestorPairs[0].node.id);
    }
  }, [ancestorPairs, selectedAncestorId]);

  if (ancestorPairs.length === 0) {
    return (
      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="prefill-modal-dialog"
        backdropClassName="prefill-modal-backdrop"
      >
        <Modal.Header closeButton>
          <Modal.Title>No available ancestors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          No ancestor forms for this node have a field called "{fieldKey}".
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const currentPair =
    ancestorPairs.find((p) => p.node.id === selectedAncestorId) ||
    ancestorPairs[0];

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      dialogClassName="prefill-modal-dialog"
      backdropClassName="prefill-modal-backdrop"
    >
      <Modal.Header closeButton>
        <Modal.Title>Select data element to map for "{fieldKey}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex" style={{ minHeight: "260px" }}>
          {/* Left: ancestor forms */}
          <div style={{ width: "35%", borderRight: "1px solid #444" }}>
            <div className="mb-2 fw-semibold">Available data</div>
            <ListGroup>
              {ancestorPairs.map(({ node: ancestorNode }) => (
                <ListGroup.Item
                  key={ancestorNode.id}
                  action
                  active={ancestorNode.id === currentPair.node.id}
                  onClick={() => setSelectedAncestorId(ancestorNode.id)}
                >
                  {ancestorNode.data.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Right: same fieldKey from selected ancestor */}
          <div className="flex-grow-1 ps-3">
            <div className="fw-semibold mb-2">{currentPair.node.data.name}</div>
            <ListGroup>
              <ListGroup.Item
                action
                onClick={() => {
                  const sourceFormName = currentPair.node.data.name;
                  onSelect(sourceFormName, fieldKey);
                }}
              >
                {fieldKey}
              </ListGroup.Item>
            </ListGroup>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PrefillModal;
