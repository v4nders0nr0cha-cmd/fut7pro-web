import { useMemo, useCallback } from "react";
import { NOTIFICATION_TEMPLATES } from "@/constants/notification-templates";
import type { NotificationTemplate } from "@/types/notification-template";

export function useNotificationTemplates() {
  const templates = useMemo(() => NOTIFICATION_TEMPLATES, []);

  const findTemplate = useCallback(
    (id: string | null | undefined) => templates.find((template) => template.id === id),
    [templates]
  );

  const templatesByCategory = useMemo(() => {
    return templates.reduce<Record<string, NotificationTemplate[]>>((groups, template) => {
      const key = template.category;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(template);
      return groups;
    }, {});
  }, [templates]);

  return {
    templates,
    templatesByCategory,
    findTemplate,
  };
}
