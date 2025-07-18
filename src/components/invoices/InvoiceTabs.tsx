import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/lib/types/invoice";

interface InvoiceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    draft: number;
    sent: number;
    overdue: number;
    partially_paid: number;
    paid: number;
    cancelled: number;
  };
}

export function InvoiceTabs({ activeTab, onTabChange, counts }: InvoiceTabsProps) {
  const tabs = [
    { id: "all", label: "Toutes", count: counts.all },
    { id: "draft", label: "Brouillons", count: counts.draft },
    { id: "sent", label: "Émises", count: counts.sent },
    { id: "overdue", label: "En retard", count: counts.overdue },
    { id: "partially_paid", label: "Partiellement payées", count: counts.partially_paid },
    { id: "paid", label: "Payées", count: counts.paid },
    { id: "cancelled", label: "Annulées", count: counts.cancelled },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="grid grid-cols-7 w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {tab.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}