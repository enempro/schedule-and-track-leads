import { Lead } from "@/pages/Dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, GraduationCap, ArrowRight, X, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: string, newStatus: Lead["status"]) => void;
}

export const LeadCard = ({ lead, onStatusChange }: LeadCardProps) => {
  const getAvailableActions = () => {
    const actions: { label: string; status: Lead["status"]; icon: any }[] = [];
    
    if (lead.status !== "scheduled") {
      actions.push({ label: "Move to Scheduled", status: "scheduled", icon: ArrowRight });
    }
    if (lead.status !== "rejected") {
      actions.push({ label: "Move to Rejected", status: "rejected", icon: X });
    }
    if (lead.status !== "open") {
      actions.push({ label: "Move to Open", status: "open", icon: RotateCcw });
    }
    
    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{lead.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-foreground">{lead.course}</span>
        </div>

        {lead.meeting_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(lead.meeting_date), "PPP")}</span>
          </div>
        )}

        {availableActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Move to...
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.status}
                    onClick={() => onStatusChange(lead.id, action.status)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
};
