import { motion } from "framer-motion";
import { ChevronDown, GitBranch } from "lucide-react";
import { useRef, useState } from "react";
import { SettingsComponentRenderer } from "./SettingsComponentRenderer";
import { SettingsNavigation } from "./SettingsNavigation";
import { SettingsSection } from "./ui";
import { useActiveSection } from "../hooks/useActiveSection";
import { useSettingsConfig } from "../hooks/useSettingsConfig";
import useConfigStore from "../state/state-management";
import type { SettingComponentGroup } from "../types/settings-config";
import "./ui/slider-theme.css";

interface SettingsPanelProps {
  mode?: "page" | "modal";
}

function SettingGroup({ group }: { group: SettingComponentGroup }) {
  const [isExpanded, setIsExpanded] = useState(group.defaultExpanded ?? true);

  return (
    <div className="mt-4 border rounded-lg overflow-hidden transition-colors bg-[var(--color-surface-secondary-alpha-10)] border-[var(--color-border-alpha-30)]">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-secondary-alpha-20)] transition-colors"
      >
        <div className="flex-1 text-left">
          <div
            className="font-medium text-sm"
            style={{ color: "var(--color-text)" }}
          >
            {group.groupName}
          </div>
          {group.groupDescription && (
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {group.groupDescription}
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          style={{ color: "var(--color-text-secondary)" }}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[var(--color-border-alpha-20)]">
          {group.components.map((component) => (
            <SettingsComponentRenderer
              key={component.id}
              component={component}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const motionProps = prefersReducedMotion
  ? { initial: "visible", animate: "visible" }
  : { initial: "hidden", animate: "visible" };

export function SettingsPanel({ mode = "page" }: SettingsPanelProps) {
  const settingsConfig = useSettingsConfig();
  const isModal = mode === "modal";

  const visibleBlocks = settingsConfig.filter(
    (block) => !block.condition || block.condition(),
  );

  const sectionIds = visibleBlocks.map((block) => block.id);
  const { activeSection, scrollToSection } = useActiveSection(sectionIds);

  const navigationSections = visibleBlocks.map((block) => ({
    id: block.id,
    name: block.blockName,
    icon: block.icon,
    iconColor: block.iconColor,
  }));

  const actionsClickRef = useRef(0);
  const { setConfig } = useConfigStore();

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === "actions") {
      actionsClickRef.current += 1;
      if (actionsClickRef.current >= 5) {
        setConfig({ devToolsVisible: true });
        actionsClickRef.current = 0;
      } else {
        setTimeout(() => {
          actionsClickRef.current = 0;
        }, 2000);
      }
    }
    scrollToSection(sectionId);
  };

  if (isModal) {
    return (
      <div className="h-full min-h-0 flex gap-6 px-6 py-5">
        <aside className="hidden lg:block w-64 flex-shrink-0 pr-4">
          <SettingsNavigation
            sections={navigationSections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </aside>

        <motion.div
          className="flex-1 min-w-0 min-h-0 overflow-y-auto pr-2"
          variants={containerVariants}
          {...motionProps}
        >
          <div className="space-y-6 pb-4">
            {visibleBlocks.map((block) => (
              <motion.div key={block.id} id={block.id} variants={itemVariants}>
                <SettingsSection
                  icon={block.icon}
                  iconColor={block.iconColor}
                  iconBgColor={block.iconBgColor}
                  variant={block.variant}
                  title={block.blockName}
                  subtitle={block.blockDescription}
                >
                  {block.components?.map((component) => (
                    <SettingsComponentRenderer
                      key={component.id}
                      component={component}
                    />
                  ))}

                  {block.groups?.map((group) => (
                    <SettingGroup key={group.groupName} group={group} />
                  ))}
                </SettingsSection>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">
      <div className="flex gap-8 pb-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <SettingsNavigation
            sections={navigationSections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </aside>

        <motion.div
          className="flex-1 min-w-0"
          variants={containerVariants}
          {...motionProps}
        >
          <div className="space-y-6">
            {visibleBlocks.map((block) => (
              <motion.div key={block.id} id={block.id} variants={itemVariants}>
                <SettingsSection
                  icon={block.icon}
                  iconColor={block.iconColor}
                  iconBgColor={block.iconBgColor}
                  variant={block.variant}
                  title={block.blockName}
                  subtitle={block.blockDescription}
                >
                  {block.components?.map((component) => (
                    <SettingsComponentRenderer
                      key={component.id}
                      component={component}
                    />
                  ))}

                  {block.groups?.map((group) => (
                    <SettingGroup key={group.groupName} group={group} />
                  ))}
                </SettingsSection>
              </motion.div>
            ))}

            <div className="lg:hidden text-center py-6 space-y-1">
              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
              >
                Avoin Lukkari by Juhani Astikainen
              </p>
              <div
                className="flex items-center justify-center gap-1.5 text-xs"
                style={{ color: "var(--color-text-secondary)", opacity: 0.5 }}
              >
                <GitBranch size={12} />
                <span>{__GIT_BRANCH__}</span>
                <span>•</span>
                <a
                  href={`https://github.com/juhanias/lukkarikone/commit/${__GIT_COMMIT_HASH__}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "inherit" }}
                >
                  {__GIT_COMMIT_HASH__}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
