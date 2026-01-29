"use client";

/**
 * Organization Chart Page
 * Visual representation of company hierarchy
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ProtectedPage } from "@/components/ProtectedPage";
import type { SafeUser } from "@/lib/permissions/types";

// Types
interface OrgNode {
  user: SafeUser;
  children: OrgNode[];
}

// Icons
const ZoomInIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
  </svg>
);

const ResetIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

// Build tree structure from flat user list
function buildOrgTree(users: SafeUser[]): OrgNode[] {
  const userMap = new Map<number, OrgNode>();
  const roots: OrgNode[] = [];

  // Create nodes for all users
  users.forEach(user => {
    userMap.set(user.id, { user, children: [] });
  });

  // Build tree structure
  users.forEach(user => {
    const node = userMap.get(user.id)!;
    if (user.manager_id && userMap.has(user.manager_id)) {
      userMap.get(user.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children by name
  const sortChildren = (node: OrgNode) => {
    node.children.sort((a, b) => a.user.full_name.localeCompare(b.user.full_name));
    node.children.forEach(sortChildren);
  };
  roots.sort((a, b) => a.user.full_name.localeCompare(b.user.full_name));
  roots.forEach(sortChildren);

  return roots;
}

// Get all node IDs recursively
function getAllNodeIds(nodes: OrgNode[]): Set<number> {
  const ids = new Set<number>();
  const traverse = (nodeList: OrgNode[]) => {
    nodeList.forEach(node => {
      ids.add(node.user.id);
      traverse(node.children);
    });
  };
  traverse(nodes);
  return ids;
}

// Level colors
const levelColors = [
  { bg: "bg-gradient-to-br from-purple-500 to-indigo-600", border: "border-purple-400", light: "bg-purple-50 dark:bg-purple-900/20" },
  { bg: "bg-gradient-to-br from-blue-500 to-cyan-600", border: "border-blue-400", light: "bg-blue-50 dark:bg-blue-900/20" },
  { bg: "bg-gradient-to-br from-emerald-500 to-teal-600", border: "border-emerald-400", light: "bg-emerald-50 dark:bg-emerald-900/20" },
  { bg: "bg-gradient-to-br from-amber-500 to-orange-600", border: "border-amber-400", light: "bg-amber-50 dark:bg-amber-900/20" },
  { bg: "bg-gradient-to-br from-rose-500 to-pink-600", border: "border-rose-400", light: "bg-rose-50 dark:bg-rose-900/20" },
];

// Organization Node Component
interface OrgNodeProps {
  node: OrgNode;
  level: number;
  expandedNodes: Set<number>;
  toggleNode: (id: number) => void;
  language: "en" | "ar";
}

function OrgNodeCard({ node, level, expandedNodes, toggleNode, language }: OrgNodeProps) {
  const { user, children } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedNodes.has(user.id);
  const color = levelColors[level % levelColors.length];

  return (
    <div className="flex flex-col items-center relative">
      {/* Card */}
      <div 
        className={`relative ${color.light} border-2 ${color.border} rounded-2xl shadow-lg p-4 w-[220px] transition-all duration-300 hover:shadow-xl ${hasChildren ? 'cursor-pointer' : ''}`}
        onClick={() => hasChildren && toggleNode(user.id)}
      >
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className={`w-16 h-16 rounded-full object-cover border-4 ${color.border} shadow-md`}
            />
          ) : (
            <div className={`w-16 h-16 rounded-full ${color.bg} flex items-center justify-center shadow-md`}>
              <span className="text-white text-2xl font-bold">
                {user.full_name[0]}
              </span>
            </div>
          )}
          
          {/* Name */}
          <h4 className="text-[var(--foreground)] font-bold text-base mt-3 truncate w-full">
            {language === "ar" && user.full_name_ar ? user.full_name_ar : user.full_name}
          </h4>
          
          {/* Position */}
          {user.position && (
            <p className="text-[var(--primary)] text-sm font-medium truncate w-full">
              {user.position}
            </p>
          )}
          
          {/* Code */}
          <p className="text-[var(--foreground-muted)] text-xs font-mono mt-1">
            {user.code || user.username}
          </p>

          {/* Children count */}
          {hasChildren && (
            <div className={`mt-3 flex items-center gap-1 px-3 py-1 rounded-full ${color.bg} text-white text-xs font-medium`}>
              <span>{children.length} {language === "ar" ? "تابع" : "report"}{children.length > 1 && language !== "ar" ? "s" : ""}</span>
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </div>
          )}
        </div>
      </div>

      {/* Children with connecting lines */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          {/* Vertical line from parent to horizontal line */}
          <div className="w-0.5 h-10 bg-gray-400 dark:bg-gray-500" />
          
          {/* Children container with horizontal line */}
          <div className="relative">
            {/* Horizontal line connecting all children */}
            {children.length > 1 && (
              <div 
                className="absolute top-0 left-0 right-0 flex items-center"
                style={{ height: '2px' }}
              >
                <div 
                  className="h-0.5 bg-gray-400 dark:bg-gray-500 absolute"
                  style={{
                    left: `calc(50% / ${children.length})`,
                    right: `calc(50% / ${children.length})`,
                  }}
                />
              </div>
            )}
            
            <div className="flex gap-8 pt-0">
              {children.map((child, index) => (
                <div key={child.user.id} className="flex flex-col items-center relative">
                  {/* Vertical line from horizontal to child card */}
                  <div className="w-0.5 h-10 bg-gray-400 dark:bg-gray-500" />
                  
                  {/* Horizontal connector at top */}
                  {children.length > 1 && (
                    <div 
                      className="absolute top-0 h-0.5 bg-gray-400 dark:bg-gray-500"
                      style={{
                        left: index === 0 ? '50%' : 0,
                        right: index === children.length - 1 ? '50%' : 0,
                      }}
                    />
                  )}
                  
                  <OrgNodeCard
                    node={child}
                    level={level + 1}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    language={language}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Page Component
function OrgChartContent() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users?activeOnly=false&limit=1000", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch users");
        const result = await response.json();
        const usersData = result.data || result;
        const activeUsers = Array.isArray(usersData) ? usersData.filter((u: SafeUser) => u.is_active) : [];
        setUsers(activeUsers);
        
        // Initially expand all nodes
        const tree = buildOrgTree(activeUsers);
        setExpandedNodes(getAllNodeIds(tree));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleNode = useCallback((id: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedNodes(getAllNodeIds(buildOrgTree(users)));
  }, [users]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const orgTree = buildOrgTree(users);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="theme-btn-primary"
          >
            {language === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {language === "ar" ? "الهيكل التنظيمي" : "Organization Chart"}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === "ar" 
              ? `${users.length} موظف في الهيكل التنظيمي`
              : `${users.length} employees in the organization`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={expandAll}
            className="theme-btn-secondary text-sm"
          >
            {language === "ar" ? "توسيع الكل" : "Expand All"}
          </button>
          <button
            onClick={collapseAll}
            className="theme-btn-secondary text-sm"
          >
            {language === "ar" ? "طي الكل" : "Collapse All"}
          </button>
          <div className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-1">
            <button
              onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
              className="p-2 hover:bg-[var(--hover-bg)] rounded transition-colors"
              title={language === "ar" ? "تصغير" : "Zoom Out"}
            >
              <ZoomOutIcon />
            </button>
            <span className="px-2 text-sm text-[var(--foreground-secondary)] min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
              className="p-2 hover:bg-[var(--hover-bg)] rounded transition-colors"
              title={language === "ar" ? "تكبير" : "Zoom In"}
            >
              <ZoomInIcon />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 hover:bg-[var(--hover-bg)] rounded transition-colors"
              title={language === "ar" ? "إعادة تعيين" : "Reset"}
            >
              <ResetIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="theme-card overflow-auto" style={{ minHeight: '500px' }}>
        {orgTree.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-[var(--foreground-muted)]">
            {language === "ar" ? "لا يوجد موظفين" : "No employees found"}
          </div>
        ) : (
          <div 
            className="p-8 inline-block min-w-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          >
            <div className="flex flex-col items-center gap-12">
              {orgTree.map((rootNode) => (
                <OrgNodeCard
                  key={rootNode.user.id}
                  node={rootNode}
                  level={0}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="theme-card p-4">
        <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
          {language === "ar" ? "دليل المستويات" : "Level Guide"}
        </h3>
        <div className="flex flex-wrap gap-4">
          {levelColors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${color.bg}`} />
              <span className="text-xs text-[var(--foreground-secondary)]">
                {language === "ar" ? `المستوى ${idx + 1}` : `Level ${idx + 1}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="theme-card p-4 text-center">
          <div className="text-2xl font-bold text-[var(--primary)]">{users.length}</div>
          <div className="text-xs text-[var(--foreground-muted)]">
            {language === "ar" ? "إجمالي الموظفين" : "Total Employees"}
          </div>
        </div>
        <div className="theme-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-500">{orgTree.length}</div>
          <div className="text-xs text-[var(--foreground-muted)]">
            {language === "ar" ? "المدراء الرئيسيين" : "Top Managers"}
          </div>
        </div>
        <div className="theme-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-500">
            {users.filter(u => !users.some(o => o.manager_id === u.id)).length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">
            {language === "ar" ? "بدون تابعين" : "No Reports"}
          </div>
        </div>
        <div className="theme-card p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">
            {users.filter(u => users.some(o => o.manager_id === u.id)).length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">
            {language === "ar" ? "لديهم تابعين" : "Has Reports"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrgChartPage() {
  return (
    <ProtectedPage permission="menu.users">
      <OrgChartContent />
    </ProtectedPage>
  );
}
