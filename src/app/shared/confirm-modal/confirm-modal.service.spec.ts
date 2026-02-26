import { ConfirmModalService } from './confirm-modal.service';

describe('ConfirmModalService', () => {
  let service: ConfirmModalService;

  beforeEach(() => {
    service = new ConfirmModalService();
  });

  it('should start hidden', () => {
    expect(service.visible()).toBe(false);
  });

  it('should show modal and set options on confirm()', () => {
    service.confirm({ title: 'Delete?', message: 'Are you sure?' });
    expect(service.visible()).toBe(true);
    expect(service.options().title).toBe('Delete?');
    expect(service.options().message).toBe('Are you sure?');
  });

  it('should resolve true on accept()', async () => {
    const promise = service.confirm({ title: 'T', message: 'M' });
    service.accept();
    const result = await promise;
    expect(result).toBe(true);
    expect(service.visible()).toBe(false);
  });

  it('should resolve false on cancel()', async () => {
    const promise = service.confirm({ title: 'T', message: 'M' });
    service.cancel();
    const result = await promise;
    expect(result).toBe(false);
    expect(service.visible()).toBe(false);
  });

  it('should support danger option', () => {
    service.confirm({ title: 'T', message: 'M', danger: true });
    expect(service.options().danger).toBe(true);
  });

  it('should support custom button texts', () => {
    service.confirm({ title: 'T', message: 'M', confirmText: 'Yes', cancelText: 'No' });
    expect(service.options().confirmText).toBe('Yes');
    expect(service.options().cancelText).toBe('No');
  });
});
