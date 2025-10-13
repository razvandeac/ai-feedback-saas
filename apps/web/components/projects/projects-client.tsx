"use client";
import { useState } from "react";
import CreateProjectModal from "./create-project-modal";
import ProjectsTable from "./projects-table";

type Project = { id: string; name: string; key: string; created_at: string };

export default function ProjectsClient({ 
  initial, 
  orgSlug 
}: { 
  initial: Project[]; 
  orgSlug: string;
}) {
  const [projects, setProjects] = useState<Project[]>(initial);

  function handleProjectCreated(newProject: Project) {
    setProjects(prev => [newProject, ...prev]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>
        <CreateProjectModal 
          orgSlug={orgSlug} 
          onProjectCreated={handleProjectCreated} 
        />
      </div>
      <ProjectsTable 
        initial={projects} 
        orgSlug={orgSlug}
      />
    </div>
  );
}

