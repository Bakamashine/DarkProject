import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useTabs } from "../contexts/TabsContext";
import TabStrip from "../components/TabStrip";

export default function BasicRedactorLayout() {
  const { project } = useParams<{ project: string }>();
  const { openTab } = useTabs();

  useEffect(() => {
    if (project) openTab(project);
  }, [project, openTab]);

  return (
    <div>
      <TabStrip />
      <Outlet />
    </div>
  );
}
