"use client";

/**
 * Organization Chart Page - Premium Edition
 * An elegant, interactive visualization of company hierarchy
 * Features: 3D effects, Glassmorphism, Animated connections, Advanced interactions
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ProtectedPage } from "@/components/ProtectedPage";
import type { SafeUser } from "@/lib/permissions/types";

// Types
interface OrgNode {
  user: SafeUser;
  children: OrgNode[];
  level: number;
  totalDescendants: number;
}

interface NodePosition {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: number;
  level: number;
}

type ColorTheme = "gradient" | "corporate" | "modern" | "nature";

// Constants
const CARD_WIDTH = 240;
const CARD_HEIGHT = 160;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 90;

// Color Themes
const colorThemes: Record<ColorTheme, Array<{
  primary: string;
  secondary: string;
  light: string;
  lightDark: string;
  border: string;
  gradient: string;
}>> = {
  gradient: [
    { primary: "#8b5cf6", secondary: "#7c3aed", light: "#faf5ff", lightDark: "#1e1b4b", border: "#c4b5fd", gradient: "from-violet-500 to-purple-600" },
    { primary: "#06b6d4", secondary: "#0891b2", light: "#ecfeff", lightDark: "#164e63", border: "#67e8f9", gradient: "from-cyan-500 to-teal-600" },
    { primary: "#10b981", secondary: "#059669", light: "#ecfdf5", lightDark: "#064e3b", border: "#6ee7b7", gradient: "from-emerald-500 to-green-600" },
    { primary: "#f59e0b", secondary: "#d97706", light: "#fffbeb", lightDark: "#451a03", border: "#fcd34d", gradient: "from-amber-500 to-orange-600" },
    { primary: "#ef4444", secondary: "#dc2626", light: "#fef2f2", lightDark: "#450a0a", border: "#fca5a5", gradient: "from-red-500 to-rose-600" },
  ],
  corporate: [
    { primary: "#1e40af", secondary: "#1e3a8a", light: "#eff6ff", lightDark: "#172554", border: "#93c5fd", gradient: "from-blue-700 to-blue-900" },
    { primary: "#0f766e", secondary: "#115e59", light: "#f0fdfa", lightDark: "#134e4a", border: "#5eead4", gradient: "from-teal-700 to-teal-900" },
    { primary: "#4338ca", secondary: "#3730a3", light: "#eef2ff", lightDark: "#1e1b4b", border: "#a5b4fc", gradient: "from-indigo-700 to-indigo-900" },
    { primary: "#0369a1", secondary: "#075985", light: "#f0f9ff", lightDark: "#0c4a6e", border: "#7dd3fc", gradient: "from-sky-700 to-sky-900" },
    { primary: "#6d28d9", secondary: "#5b21b6", light: "#f5f3ff", lightDark: "#2e1065", border: "#c4b5fd", gradient: "from-violet-700 to-violet-900" },
  ],
  modern: [
    { primary: "#e11d48", secondary: "#be123c", light: "#fff1f2", lightDark: "#4c0519", border: "#fda4af", gradient: "from-rose-600 to-pink-700" },
    { primary: "#7c3aed", secondary: "#6d28d9", light: "#f5f3ff", lightDark: "#2e1065", border: "#c4b5fd", gradient: "from-violet-600 to-purple-700" },
    { primary: "#2563eb", secondary: "#1d4ed8", light: "#eff6ff", lightDark: "#1e3a8a", border: "#93c5fd", gradient: "from-blue-600 to-indigo-700" },
    { primary: "#0d9488", secondary: "#0f766e", light: "#f0fdfa", lightDark: "#134e4a", border: "#5eead4", gradient: "from-teal-600 to-cyan-700" },
    { primary: "#ea580c", secondary: "#c2410c", light: "#fff7ed", lightDark: "#431407", border: "#fdba74", gradient: "from-orange-600 to-red-700" },
  ],
  nature: [
    { primary: "#15803d", secondary: "#166534", light: "#f0fdf4", lightDark: "#052e16", border: "#86efac", gradient: "from-green-700 to-emerald-800" },
    { primary: "#0d9488", secondary: "#0f766e", light: "#f0fdfa", lightDark: "#134e4a", border: "#5eead4", gradient: "from-teal-600 to-green-700" },
    { primary: "#65a30d", secondary: "#4d7c0f", light: "#f7fee7", lightDark: "#1a2e05", border: "#bef264", gradient: "from-lime-600 to-green-700" },
    { primary: "#059669", secondary: "#047857", light: "#ecfdf5", lightDark: "#064e3b", border: "#6ee7b7", gradient: "from-emerald-600 to-teal-700" },
    { primary: "#84cc16", secondary: "#65a30d", light: "#f7fee7", lightDark: "#1a2e05", border: "#bef264", gradient: "from-lime-500 to-green-600" },
  ],
};

// Build tree structure with descendant count
function buildOrgTree(users: SafeUser[]): OrgNode[] {
  const userMap = new Map<number, OrgNode>();
  const roots: OrgNode[] = [];

  users.forEach((user) => {
    userMap.set(user.id, { user, children: [], level: 0, totalDescendants: 0 });
  });

  users.forEach((user) => {
    const node = userMap.get(user.id)!;
    if (user.manager_id && userMap.has(user.manager_id)) {
      userMap.get(user.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const setLevelsAndCount = (node: OrgNode, lvl: number): number => {
    node.level = lvl;
    node.children.sort((a, b) => a.user.full_name.localeCompare(b.user.full_name));
    let count = node.children.length;
    node.children.forEach((child) => {
      count += setLevelsAndCount(child, lvl + 1);
    });
    node.totalDescendants = count;
    return count;
  };
  
  roots.sort((a, b) => b.totalDescendants - a.totalDescendants || a.user.full_name.localeCompare(b.user.full_name));
  roots.forEach((root) => setLevelsAndCount(root, 0));

  return roots;
}

// Get all node IDs recursively
function getAllNodeIds(nodes: OrgNode[]): Set<number> {
  const ids = new Set<number>();
  const traverse = (nodeList: OrgNode[]) => {
    nodeList.forEach((node) => {
      ids.add(node.user.id);
      traverse(node.children);
    });
  };
  traverse(nodes);
  return ids;
}

// Calculate subtree width
function getSubtreeWidth(node: OrgNode, expandedNodes: Set<number>): number {
  if (!expandedNodes.has(node.user.id) || node.children.length === 0) {
    return CARD_WIDTH;
  }
  const childrenWidth = node.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child, expandedNodes),
    0
  );
  const gaps = (node.children.length - 1) * HORIZONTAL_SPACING;
  return Math.max(CARD_WIDTH, childrenWidth + gaps);
}

// Calculate all node positions
function calculatePositions(
  nodes: OrgNode[],
  expandedNodes: Set<number>,
  startX: number = 0,
  startY: number = 0
): NodePosition[] {
  const positions: NodePosition[] = [];

  const calculateNode = (
    node: OrgNode,
    x: number,
    y: number,
    parentId?: number
  ): number => {
    const subtreeWidth = getSubtreeWidth(node, expandedNodes);
    const nodeX = x + subtreeWidth / 2 - CARD_WIDTH / 2;

    positions.push({
      id: node.user.id,
      x: nodeX,
      y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      parentId,
      level: node.level,
    });

    if (expandedNodes.has(node.user.id) && node.children.length > 0) {
      let childX = x;
      const childY = y + CARD_HEIGHT + VERTICAL_SPACING;

      node.children.forEach((child) => {
        const childWidth = getSubtreeWidth(child, expandedNodes);
        calculateNode(child, childX, childY, node.user.id);
        childX += childWidth + HORIZONTAL_SPACING;
      });
    }

    return subtreeWidth;
  };

  let currentX = startX;
  nodes.forEach((root) => {
    const width = calculateNode(root, currentX, startY);
    currentX += width + HORIZONTAL_SPACING * 2;
  });

  return positions;
}

// Generate elegant curved path with multiple styles
function generateCurvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: "bezier" | "step" | "arc" = "bezier"
): string {
  if (style === "step") {
    const midY = y1 + (y2 - y1) / 2;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }
  if (style === "arc") {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dr = Math.sqrt(dx * dx + dy * dy);
    return `M ${x1} ${y1} A ${dr} ${dr} 0 0 1 ${x2} ${y2}`;
  }
  const midY = y1 + (y2 - y1) * 0.5;
  const controlOffset = Math.abs(x2 - x1) * 0.1;
  return `M ${x1} ${y1} C ${x1} ${midY - controlOffset}, ${x2} ${midY + controlOffset}, ${x2} ${y2}`;
}

// Organization Card Component
interface OrgCardProps {
  node: OrgNode;
  position: NodePosition;
  isExpanded: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  matchesSearch: boolean;
  language: "en" | "ar";
  isDark: boolean;
  colorTheme: ColorTheme;
  showEmail: boolean;
  showCode: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

function OrgCard({
  node,
  position,
  isExpanded,
  isSelected,
  isHighlighted,
  matchesSearch,
  language,
  isDark,
  colorTheme,
  showEmail,
  showCode,
  onToggle,
  onSelect,
}: OrgCardProps) {
  const { user, children, totalDescendants } = node;
  const hasChildren = children.length > 0;
  const colors = colorThemes[colorTheme];
  const color = colors[node.level % colors.length];
  
  const displayName = language === "ar" && user.full_name_ar ? user.full_name_ar : user.full_name;
  const displayPosition = language === "ar" && user.position_ar ? user.position_ar : user.position;

  const bgColor = isDark ? color.lightDark : color.light;
  const isActive = isSelected || isHighlighted;
  const strokeColor = isActive ? color.primary : matchesSearch ? "#eab308" : isDark ? color.border + "80" : color.border;
  const strokeWidth = isActive || matchesSearch ? 3 : 1.5;
  const glowColor = color.primary + "40";

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      className="org-card transition-all duration-300"
      style={{ cursor: 'pointer' }}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (hasChildren) onToggle();
      }}
    >
      {/* Glow effect for selected/highlighted cards */}
      {(isActive || matchesSearch) && (
        <rect
          x="-6"
          y="-6"
          width={CARD_WIDTH + 12}
          height={CARD_HEIGHT + 12}
          rx="22"
          fill="none"
          stroke={matchesSearch ? "#eab308" : glowColor}
          strokeWidth="4"
          opacity="0.6"
        />
      )}

      {/* Card shadow - layered for depth */}
      <rect
        x="6"
        y="8"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx="18"
        fill={isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.08)"}
      />
      <rect
        x="3"
        y="4"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx="18"
        fill={isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.04)"}
      />

      {/* Card background with gradient */}
      <defs>
        <linearGradient id={`card-bg-${user.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgColor} />
          <stop offset="100%" stopColor={isDark ? color.lightDark : color.light + "dd"} />
        </linearGradient>
        <linearGradient id={`card-header-${user.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color.primary} />
          <stop offset="100%" stopColor={color.secondary} />
        </linearGradient>
      </defs>
      
      <rect
        x="0"
        y="0"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx="18"
        fill={`url(#card-bg-${user.id})`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Glassmorphism overlay */}
      <rect
        x="0"
        y="0"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        rx="18"
        fill={isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)"}
      />

      {/* Top header bar with gradient */}
      <path
        d={`M 18 0 L ${CARD_WIDTH - 18} 0 Q ${CARD_WIDTH} 0 ${CARD_WIDTH} 18 L ${CARD_WIDTH} 8 L 0 8 L 0 18 Q 0 0 18 0`}
        fill={`url(#card-header-${user.id})`}
      />

      {/* Level badge */}
      <g transform={`translate(${CARD_WIDTH - 36}, 18)`}>
        <rect x="0" y="0" width="28" height="20" rx="10" fill={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)"} />
        <text
          x="14"
          y="14"
          textAnchor="middle"
          fill={color.primary}
          fontSize="10"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          L{node.level + 1}
        </text>
      </g>

      {/* Avatar container with ring */}
      <circle cx="45" cy="62" r="35" fill={isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)"} />
      <circle cx="45" cy="62" r="32" fill={isDark ? "#1f2937" : "white"} stroke={color.border} strokeWidth="2" />
      
      {/* Avatar */}
      <clipPath id={`avatar-clip-${user.id}`}>
        <circle cx="45" cy="62" r="28" />
      </clipPath>
      
      {user.avatar_url ? (
        <image
          href={user.avatar_url}
          x="17"
          y="34"
          width="56"
          height="56"
          clipPath={`url(#avatar-clip-${user.id})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <>
          <defs>
            <linearGradient id={`avatar-grad-${user.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.primary} />
              <stop offset="100%" stopColor={color.secondary} />
            </linearGradient>
          </defs>
          <circle cx="45" cy="62" r="28" fill={`url(#avatar-grad-${user.id})`} />
          <text
            x="45"
            y="70"
            textAnchor="middle"
            fill="white"
            fontSize="22"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {displayName[0]}
          </text>
        </>
      )}

      {/* Status indicator with pulse animation */}
      <circle cx="68" cy="82" r="9" fill={isDark ? "#1f2937" : "white"} />
      <circle cx="68" cy="82" r="6" fill="#22c55e">
        <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Name and details */}
      <text
        x="92"
        y="40"
        fill={isDark ? "#f3f4f6" : color.secondary}
        fontSize="14"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {displayName.length > 14 ? displayName.substring(0, 14) + "..." : displayName}
      </text>

      {/* Position badge */}
      {displayPosition && (
        <g transform="translate(92, 48)">
          <rect
            x="0"
            y="0"
            width={Math.min(displayPosition.length * 5.5 + 16, 130)}
            height="18"
            rx="9"
            fill={color.primary + "20"}
          />
          <text
            x="8"
            y="13"
            fill={color.primary}
            fontSize="10"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {displayPosition.length > 18 ? displayPosition.substring(0, 18) + "..." : displayPosition}
          </text>
        </g>
      )}

      {/* Code and email section */}
      <g transform="translate(92, 72)">
        {showCode && (
          <g>
            <rect x="0" y="0" width="60" height="16" rx="4" fill={isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)"} />
            <text
              x="6"
              y="11"
              fill={isDark ? "#94a3b8" : "#64748b"}
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              {user.code || user.username}
            </text>
          </g>
        )}
        
        {showEmail && (
          <g transform={showCode ? "translate(0, 20)" : ""}>
            <path
              d="M0 3h12v8H0V3zm0 0l6 4 6-4"
              fill="none"
              stroke={isDark ? "#64748b" : "#94a3b8"}
              strokeWidth="1"
            />
            <text
              x="16"
              y="9"
              fill={isDark ? "#64748b" : "#94a3b8"}
              fontSize="9"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {user.email.length > 16 ? user.email.substring(0, 16) + "..." : user.email}
            </text>
          </g>
        )}
      </g>

      {/* Team count and expand button */}
      {hasChildren && (
        <g transform={`translate(${CARD_WIDTH / 2 - 40}, ${CARD_HEIGHT - 32})`}>
          <defs>
            <linearGradient id={`btn-grad-${user.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color.primary} />
              <stop offset="100%" stopColor={color.secondary} />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="80"
            height="26"
            rx="13"
            fill={`url(#btn-grad-${user.id})`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            style={{ cursor: 'pointer' }}
          />
          {/* Team icon */}
          <g transform="translate(8, 6)" fill="white" opacity="0.9">
            <circle cx="4" cy="4" r="3" />
            <circle cx="10" cy="4" r="3" />
            <path d="M0 12c0-2 2-4 4-4s4 2 4 4" />
            <path d="M6 12c0-2 2-4 4-4s4 2 4 4" />
          </g>
          <text
            x="40"
            y="17"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {children.length} {isExpanded ? "▲" : "▼"}
          </text>
          {/* Total descendants indicator */}
          {totalDescendants > children.length && (
            <g transform="translate(68, 0)">
              <circle cx="6" cy="6" r="8" fill={isDark ? "#374151" : "white"} stroke={color.border} strokeWidth="1" />
              <text x="6" y="9" textAnchor="middle" fill={color.primary} fontSize="7" fontWeight="bold">
                {totalDescendants}
              </text>
            </g>
          )}
        </g>
      )}
    </g>
  );
}

// Connection Lines Component with multiple styles
interface ConnectionLinesProps {
  positions: NodePosition[];
  expandedNodes: Set<number>;
  isDark: boolean;
  colorTheme: ColorTheme;
  lineStyle: "bezier" | "step" | "arc";
  animated: boolean;
}

function ConnectionLines({ positions, expandedNodes, isDark, colorTheme, lineStyle, animated }: ConnectionLinesProps) {
  const positionMap = new Map(positions.map((p) => [p.id, p]));
  const colors = colorThemes[colorTheme];

  return (
    <g className="connection-lines">
      <defs>
        {/* Dynamic gradients based on color theme */}
        {colors.map((color, idx) => (
          <linearGradient key={`grad-${idx}`} id={`lineGrad-${colorTheme}-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color.border} />
            <stop offset="100%" stopColor={colors[(idx + 1) % colors.length].border} />
          </linearGradient>
        ))}
        
        {/* Animated dash pattern */}
        {animated && (
          <style>
            {`
              .animated-line {
                stroke-dasharray: 8 4;
                animation: dashMove 1s linear infinite;
              }
              @keyframes dashMove {
                to { stroke-dashoffset: -12; }
              }
            `}
          </style>
        )}
      </defs>

      {positions
        .filter((p) => p.parentId && expandedNodes.has(p.parentId))
        .map((childPos) => {
          const parentPos = positionMap.get(childPos.parentId!);
          if (!parentPos) return null;

          const x1 = parentPos.x + CARD_WIDTH / 2;
          const y1 = parentPos.y + CARD_HEIGHT;
          const x2 = childPos.x + CARD_WIDTH / 2;
          const y2 = childPos.y;

          const gradientIdx = parentPos.level % colors.length;
          const color = colors[gradientIdx];

          return (
            <g key={`line-${childPos.id}`}>
              {/* Shadow line */}
              <path
                d={generateCurvedPath(x1, y1 + 3, x2, y2 + 3, lineStyle)}
                fill="none"
                stroke={isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)"}
                strokeWidth="6"
                strokeLinecap="round"
              />
              
              {/* Outer glow line */}
              <path
                d={generateCurvedPath(x1, y1, x2, y2, lineStyle)}
                fill="none"
                stroke={color.primary + "30"}
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Main line */}
              <path
                d={generateCurvedPath(x1, y1, x2, y2, lineStyle)}
                fill="none"
                stroke={`url(#lineGrad-${colorTheme}-${gradientIdx})`}
                strokeWidth="3"
                strokeLinecap="round"
                className={animated ? "animated-line" : ""}
              />

              {/* Start connector */}
              <circle cx={x1} cy={y1} r="6" fill={color.primary} stroke={isDark ? "#1f2937" : "white"} strokeWidth="2">
                {animated && (
                  <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                )}
              </circle>

              {/* End connector */}
              <circle cx={x2} cy={y2} r="5" fill={colors[(gradientIdx + 1) % colors.length].primary} stroke={isDark ? "#1f2937" : "white"} strokeWidth="2" />
            </g>
          );
        })}
    </g>
  );
}

// Settings Panel Component
interface SettingsPanelProps {
  language: "en" | "ar";
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  lineStyle: "bezier" | "step" | "arc";
  setLineStyle: (style: "bezier" | "step" | "arc") => void;
  animatedLines: boolean;
  setAnimatedLines: (animated: boolean) => void;
  showEmail: boolean;
  setShowEmail: (show: boolean) => void;
  showCode: boolean;
  setShowCode: (show: boolean) => void;
  onClose: () => void;
}

function SettingsPanel({
  language,
  colorTheme,
  setColorTheme,
  lineStyle,
  setLineStyle,
  animatedLines,
  setAnimatedLines,
  showEmail,
  setShowEmail,
  showCode,
  setShowCode,
  onClose,
}: SettingsPanelProps) {
  const isRTL = language === "ar";

  const themes: { key: ColorTheme; label: string; labelAr: string }[] = [
    { key: "gradient", label: "Gradient", labelAr: "متدرج" },
    { key: "corporate", label: "Corporate", labelAr: "رسمی" },
    { key: "modern", label: "Modern", labelAr: "مدرن" },
    { key: "nature", label: "Nature", labelAr: "طبیعی" },
  ];

  const lineStyles: { key: "bezier" | "step" | "arc"; label: string; labelAr: string }[] = [
    { key: "bezier", label: "Curved", labelAr: "منحنی" },
    { key: "step", label: "Stepped", labelAr: "پله‌ای" },
    { key: "arc", label: "Arc", labelAr: "قوسی" },
  ];

  return (
    <div className="absolute top-4 right-4 w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-purple-200 dark:border-purple-800 rounded-2xl shadow-2xl overflow-hidden z-20" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isRTL ? "تنظیمات نمایش" : "Display Settings"}
        </h3>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Color Theme */}
        <div>
          <label className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
            {isRTL ? "طرح رنگ" : "Color Theme"}
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.key}
                onClick={() => setColorTheme(theme.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  colorTheme === theme.key
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-slate-700 text-[var(--foreground)] hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {isRTL ? theme.labelAr : theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line Style */}
        <div>
          <label className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
            {isRTL ? "سبک خطوط" : "Line Style"}
          </label>
          <div className="mt-2 flex gap-2">
            {lineStyles.map((style) => (
              <button
                key={style.key}
                onClick={() => setLineStyle(style.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  lineStyle === style.key
                    ? "bg-cyan-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-slate-700 text-[var(--foreground)] hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {isRTL ? style.labelAr : style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[var(--foreground)]">
              {isRTL ? "خطوط متحرک" : "Animated Lines"}
            </span>
            <div
              onClick={() => setAnimatedLines(!animatedLines)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                animatedLines ? "bg-purple-600" : "bg-gray-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${
                  animatedLines ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[var(--foreground)]">
              {isRTL ? "نمایش ایمیل" : "Show Email"}
            </span>
            <div
              onClick={() => setShowEmail(!showEmail)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                showEmail ? "bg-purple-600" : "bg-gray-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${
                  showEmail ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[var(--foreground)]">
              {isRTL ? "نمایش کد" : "Show Code"}
            </span>
            <div
              onClick={() => setShowCode(!showCode)}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                showCode ? "bg-purple-600" : "bg-gray-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${
                  showCode ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Main Content Component
function OrgChartContent() {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings state
  const [colorTheme, setColorTheme] = useState<ColorTheme>("gradient");
  const [lineStyle, setLineStyle] = useState<"bezier" | "step" | "arc">("bezier");
  const [animatedLines, setAnimatedLines] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showCode, setShowCode] = useState(true);

  // Transform state
  const [transform, setTransform] = useState({ x: 100, y: 50, scale: 0.8 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users?activeOnly=false&limit=1000", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const result = await response.json();
        const usersData = result.data || result;
        const activeUsers = Array.isArray(usersData)
          ? usersData.filter((u: SafeUser) => u.is_active)
          : [];
        setUsers(activeUsers);

        // Expand first 2 levels
        const tree = buildOrgTree(activeUsers);
        const initial = new Set<number>();
        tree.forEach((root) => {
          initial.add(root.user.id);
          root.children.forEach((c) => initial.add(c.user.id));
        });
        setExpandedNodes(initial);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Build tree and positions
  const orgTree = useMemo(() => buildOrgTree(users), [users]);
  const positions = useMemo(
    () => calculatePositions(orgTree, expandedNodes, 50, 30),
    [orgTree, expandedNodes]
  );

  // Create node map for quick lookup
  const nodeMap = useMemo(() => {
    const map = new Map<number, OrgNode>();
    const populateNodeMap = (nodes: OrgNode[]) => {
      nodes.forEach((node) => {
        map.set(node.user.id, node);
        populateNodeMap(node.children);
      });
    };
    populateNodeMap(orgTree);
    return map;
  }, [orgTree]);

  // Calculate content bounds
  const contentBounds = useMemo(() => {
    if (positions.length === 0) return { width: 800, height: 600 };
    const maxX = Math.max(...positions.map((p) => p.x + p.width));
    const maxY = Math.max(...positions.map((p) => p.y + p.height));
    return { width: maxX + 100, height: maxY + 100 };
  }, [positions]);

  // Handlers
  const toggleNode = useCallback((id: number) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedNodes(getAllNodeIds(orgTree));
  }, [orgTree]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(2, Math.max(0.2, prev.scale + delta)),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setTransform({ x: 100, y: 50, scale: 0.8 });
  }, []);

  const handleCenter = useCallback(() => {
    const centerX = (containerSize.width - contentBounds.width * transform.scale) / 2;
    setTransform((prev) => ({ ...prev, x: Math.max(centerX, 50), y: 50 }));
  }, [containerSize.width, contentBounds.width, transform.scale]);

  const handlePanStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setIsPanning(true);
      const point = "touches" in e ? e.touches[0] : e;
      setPanStart({ x: point.clientX - transform.x, y: point.clientY - transform.y });
    },
    [transform.x, transform.y]
  );

  const handlePanMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isPanning) return;
      const point = "touches" in e ? e.touches[0] : e;
      setTransform((prev) => ({
        ...prev,
        x: point.clientX - panStart.x,
        y: point.clientY - panStart.y,
      }));
    },
    [isPanning, panStart]
  );

  const handlePanEnd = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(2, Math.max(0.2, prev.scale + delta)),
    }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Highlight path to selected node
  const handleSelectNode = useCallback((id: number | null) => {
    setSelectedNode(id);
    if (id === null) {
      setHighlightedPath(new Set());
      return;
    }
    
    // Build path from root to selected node
    const path = new Set<number>();
    let currentId: number | null = id;
    while (currentId) {
      path.add(currentId);
      const user = users.find((u) => u.id === currentId);
      currentId = user?.manager_id || null;
    }
    setHighlightedPath(path);
  }, [users]);

  // Search - using ref to avoid dependency issues with expandedNodes
  const expandedNodesRef = useRef(expandedNodes);
  expandedNodesRef.current = expandedNodes;

  useEffect(() => {
    if (!searchQuery) {
      setSelectedNode(null);
      setHighlightedPath(new Set());
      return;
    }
    const matched = users.find(
      (u) =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matched) {
      handleSelectNode(matched.id);
      // Expand path to show the matched user
      let currentId: number | null = matched.id;
      const newExpanded = new Set(expandedNodesRef.current);
      let hasChanges = false;
      while (currentId) {
        const user = users.find((u) => u.id === currentId);
        if (user?.manager_id) {
          if (!newExpanded.has(user.manager_id)) {
            newExpanded.add(user.manager_id);
            hasChanges = true;
          }
          currentId = user.manager_id;
        } else break;
      }
      if (hasChanges) {
        setExpandedNodes(newExpanded);
      }
    }
  }, [searchQuery, users, handleSelectNode]);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
            {/* Middle ring */}
            <div className="absolute inset-4 rounded-full border-4 border-cyan-200 dark:border-cyan-900" />
            <div className="absolute inset-4 rounded-full border-4 border-t-cyan-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
            {/* Inner ring */}
            <div className="absolute inset-8 rounded-full border-4 border-emerald-200 dark:border-emerald-900" />
            <div className="absolute inset-8 rounded-full border-4 border-t-emerald-500 animate-spin" style={{ animationDuration: "0.6s" }} />
            {/* Center icon */}
            <div className="absolute inset-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-lg font-medium text-[var(--foreground-muted)]">
            {language === "ar" ? "جارٍ تحميل الهيكل التنظيمي..." : "Loading organization chart..."}
          </p>
          <p className="text-sm text-[var(--foreground-muted)] opacity-60 mt-2">
            {language === "ar" ? "يرجى الانتظار..." : "Please wait..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="theme-btn-primary">
            {language === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {language === "ar" ? "الهيكل التنظيمي" : "Organization Chart"}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1 ml-15">
            {language === "ar"
              ? `${users.length} موظف في المؤسسة`
              : `${users.length} employees in the organization`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "ar" ? "بحث عن موظف..." : "Search employee..."}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] 
                text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]
                focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 w-56 transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={expandAll} className="px-3 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all shadow-sm">
              {language === "ar" ? "توسيع الكل" : "Expand All"}
            </button>
            <button onClick={collapseAll} className="px-3 py-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-all shadow-sm">
              {language === "ar" ? "طي الكل" : "Collapse All"}
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-1 shadow-sm">
            <button onClick={() => handleZoom(-0.15)} className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors" title="Zoom Out">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="px-2 text-sm font-medium text-[var(--foreground-secondary)] min-w-[50px] text-center">
              {Math.round(transform.scale * 100)}%
            </span>
            <button onClick={() => handleZoom(0.15)} className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors" title="Zoom In">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <div className="w-px h-6 bg-[var(--border)]" />
            <button onClick={handleReset} className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors" title="Reset View">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={handleCenter} className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors" title="Center View">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
            <button onClick={toggleFullscreen} className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors" title="Fullscreen">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <div className="w-px h-6 bg-[var(--border)]" />
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600' : 'hover:bg-[var(--hover-bg)]'}`}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl border-2 border-[var(--border)] shadow-2xl ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
        style={{ 
          height: isFullscreen ? "100vh" : "calc(100vh - 280px)", 
          minHeight: "500px",
          background: isDark 
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e293b 75%, #0f172a 100%)" 
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%, #f8fafc 100%)"
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handlePanStart}
        onTouchMove={handlePanMove}
        onTouchEnd={handlePanEnd}
        onWheel={handleWheel}
      >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isDark
              ? `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.1) 1px, transparent 0)`
              : `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Decorative gradient blobs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            language={language}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            lineStyle={lineStyle}
            setLineStyle={setLineStyle}
            animatedLines={animatedLines}
            setAnimatedLines={setAnimatedLines}
            showEmail={showEmail}
            setShowEmail={setShowEmail}
            showCode={showCode}
            setShowCode={setShowCode}
            onClose={() => setShowSettings(false)}
          />
        )}

        {orgTree.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">
            <div className="text-center">
              <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg font-medium">{language === "ar" ? "لا يوجد موظفين" : "No employees found"}</p>
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className={`${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ touchAction: "none" }}
          >
            <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
              {/* Connection lines (rendered first, behind cards) */}
              <ConnectionLines 
                positions={positions} 
                expandedNodes={expandedNodes} 
                isDark={isDark} 
                colorTheme={colorTheme}
                lineStyle={lineStyle}
                animated={animatedLines}
              />

              {/* Cards */}
              {positions.map((pos) => {
                const node = nodeMap.get(pos.id);
                if (!node) return null;

                const matchesSearch =
                  searchQuery &&
                  (node.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    node.user.full_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    node.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    node.user.code?.toLowerCase().includes(searchQuery.toLowerCase()));

                return (
                  <OrgCard
                    key={pos.id}
                    node={node}
                    position={pos}
                    isExpanded={expandedNodes.has(pos.id)}
                    isSelected={selectedNode === pos.id}
                    isHighlighted={highlightedPath.has(pos.id)}
                    matchesSearch={!!matchesSearch}
                    language={language}
                    isDark={isDark}
                    colorTheme={colorTheme}
                    showEmail={showEmail}
                    showCode={showCode}
                    onToggle={() => toggleNode(pos.id)}
                    onSelect={() => handleSelectNode(selectedNode === pos.id ? null : pos.id)}
                  />
                );
              })}
            </g>
          </svg>
        )}

        {/* Mini-map */}
        {orgTree.length > 0 && (
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center px-2">
              <span className="text-[10px] font-semibold text-white">{language === "ar" ? "الخريطة" : "Overview"}</span>
            </div>
            <svg className="mt-6" width="100%" height="calc(100% - 24px)" viewBox={`0 0 ${contentBounds.width} ${contentBounds.height}`} preserveAspectRatio="xMidYMid meet">
              {positions.map((pos) => (
                <rect
                  key={pos.id}
                  x={pos.x}
                  y={pos.y}
                  width={pos.width}
                  height={pos.height}
                  rx="4"
                  fill={selectedNode === pos.id ? "#8b5cf6" : highlightedPath.has(pos.id) ? "#06b6d4" : isDark ? "#475569" : "#cbd5e1"}
                  opacity={highlightedPath.has(pos.id) ? 1 : 0.6}
                />
              ))}
              <rect
                x={-transform.x / transform.scale}
                y={-transform.y / transform.scale}
                width={containerSize.width / transform.scale}
                height={containerSize.height / transform.scale}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="10"
                rx="4"
                opacity="0.8"
              />
            </svg>
          </div>
        )}

        {/* Help tooltip */}
        <div className="absolute bottom-4 left-4 px-4 py-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-[var(--border)] rounded-xl shadow-xl">
          <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">🖱️</span>
              {language === "ar" ? "اسحب للتحريك" : "Drag to pan"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">🔍</span>
              {language === "ar" ? "تمرير للتكبير" : "Scroll to zoom"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">👆</span>
              {language === "ar" ? "انقر مرتين للتوسيع" : "Double-click to expand"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { 
            value: users.length, 
            label: language === "ar" ? "إجمالي الموظفين" : "Total Employees", 
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            from: "from-purple-500", 
            to: "to-violet-600", 
            bg: "from-purple-500/10 to-violet-500/5",
            iconBg: "bg-purple-500"
          },
          { 
            value: orgTree.length, 
            label: language === "ar" ? "المدراء الرئيسيين" : "Top Managers", 
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            ),
            from: "from-cyan-500", 
            to: "to-blue-600", 
            bg: "from-cyan-500/10 to-blue-500/5",
            iconBg: "bg-cyan-500"
          },
          { 
            value: users.filter((u) => !users.some((o) => o.manager_id === u.id)).length, 
            label: language === "ar" ? "بدون تابعين" : "Individual Contributors", 
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            from: "from-emerald-500", 
            to: "to-green-600", 
            bg: "from-emerald-500/10 to-green-500/5",
            iconBg: "bg-emerald-500"
          },
          { 
            value: Math.max(0, ...positions.map((p) => nodeMap.get(p.id)?.level ?? 0)) + 1, 
            label: language === "ar" ? "مستويات التنظيم" : "Organization Levels", 
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ),
            from: "from-amber-500", 
            to: "to-orange-600", 
            bg: "from-amber-500/10 to-orange-500/5",
            iconBg: "bg-amber-500"
          },
        ].map((stat, idx) => (
          <div key={idx} className={`theme-card p-4 bg-gradient-to-br ${stat.bg} border-0`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.from} ${stat.to} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--foreground-muted)] mt-1 font-medium">{stat.label}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center text-white shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected user panel */}
      {selectedNode && (() => {
        const user = users.find((u) => u.id === selectedNode);
        if (!user) return null;
        const manager = user.manager_id ? users.find((u) => u.id === user.manager_id) : null;
        const reports = users.filter((u) => u.manager_id === user.id);
        const displayName = language === "ar" && user.full_name_ar ? user.full_name_ar : user.full_name;
        const displayPosition = language === "ar" && user.position_ar ? user.position_ar : user.position;
        const colors = colorThemes[colorTheme];
        const nodeLevel = nodeMap.get(selectedNode)?.level ?? 0;
        const color = colors[nodeLevel % colors.length];

        return (
          <div className="theme-card p-6 relative border-2 shadow-2xl overflow-hidden" style={{ borderColor: color.border }}>
            {/* Background gradient */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{ background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})` }}
            />
            
            <div className="flex flex-col md:flex-row gap-6 relative">
              {/* Main info */}
              <div className="flex items-center gap-5">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.avatar_url} 
                    alt={displayName} 
                    className="w-24 h-24 rounded-2xl object-cover shadow-xl ring-4"
                    style={{ '--tw-ring-color': color.border } as React.CSSProperties}
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl ring-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                      '--tw-ring-color': color.border
                    } as React.CSSProperties}
                  >
                    <span className="text-white text-4xl font-bold">{displayName[0]}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">{displayName}</h3>
                  {displayPosition && (
                    <p className="font-semibold mt-1" style={{ color: color.primary }}>{displayPosition}</p>
                  )}
                  <p className="text-[var(--foreground-muted)] text-sm mt-1">{user.email}</p>
                  {user.phone && <p className="text-[var(--foreground-muted)] text-sm" dir="ltr">{user.phone}</p>}
                  {user.code && (
                    <span 
                      className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: color.primary + "15", color: color.primary }}
                    >
                      {user.code}
                    </span>
                  )}
                </div>
              </div>

              {/* Manager */}
              {manager && (
                <div className="md:border-l-2 border-t-2 md:border-t-0 md:pl-6 pt-4 md:pt-0" style={{ borderColor: color.border + "40" }}>
                  <h4 className="text-sm font-semibold text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {language === "ar" ? "المدير" : "Reports To"}
                  </h4>
                  <div 
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:shadow-md"
                    style={{ backgroundColor: color.primary + "10" }}
                    onClick={() => handleSelectNode(manager.id)}
                  >
                    {manager.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={manager.avatar_url} alt={manager.full_name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})` }}
                      >
                        <span className="text-white font-bold">{manager.full_name[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">
                        {language === "ar" && manager.full_name_ar ? manager.full_name_ar : manager.full_name}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {language === "ar" && manager.position_ar ? manager.position_ar : manager.position}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reports */}
              {reports.length > 0 && (
                <div className="md:border-l-2 border-t-2 md:border-t-0 md:pl-6 pt-4 md:pt-0 flex-1" style={{ borderColor: color.border + "40" }}>
                  <h4 className="text-sm font-semibold text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {language === "ar" ? `التابعين (${reports.length})` : `Direct Reports (${reports.length})`}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {reports.slice(0, 6).map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
                        style={{ backgroundColor: color.primary + "10" }}
                        onClick={() => handleSelectNode(report.id)}
                      >
                        {report.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={report.avatar_url} alt={report.full_name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})` }}
                          >
                            <span className="text-white text-xs font-bold">{report.full_name[0]}</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {language === "ar" && report.full_name_ar ? report.full_name_ar : report.full_name}
                        </span>
                      </div>
                    ))}
                    {reports.length > 6 && (
                      <span 
                        className="self-center px-3 py-2 text-sm font-medium rounded-xl"
                        style={{ backgroundColor: color.primary + "10", color: color.primary }}
                      >
                        +{reports.length - 6} {language === "ar" ? "آخرين" : "more"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Close */}
              <button
                onClick={() => handleSelectNode(null)}
                className="absolute top-0 right-0 p-2 rounded-xl transition-colors"
                style={{ backgroundColor: color.primary + "10" }}
              >
                <svg className="w-5 h-5" style={{ color: color.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })()}
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
