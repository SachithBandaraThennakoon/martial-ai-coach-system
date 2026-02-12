import { useState } from "react";

type Node = {
  id: string;
  name: string;
  children?: Node[];
  technique_id?: string;
};

export default function CategoryTree({
  data,
  onSelect,
}: {
  data: Node[];
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ fontSize: 12 }}>
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  onSelect,
}: {
  node: Node;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const hasChildren =
    node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: 6 }}>
      <div
        style={{ cursor: "pointer", padding: "4px 0" }}
        onClick={() => {
          if (hasChildren) setOpen(!open);
          if (node.technique_id)
            onSelect(node.technique_id);
        }}
      >
        {hasChildren && (
          <span>{open ? "▼ " : "▶ "}</span>
        )}
        {node.name}
      </div>

      {open &&
        hasChildren &&
        node.children!.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}
