export interface Node {
  id: string;
  position: { x: number; y: number };
  type: string;
  data: {
    component_id: string;
    component_key: string;
    name: string;
    component_type: string;
    id: string;
    input_mapping?: Record<
      string,
      {
        sourceFormName: string;
        sourceField: string;
      }
    >;
  };
}

export interface Edge {
  source: string;
  target: string;
}

export interface FieldSchemaProperty {
  title?: string;
  avantos_type?: string;
  type: string;
  format?: string;
  enum?: any;
  items?: any;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  is_reusable: boolean;

  field_schema: {
    type: string;
    properties: Record<string, FieldSchemaProperty>;
    required?: string[];
  };

  ui_schema: {
    type: string;
    elements: {
      type: string;
      scope: string;
      label?: string;
      options?: Record<string, any>;
    }[];
  };

  dynamic_field_config?: Record<string, any>;
}

export interface AdjList {
  adj: Record<string, string[]>;
  nodesById: Record<string, Node>;
}

export interface ModalProps {
  show: boolean;
  onClose: () => void;
  node: Node | null;
  adjList: AdjList;
  forms: Form[];
  fieldKey: string | null;
  onSelect: (sourceFormName: string, sourceFieldKey: string) => void;
}

export interface Blueprint {
  nodes: Node[];
  edges: Edge[];
  forms: Form[];
}
