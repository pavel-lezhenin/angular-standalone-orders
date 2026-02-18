import { TestBed } from '@angular/core/testing';
import { FileStorageService } from './file-storage.service';
import { FileRepository } from '../../bff/repositories/file.repository';
import type { FileMetadataDTO } from '../models';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let fileRepoMock: Pick<
    FileRepository,
    'create' | 'getFileUrl' | 'getFileUrls' | 'delete' | 'getById'
  >;

  const makeFile = (name = 'photo.jpg', type = 'image/jpeg'): File =>
    new File(['content'], name, { type, lastModified: Date.now() });

  beforeEach(() => {
    fileRepoMock = {
      create: vi.fn().mockResolvedValue(undefined),
      getFileUrl: vi.fn().mockResolvedValue('blob:http://localhost/123'),
      getFileUrls: vi.fn().mockResolvedValue(new Map()),
      delete: vi.fn().mockResolvedValue(undefined),
      getById: vi.fn().mockResolvedValue(null),
    };

    TestBed.configureTestingModule({
      providers: [
        FileStorageService,
        { provide: FileRepository, useValue: fileRepoMock },
      ],
    });

    service = TestBed.inject(FileStorageService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── uploadFile ───────────────────────────────────────────────────────────

  it('uploadFile creates a record and returns fileId + url + metadata', async () => {
    const file = makeFile();

    const result = await service.uploadFile(file, 'user-1');

    expect(fileRepoMock.create).toHaveBeenCalledTimes(1);
    expect(fileRepoMock.getFileUrl).toHaveBeenCalledTimes(1);

    expect(result.url).toBe('blob:http://localhost/123');
    expect(result.fileId).toBeTruthy();
    expect(result.metadata.filename).toBe('photo.jpg');
    expect(result.metadata.mimetype).toBe('image/jpeg');
    expect(result.metadata.uploadedBy).toBe('user-1');
  });

  it('uploadFile works without an uploadedBy argument', async () => {
    const file = makeFile();

    const result = await service.uploadFile(file);

    expect(result.metadata.uploadedBy).toBeUndefined();
  });

  it('uploadFile throws when getFileUrl returns null', async () => {
    vi.mocked(fileRepoMock.getFileUrl).mockResolvedValue(null);

    const file = makeFile();

    await expect(service.uploadFile(file)).rejects.toThrow(
      'Failed to create object URL for uploaded file'
    );
  });

  it('uploadFile re-throws errors from the repository', async () => {
    vi.mocked(fileRepoMock.create).mockRejectedValue(new Error('DB error'));

    const file = makeFile();

    await expect(service.uploadFile(file)).rejects.toThrow('DB error');
  });

  // ─── getFileUrl ───────────────────────────────────────────────────────────

  it('getFileUrl delegates to FileRepository', async () => {
    vi.mocked(fileRepoMock.getFileUrl).mockResolvedValue('blob:http://localhost/abc');

    const url = await service.getFileUrl('file-id-1');

    expect(fileRepoMock.getFileUrl).toHaveBeenCalledWith('file-id-1');
    expect(url).toBe('blob:http://localhost/abc');
  });

  it('getFileUrl returns null when file does not exist', async () => {
    vi.mocked(fileRepoMock.getFileUrl).mockResolvedValue(null);

    const url = await service.getFileUrl('missing-id');

    expect(url).toBeNull();
  });

  // ─── getFileUrls ──────────────────────────────────────────────────────────

  it('getFileUrls delegates to FileRepository and returns map', async () => {
    const urlMap = new Map([['id-1', 'blob:1'], ['id-2', 'blob:2']]);
    vi.mocked(fileRepoMock.getFileUrls).mockResolvedValue(urlMap);

    const result = await service.getFileUrls(['id-1', 'id-2']);

    expect(fileRepoMock.getFileUrls).toHaveBeenCalledWith(['id-1', 'id-2']);
    expect(result).toBe(urlMap);
  });

  // ─── deleteFile ───────────────────────────────────────────────────────────

  it('deleteFile delegates to FileRepository', async () => {
    await service.deleteFile('file-id-1');

    expect(fileRepoMock.delete).toHaveBeenCalledWith('file-id-1');
  });

  // ─── deleteFiles ──────────────────────────────────────────────────────────

  it('deleteFiles calls deleteFile for each id', async () => {
    await service.deleteFiles(['id-1', 'id-2', 'id-3']);

    expect(fileRepoMock.delete).toHaveBeenCalledTimes(3);
    expect(fileRepoMock.delete).toHaveBeenCalledWith('id-1');
    expect(fileRepoMock.delete).toHaveBeenCalledWith('id-2');
    expect(fileRepoMock.delete).toHaveBeenCalledWith('id-3');
  });

  it('deleteFiles with empty array makes no calls', async () => {
    await service.deleteFiles([]);

    expect(fileRepoMock.delete).not.toHaveBeenCalled();
  });

  // ─── getFileMetadata ──────────────────────────────────────────────────────

  it('getFileMetadata returns metadata when file exists', async () => {
    const storedFile = {
      id: 'file-id-1',
      filename: 'doc.pdf',
      mimetype: 'application/pdf',
      size: 2048,
      blob: new Blob(),
      uploadedAt: 1000,
      uploadedBy: 'admin',
    };
    vi.mocked(fileRepoMock.getById).mockResolvedValue(storedFile as never);

    const metadata = await service.getFileMetadata('file-id-1');

    const expected: FileMetadataDTO = {
      id: 'file-id-1',
      filename: 'doc.pdf',
      mimetype: 'application/pdf',
      size: 2048,
      uploadedAt: 1000,
      uploadedBy: 'admin',
    };
    expect(metadata).toEqual(expected);
  });

  it('getFileMetadata returns null when file does not exist', async () => {
    vi.mocked(fileRepoMock.getById).mockResolvedValue(null);

    const metadata = await service.getFileMetadata('missing-id');

    expect(metadata).toBeNull();
  });

  // ─── fileExists ───────────────────────────────────────────────────────────

  it('fileExists returns true when file is found', async () => {
    vi.mocked(fileRepoMock.getById).mockResolvedValue({ id: 'file-id-1' } as never);

    const exists = await service.fileExists('file-id-1');

    expect(exists).toBe(true);
  });

  it('fileExists returns false when file is not found', async () => {
    vi.mocked(fileRepoMock.getById).mockResolvedValue(null);

    const exists = await service.fileExists('missing-id');

    expect(exists).toBe(false);
  });
});
