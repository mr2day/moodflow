import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  Bell,
  CalendarDays,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  House,
  LucideAngularModule,
  Settings,
  Sparkles,
  TimerReset,
  Trash2,
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Bell,
        CalendarDays,
        ChartColumn,
        Check,
        ChevronLeft,
        ChevronRight,
        Clock,
        Download,
        House,
        Settings,
        Sparkles,
        TimerReset,
        Trash2,
      }),
    ),
  ],
};
