import { useState } from "react";

type Node = {
  id: string;
  name: string;
  children?: Node[];
  technique_id?: string;
};

export default function CategorySelector({
  tree,
  onSelectTechnique,
}: {
  tree: Node[];
  onSelectTechnique: (techId: string) => void;
}) {
  const [level1, setLevel1] = useState<Node | null>(null);
  const [level2, setLevel2] = useState<Node | null>(null);
  const [level3, setLevel3] = useState<Node | null>(null);

  return (
    <div style={{ padding: 12 }}>
      {/* Level 1 */}
      <select
        onChange={(e) => {
          const selected = tree.find(
            (n) => n.id === e.target.value
          );
          setLevel1(selected || null);
          setLevel2(null);
          setLevel3(null);
        }}
      >
        <option>Select Main Category</option>
        {tree.map((node) => (
          <option key={node.id} value={node.id}>
            {node.name}
          </option>
        ))}
      </select>

      {/* Level 2 */}
      {level1?.children && (
        <select
          onChange={(e) => {
            const selected = level1.children?.find(
              (n) => n.id === e.target.value
            );
            setLevel2(selected || null);
            setLevel3(null);
          }}
        >
          <option>Select Sub Category</option>
          {level1.children.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name}
            </option>
          ))}
        </select>
      )}

      {/* Level 3 */}
      {level2?.children && (
        <select
          onChange={(e) => {
            const selected = level2.children?.find(
              (n) => n.id === e.target.value
            );
            setLevel3(selected || null);
          }}
        >
          <option>Select Sub Type</option>
          {level2.children.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name}
            </option>
          ))}
        </select>
      )}

      {/* Technique Level */}
      {level3?.children &&
        level3.children.map((node) => (
          <button
            key={node.id}
            onClick={() =>
              node.technique_id &&
              onSelectTechnique(node.technique_id)
            }
          >
            {node.name}
          </button>
        ))}
    </div>
  );
}
