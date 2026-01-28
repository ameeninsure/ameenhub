"use client";

/**
 * Permissions Management Page
 * View and manage all system permissions
 */

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate } from "@/lib/permissions/client";
import type { Permission } from "@/lib/permissions/types";

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface GroupedPermissions {
  [module: string]: Permission[];
}

// Permission type icons
const TypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactElement> = {
    page: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    api: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    button: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    menu: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    feature: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };

  return icons[type] || icons.feature;
};

export default function PermissionsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [permissions, setPermissions] = useState<GroupedPermissions>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/permissions?groupByModule=true");
      const data = await response.json();
      if (data.success) {
        const grouped: GroupedPermissions = {};
        for (const item of data.data) {
          if (item.module && Array.isArray(item.permissions)) {
            grouped[item.module] = item.permissions;
          }
        }
        setPermissions(grouped);
        setExpandedModules(Object.keys(grouped));
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleToggleModule = (module: string) => {
    setExpandedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  const handleExpandAll = () => {
    setExpandedModules(Object.keys(permissions));
  };

  const handleCollapseAll = () => {
    setExpandedModules([]);
  };

  // Get unique modules and types
  const modules = Object.keys(permissions);
  const allPermissions = Object.values(permissions).flat();
  const types = [...new Set(allPermissions.map((p) => p.category))];

  // Filter permissions
  const filteredPermissions: GroupedPermissions = {};
  Object.entries(permissions).forEach(([module, perms]) => {
    if (selectedModule !== "all" && module !== selectedModule) return;
    if (!Array.isArray(perms)) return;

    const filtered = perms.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.name_ar && p.name_ar.includes(searchQuery));
      const matchesType = selectedType === "all" || p.category === selectedType;
      return matchesSearch && matchesType;
    });

    if (filtered.length > 0) {
      filteredPermissions[module] = filtered;
    }
  });

  // Count total filtered permissions
  const totalFiltered = Object.values(filteredPermissions).reduce(
    (acc, perms) => acc + perms.length,
    0
  );

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t.permissions.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {language === "ar" ? "عرض جميع صلاحيات النظام" : "View all system permissions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExpandAll}
            className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {language === "ar" ? "توسيع الكل" : "Expand All"}
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {language === "ar" ? "طي الكل" : "Collapse All"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.permissions.searchPermissions}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
          </div>

          {/* Module Filter */}
          <div className="relative">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="appearance-none w-full sm:w-48 pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === "ar" ? "جميع الوحدات" : "All Modules"}</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FilterIcon />
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <ChevronDownIcon />
            </span>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none w-full sm:w-40 pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === "ar" ? "جميع الأنواع" : "All Types"}</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FilterIcon />
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {language === "ar"
            ? `${totalFiltered} صلاحية في ${Object.keys(filteredPermissions).length} وحدة`
            : `${totalFiltered} permissions in ${Object.keys(filteredPermissions).length} modules`}
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(filteredPermissions).length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {t.permissions.noPermissions}
          </div>
        ) : (
          Object.entries(filteredPermissions).map(([module, perms]) => (
            <div
              key={module}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Module Header */}
              <button
                onClick={() => handleToggleModule(module)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm uppercase">
                      {module.substring(0, 2)}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 dark:text-white capitalize">
                      {module.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {perms.length} {language === "ar" ? "صلاحية" : "permissions"}
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${expandedModules.includes(module) ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Permissions */}
              {expandedModules.includes(module) && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {perms.map((permission) => (
                    <div
                      key={permission.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 p-2 rounded-lg ${
                              permission.category === "page"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : permission.category === "api"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : permission.category === "button"
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                : permission.category === "menu"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            <TypeIcon type={permission.category} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {language === "ar"
                                ? permission.name_ar || permission.name_en
                                : permission.name_en}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {permission.code}
                            </p>
                            {(permission.description_en || permission.description_ar) && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {language === "ar"
                                  ? permission.description_ar || permission.description_en
                                  : permission.description_en}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              permission.category === "page"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : permission.category === "api"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : permission.category === "button"
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                : permission.category === "menu"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {permission.category}
                          </span>
                          {permission.is_system && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                              {t.permissions.systemPermission}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <PermissionGate permission="permissions.view">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "ar" ? "إجمالي الصلاحيات" : "Total Permissions"}
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {allPermissions.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "ar" ? "الوحدات" : "Modules"}
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {modules.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "ar" ? "صلاحيات النظام" : "System Permissions"}
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {allPermissions.filter((p) => p.is_system).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "ar" ? "أنواع الصلاحيات" : "Permission Types"}
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {types.length}
            </p>
          </div>
        </div>
      </PermissionGate>
    </div>
  );
}
