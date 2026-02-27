import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { DashboardService, DashboardSummary } from './dashboard.service';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TranslocoModule, SkeletonComponent],
  template: `
    <div class="max-w-5xl mx-auto px-6 py-10">
      <h1 class="text-2xl font-bold text-gray-100 mb-2">
        {{ 'dashboard.title' | transloco }}
      </h1>
      <p class="text-sm text-gray-400 mb-8">
        {{ 'dashboard.welcome' | transloco }}
      </p>

      @if (isLoading()) {
        <app-skeleton [count]="2" />
      } @else if (summary()) {
        <!-- Summary cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <a routerLink="/sheets"
             class="p-5 bg-gray-900/60 border border-white/5 rounded-2xl hover:ring-2 hover:ring-cyan-500 transition-all text-center">
            <p class="text-2xl font-bold text-cyan-400">{{ summary()!.sheets_connected }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ 'dashboard.sheetsConnected' | transloco }}</p>
          </a>
          <a routerLink="/rules"
             class="p-5 bg-gray-900/60 border border-white/5 rounded-2xl hover:ring-2 hover:ring-cyan-500 transition-all text-center">
            <p class="text-2xl font-bold text-green-400">{{ summary()!.health_rules_active }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ 'dashboard.trackerRules' | transloco }}</p>
          </a>
          <a routerLink="/warlord"
             class="p-5 bg-gray-900/60 border border-white/5 rounded-2xl hover:ring-2 hover:ring-cyan-500 transition-all text-center">
            <p class="text-2xl font-bold text-amber-400">{{ summary()!.warlord_rules_active }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ 'dashboard.warlordRules' | transloco }}</p>
          </a>
        </div>

        <!-- Setup checklist -->
        @if (!allSetup()) {
          <div class="mb-8 p-6 bg-gray-900/60 border border-white/5 rounded-2xl">
            <h2 class="text-base font-semibold text-gray-100 mb-1">
              {{ 'dashboard.setupTitle' | transloco }}
            </h2>
            <p class="text-xs text-gray-400 mb-4">
              {{ 'dashboard.setupHint' | transloco }}
            </p>
            <ul class="space-y-3">
              <li class="flex items-center gap-3">
                <span class="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span class="text-sm text-gray-300">{{ 'dashboard.stepGoogle' | transloco }}</span>
              </li>
              <li class="flex items-center gap-3">
                @if (summary()!.has_whatsapp) {
                  <span class="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </span>
                } @else {
                  <span class="w-5 h-5 rounded-full bg-gray-800 shrink-0"></span>
                }
                <a routerLink="/profile" class="text-sm text-cyan-400 hover:underline">{{ 'dashboard.stepWhatsapp' | transloco }}</a>
              </li>
              <li class="flex items-center gap-3">
                @if (summary()!.sheets_connected > 0) {
                  <span class="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </span>
                } @else {
                  <span class="w-5 h-5 rounded-full bg-gray-800 shrink-0"></span>
                }
                <a routerLink="/sheets" class="text-sm text-cyan-400 hover:underline">{{ 'dashboard.stepSheet' | transloco }}</a>
              </li>
              <li class="flex items-center gap-3">
                @if (summary()!.health_rules_active + summary()!.warlord_rules_active > 0) {
                  <span class="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </span>
                } @else {
                  <span class="w-5 h-5 rounded-full bg-gray-800 shrink-0"></span>
                }
                <a routerLink="/rules" class="text-sm text-cyan-400 hover:underline">{{ 'dashboard.stepRule' | transloco }}</a>
              </li>
            </ul>
          </div>
        } @else {
          <div class="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <p class="text-sm text-green-400 font-medium">{{ 'dashboard.allSetup' | transloco }}</p>
          </div>
        }

        <!-- Recent activity count -->
        <div class="p-5 bg-gray-900/60 border border-white/5 rounded-2xl">
          <h2 class="text-base font-semibold text-gray-100 mb-2">
            {{ 'dashboard.recentActivity' | transloco }}
          </h2>
          @if (summary()!.recent_interactions === 0) {
            <p class="text-sm text-gray-400">{{ 'dashboard.noActivity' | transloco }}</p>
          } @else {
            <p class="text-sm text-gray-300">
              {{ 'dashboard.interactionsLogged' | transloco:{ count: summary()!.recent_interactions } }}
            </p>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null);
  isLoading = signal(false);

  private readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.load();
  }

  allSetup(): boolean {
    const s = this.summary();
    if (!s) return false;
    return s.has_whatsapp && s.sheets_connected > 0 && (s.health_rules_active + s.warlord_rules_active) > 0;
  }

  private async load(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.dashboardService.getSummary();
      this.summary.set(data);
    } finally {
      this.isLoading.set(false);
    }
  }
}
