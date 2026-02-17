"use client";

import { cn } from "@/lib/utils";
import { Department, Role } from "@/lib/types";
import { useMemo } from "react";

interface HierarchyNode {
  id: string;
  name: string;
  description?: string;
  children: HierarchyNode[];
}

function buildHierarchy(
  items: (Department | Role)[],
  parentId: string | null = null
): HierarchyNode[] {
  return items
    .filter((item) => (item.parent_id || null) === parentId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: "description" in item ? item.description : undefined,
      children: buildHierarchy(items, item.id),
    }));
}

function TreeNode({ node }: { node: HierarchyNode }) {
  return (
    <li>
      <div className="node-card border rounded-lg p-3 bg-card shadow-sm min-w-[200px] text-center hover:shadow-md transition-shadow cursor-default z-10 relative bg-background">
        <div className="font-semibold text-sm">{node.name}</div>
        {node.description && (
          <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px] mx-auto">
            {node.description}
          </div>
        )}
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function OrgChartTree({
  items,
  type,
}: {
  items: (Department | Role)[];
  type: "departments" | "roles";
}) {
  const hierarchy = useMemo(() => buildHierarchy(items, null), [items]);

  if (items.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        No {type} found. Add some {type} to see the chart.
      </div>
    );
  }

  return (
    <div className="overflow-auto py-10 px-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <div className="org-tree-container min-w-max mx-auto">
        <ul className="org-tree">
          {hierarchy.map((node) => (
            <TreeNode key={node.id} node={node} />
          ))}
        </ul>
      </div>

      <style jsx global>{`
        .org-tree, .org-tree ul, .org-tree li {
          list-style: none;
          margin: 0;
          padding: 0;
          position: relative;
        }

        .org-tree {
          display: flex;
          justify-content: center;
        }

        .org-tree ul {
          display: flex;
          padding-top: 20px;
          justify-content: center;
        }

        .org-tree li {
          float: left;
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 5px 0 5px;
        }

        /* Connectors */
        .org-tree li::before, .org-tree li::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 1px solid hsl(var(--border));
          width: 50%;
          height: 20px;
        }

        .org-tree li::after {
          right: auto;
          left: 50%;
          border-left: 1px solid hsl(var(--border));
        }

        .org-tree li:only-child::after, .org-tree li:only-child::before {
          display: none;
        }

        .org-tree li:only-child {
          padding-top: 0;
        }

        .org-tree li:first-child::before, .org-tree li:last-child::after {
          border: 0 none;
        }

        .org-tree li:last-child::before {
          border-right: 1px solid hsl(var(--border));
          border-radius: 0 5px 0 0;
        }

        .org-tree li:first-child::after {
          border-radius: 5px 0 0 0;
        }

        .org-tree ul ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 1px solid hsl(var(--border));
          width: 0;
          height: 20px;
        }
      `}</style>
    </div>
  );
}
