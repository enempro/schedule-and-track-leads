import { Lead } from "@/pages/Dashboard";
import { LeadCard } from "./LeadCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: Lead["status"]) => void;
}

export const KanbanBoard = ({ leads, onStatusChange }: KanbanBoardProps) => {
  const columns: { status: Lead["status"]; title: string; color: string }[] = [
    { status: "open", title: "Open Leads", color: "border-muted" },
    { status: "scheduled", title: "Scheduled", color: "border-primary" },
    { status: "rejected", title: "Rejected", color: "border-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnLeads = leads.filter((lead) => lead.status === column.status);
        
        return (
          <div
            key={column.status}
            className={`bg-card rounded-xl border-2 ${column.color} shadow-sm`}
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg text-foreground">
                {column.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {columnLeads.length} {columnLeads.length === 1 ? "lead" : "leads"}
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-4 space-y-3">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">
                      No leads in this column
                    </p>
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};
