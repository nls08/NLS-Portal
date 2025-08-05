import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Home,
  FolderOpen,
  CheckSquare,
  Target,
  GitBranch,
  ClipboardCheck,
  RotateCcw,
  Package,
  X,
  CheckCircle,
  Calendar,
  AlertTriangle,
  BarChart3,
  Heart,
  FileTextIcon,
  CircleDollarSign,
  LucideClipboardPaste,
  LucideBadgeAlert,
  LucideBarChart3,
  LucideNotebookText,
  Menu,
  ChevronLeft,
  LucideShieldCheck,
  User,
} from "lucide-react";
import logo from "../../Assets/img/logo.png";
import logo_dark from "../../Assets/img/logo_dark.png";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const isSuperAdmin = user?.publicMetadata?.role === "super-admin";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profileRole } = useApp();
  const { theme } = useTheme();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    ...((profileRole === "super-admin" || profileRole === "admin")
      ? [
        {
          name: "Client Milestones",
          href: "/client-milestones",
          icon: Target,
        },
      ]
      : []),
    { name: "Dev Milestones", href: "/dev-milestones", icon: GitBranch },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "QA", href: "/qa", icon: ClipboardCheck },
    { name: "QA Revision", href: "/qa-revision", icon: LucideBadgeAlert },
    { name: "Deliveries", href: "/deliveries", icon: Package },
    { name: "Attendance", href: "/attendance", icon: Calendar },
    { name: "RedZone", href: "/red-zone", icon: AlertTriangle },
    { name: "KPI", href: "/kpi", icon: LucideNotebookText },
    { name: "Performance", href: "/performance", icon: LucideBarChart3 },
    {
      name: "Feedback",
      href: "/anonymous-feedback",
      icon: LucideClipboardPaste,
    },
    // { name: "Contract", href: "/employee-contract", icon: FileTextIcon },
    {
      name: "Personal To Do",
      href: "/personal-to-do-reminder",
      icon: CheckCircle,
    },
    { name: "Donation", href: "/personal-donation", icon: Heart },
    // { name: "Super Admin", href: "/finance", icon: LucideShieldCheck },
    ...(profileRole === "super-admin"
      ? [
        {
          name: "Super Admin",
          href: "/finance",
          icon: LucideShieldCheck,
        },
      ]
      : []),
    ...(profileRole === "super-admin"
      ? [
        {
          name: "Users Management",
          href: "/pending",
          icon: User,
        },
      ]
      : []),
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isCollapsed ? "w-16" : "w-64"
          } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo_dark} alt="" />{" "}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  } ${isCollapsed ? "justify-center" : ""}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "mr-0" : "mr-3"
                    }`}
                />
                {!isCollapsed && item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
