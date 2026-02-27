import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { ConnectSheetComponent } from '../connect-sheet/connect-sheet.component';
import { SheetIntegration, SheetPreview } from '../../../shared/models';
import { SheetsService } from '../sheets.service';
import { ConfirmModalService } from '../../../shared/confirm-modal/confirm-modal.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { SkeletonComponent } from '../../../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-sheets-list',
  imports: [CommonModule, ConnectSheetComponent, TranslocoModule, SkeletonComponent],
  templateUrl: './sheets-list.component.html',
})
export class SheetsListComponent implements OnInit {
  sheets = signal<SheetIntegration[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  // Preview state
  expandedSheetId = signal<string | null>(null);
  previewData = signal<SheetPreview | null>(null);
  previewLoading = signal(false);

  // Inline rename state
  editingSheetId = signal<string | null>(null);
  editingDisplayName = signal('');

  private readonly sheetsService = inject(SheetsService);
  private readonly confirmModal = inject(ConfirmModalService);
  private readonly toast = inject(ToastService);
  private readonly transloco = inject(TranslocoService);

  ngOnInit(): void {
    this.loadSheets();
  }

  private async loadSheets(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const data = await this.sheetsService.getSheets();
      this.sheets.set(data);
    } catch {
      this.errorMessage.set('sheets.loadError');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteSheet(sheet: SheetIntegration): Promise<void> {
    try {
      const count = await this.sheetsService.getSheetRuleCount(sheet.id);
      const message = count > 0
        ? this.transloco.translate('sheets.deleteConfirmWithRules', { count })
        : this.transloco.translate('sheets.deleteConfirm');

      const confirmed = await this.confirmModal.confirm({
        title: this.transloco.translate('sheets.deleteTitle'),
        message,
        danger: true,
      });

      if (!confirmed) return;

      await this.sheetsService.deleteSheet(sheet.id);
      this.sheets.update((list) => list.filter((s) => s.id !== sheet.id));
      this.toast.success(this.transloco.translate('sheets.deleteSuccess'));
    } catch {
      this.toast.error(this.transloco.translate('sheets.deleteFailed'));
    }
  }

  async togglePreview(sheetId: string): Promise<void> {
    if (this.expandedSheetId() === sheetId) {
      this.expandedSheetId.set(null);
      this.previewData.set(null);
      return;
    }
    this.expandedSheetId.set(sheetId);
    this.previewData.set(null);
    this.previewLoading.set(true);
    try {
      const data = await this.sheetsService.getSheetPreview(sheetId);
      this.previewData.set(data);
    } catch {
      this.toast.error(this.transloco.translate('sheets.previewFailed'));
      this.expandedSheetId.set(null);
    } finally {
      this.previewLoading.set(false);
    }
  }

  onEditSheet(sheet: SheetIntegration): void {
    this.editingSheetId.set(sheet.id);
    this.editingDisplayName.set(sheet.display_name || sheet.sheet_name);
  }

  onCancelEditSheet(): void {
    this.editingSheetId.set(null);
    this.editingDisplayName.set('');
  }

  async onSaveEditSheet(id: string): Promise<void> {
    const name = this.editingDisplayName().trim();
    const displayName = name || null;
    try {
      const updated = await this.sheetsService.renameSheet(id, displayName);
      this.sheets.update((list) =>
        list.map((s) => (s.id === id ? { ...s, display_name: updated.display_name } : s)),
      );
      this.editingSheetId.set(null);
      this.toast.success(this.transloco.translate('sheets.renameSuccess'));
    } catch {
      this.toast.error(this.transloco.translate('sheets.renameFailed'));
    }
  }
}
