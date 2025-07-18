import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewType = "day" | "month" | "year";
type Event = {
  id: string;
  title: string;
  time: string;
  location?: string;
  client?: string;
  type: "meeting" | "site_visit" | "intervention" | "deadline";
  date: Date;
};

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Visite chantier Villa Dupont",
    time: "09:00",
    location: "123 Rue de la Paix",
    client: "M. Dupont",
    type: "site_visit",
    date: new Date(2025, 0, 15),
  },
  {
    id: "2",
    title: "Réunion devis appartement",
    time: "14:30",
    location: "Bureau",
    client: "Mme Lambert",
    type: "meeting",
    date: new Date(2025, 0, 15),
  },
  {
    id: "3",
    title: "Intervention plomberie",
    time: "10:00",
    location: "45 Avenue Victor Hugo",
    client: "M. Martin",
    type: "intervention",
    date: new Date(2025, 0, 16),
  },
];

const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");

  const today = new Date();

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (view === "day") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (view === "month") {
      newDate.setMonth(
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
      );
    } else if (view === "year") {
      newDate.setFullYear(
        currentDate.getFullYear() + (direction === "next" ? 1 : -1),
      );
    }

    setCurrentDate(newDate);
  };

  const getDateTitle = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (view === "month") {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      return currentDate.getFullYear().toString();
    }
  };

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(
      (event) => event.date.toDateString() === date.toDateString(),
    );
  };

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
      case "site_visit":
        return "bg-benaya-100 dark:bg-benaya-900/30 text-benaya-800 dark:text-benaya-200 border-benaya-200 dark:border-benaya-700";
      case "intervention":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700";
      case "deadline":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700";
    }
  };

  const renderMonthView = () => {
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    const currentWeekDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentWeekDate);
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = date.toDateString() === today.toDateString();
        const events = getEventsForDate(date);

        days.push(
          <div
            key={date.toISOString()}
            className={cn(
              "min-h-[120px] p-2 border border-neutral-200 dark:border-neutral-700",
              !isCurrentMonth &&
                "bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400",
              isToday && "bg-benaya-50 dark:bg-benaya-900/20",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                isToday && "bg-benaya-900 text-white",
                !isToday &&
                  isCurrentMonth &&
                  "text-neutral-900 dark:text-white",
              )}
            >
              {date.getDate()}
            </div>
            <div className="mt-2 space-y-1">
              {events.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded border",
                    getEventTypeColor(event.type),
                  )}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-75">{event.time}</div>
                </div>
              ))}
              {events.length > 2 && (
                <div className="text-xs text-neutral-500 font-medium">
                  +{events.length - 2} autres
                </div>
              )}
            </div>
          </div>,
        );
        currentWeekDate.setDate(currentWeekDate.getDate() + 1);
      }
      weeks.push(
        <div key={week} className="grid grid-cols-7">
          {days}
        </div>,
      );
    }

    return (
      <div className="space-y-0">
        <div className="grid grid-cols-7 bg-neutral-100 dark:bg-neutral-800">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
            >
              {day}
            </div>
          ))}
        </div>
        {weeks}
      </div>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Time slots */}
        <div className="lg:col-span-3">
          <div className="benaya-card">
            <div className="space-y-0">
              {hours.map((hour) => {
                const hourEvents = events.filter((event) => {
                  const eventHour = parseInt(event.time.split(":")[0]);
                  return eventHour === hour;
                });

                return (
                  <div
                    key={hour}
                    className="flex border-b border-neutral-100 dark:border-neutral-800 min-h-[60px]"
                  >
                    <div className="w-20 p-4 text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    <div className="flex-1 p-4">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-lg border mb-2",
                            getEventTypeColor(event.type),
                          )}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm opacity-75 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                            {event.client && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.client}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events sidebar */}
        <div className="space-y-4">
          <div className="benaya-card">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Événements du jour
            </h3>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      getEventTypeColor(event.type),
                    )}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs opacity-75 mt-1">{event.time}</div>
                    {event.client && (
                      <div className="text-xs opacity-75">{event.client}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 text-center py-4">
                  Aucun événement prévu
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((monthIndex) => {
          const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1);
          const monthEvents = mockEvents.filter(
            (event) =>
              event.date.getFullYear() === currentDate.getFullYear() &&
              event.date.getMonth() === monthIndex,
          );

          return (
            <div
              key={monthIndex}
              className="benaya-card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setCurrentDate(monthDate);
                setView("month");
              }}
            >
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 text-center">
                {monthNames[monthIndex]}
              </h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
                  {monthEvents.length}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  événement{monthEvents.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agenda</h1>
            <p className="text-benaya-100 mt-1">
              Planifiez et gérez vos rendez-vous
            </p>
          </div>
          <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="benaya-card">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white">
              {getDateTitle()}
            </div>
          </div>

          {/* View selector and filters */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>

            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg">
              {(["day", "month", "year"] as ViewType[]).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView(viewType)}
                  className={cn(
                    "rounded-none border-none",
                    view === viewType && "benaya-button-primary",
                  )}
                >
                  {viewType === "day" && "Jour"}
                  {viewType === "month" && "Mois"}
                  {viewType === "year" && "Année"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="benaya-card">
        {view === "month" && renderMonthView()}
        {view === "day" && renderDayView()}
        {view === "year" && renderYearView()}
      </div>
    </div>
  );
}
